# payload-plugin-icons

An icon picker field for Payload 3. It stores `{ provider, name }`, discovers icons from the provider versions installed in your app, and renders provider-neutral serialized SVGs.

## Sponsor

<div align="center">

<a href="https://brainybuilds.com/" target="_blank" rel="noopener noreferrer"><img src="https://brainybuilds.com/favicon.svg" alt="BrainyBuilds" width="42" height="42" /></a>

`payload-plugin-icons` is sponsored by [BrainyBuilds](https://brainybuilds.com/). Thank you for supporting the project!

</div>

## Features

- Lucide and Phosphor icon providers
- Searchable, paginated admin picker
- Provider and icon preview in collection cells
- Typed field data and React rendering component
- Server-side custom provider support
- No Lucide or Phosphor modules in admin or frontend client bundles
- Batched, cached picker previews

## Installation

```bash
npm install payload-plugin-icons lucide-react @phosphor-icons/react
```

Requirements: Payload `^3.37.0`, React 19, Lucide React `>=0.400.0`, and Phosphor React `>=2.0.0`.

## Configuration

```ts
import { buildConfig } from 'payload'
import { createIconPlugin } from 'payload-plugin-icons'

const { iconField, iconPlugin } = createIconPlugin()

export default buildConfig({
  plugins: [iconPlugin],
  collections: [
    {
      slug: 'pages',
      fields: [
        iconField({
          name: 'icon',
          label: 'Icon',
          required: false,
        }),
      ],
    },
  ],
})
```

Configure `next.config` so provider packages are loaded natively only when an icon endpoint runs. (Lucide uses Node runtime loading because Next optimizes it by default; other providers are added to `serverExternalPackages`.)

```ts
import { withPayload } from '@payloadcms/next/withPayload'
import { withPayloadIcons } from 'payload-plugin-icons'

const nextConfig = {}

export default withPayload(
  withPayloadIcons(nextConfig),
  { devBundleServerPackages: false },
)
```

`packageImport` defaults to `payload-plugin-icons`. Set it when the package is exposed through a different monorepo alias:

```ts
createIconPlugin({ packageImport: '@acme/payload-icons' })
```

After changing the field configuration, regenerate Payload's import map and types:

```bash
payload generate:importmap
payload generate:types
```

## Rendering an icon

`Icon` is a Client Component. It fetches a small serialized SVG definition from the plugin endpoint; provider packages stay on the server. Requests mounted in the same turn are automatically batched and definitions are shared in a module-level cache.

```tsx
'use client'

import type { IconData } from 'payload-plugin-icons'
import { Icon } from 'payload-plugin-icons/client'

export function FeatureIcon({ icon }: { icon?: IconData | null }) {
  return <Icon aria-hidden className="feature-icon" icon={icon} size={24} />
}
```

SVG props and event handlers are applied to the outer `<svg>`. Phosphor's `weight` is included in the request and cache key.

## Customization

Use a subset of the built-in providers or change their labels:

```ts
import { createIconPlugin, lucideProvider } from 'payload-plugin-icons'

const { iconField, iconPlugin } = createIconPlugin({
  providers: [lucideProvider({ label: 'Interface icons' })],
})
```

Field options:

- `name`: stored field name
- `label`: admin label
- `required`: require an icon name
- `defaultProviderId`: provider selected for new documents
- `providerIds`: provider subset for this field
- `labelsById`: field-specific provider labels
- `packageImport`: field-specific package name or alias
- `admin`: additional Payload field admin options

### Custom providers

A custom provider implements the server-only `IconProvider` contract. Keep its package import inside `loadCatalog` / `loadIcons`, serialize only validated names from your catalog, and add the package name to `withPayloadIcons`.

```ts
import type { IconProvider } from 'payload-plugin-icons'
import { createIconPlugin, serializeIconComponent } from 'payload-plugin-icons'

const customProvider: IconProvider = {
  id: 'custom',
  label: 'Custom',
  packageName: '@acme/icon-library',
  async loadCatalog() {
    return { provider: this.id, version: '1', icons: [{ name: 'Home' }] }
  },
  async loadIcons({ names }) {
    const icons = await import('@acme/icon-library')
    return Object.fromEntries(names.flatMap((name) =>
      name === 'Home' ? [[name, serializeIconComponent(icons.Home)]] : [],
    ))
  },
}

const { iconField, iconPlugin } = createIconPlugin({
  providers: [customProvider],
})
```

Call `withPayloadIcons(nextConfig, ['@acme/icon-library'])` for this provider.

## Development

```bash
npm ci
npm run dev
```

The development app uses a local SQLite database at `dev/payload.db`, so no external database is required. You can optionally copy `dev/.env.example` to `dev/.env` to set `PAYLOAD_SECRET` or override `DATABASE_URL`. The development admin runs at `http://localhost:2515`.

Useful commands:

- `npm run check`: lint and create a clean package build
- `npm run generate:importmap`: regenerate the development import map
- `npm run generate:types`: regenerate development Payload types
- `npm run build:next`: build the development application

`dist` is committed and verified in CI.

## License

MIT
