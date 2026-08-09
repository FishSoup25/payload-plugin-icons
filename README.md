# payload-plugin-icons

An icon picker field for Payload 3. It stores an icon as `{ provider, name }` and includes a client component for rendering the stored value.

## Features

- Lucide and Phosphor icon providers
- Searchable, paginated admin picker
- Provider and icon preview in collection cells
- Typed field data and React rendering component
- Custom provider support

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

`Icon` is a Client Component because providers are resolved in the browser.

```tsx
'use client'

import type { IconData } from 'payload-plugin-icons'
import { Icon } from 'payload-plugin-icons/client'

export function FeatureIcon({ icon }: { icon?: IconData | null }) {
  return <Icon aria-hidden className="feature-icon" icon={icon} size={24} />
}
```

SVG props are passed to the selected icon. Phosphor's `weight` prop is also supported.

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

A provider needs server metadata and a client factory. The client factory must resolve components synchronously from an eager import; per-icon lazy imports can create hundreds of requests while the picker is open.

```tsx
// icons/client.tsx
'use client'

import * as CustomIcons from '@acme/icon-library'
import {
  IconCell,
  Icon,
  IconSelectField,
  registerIconProviderClientFactory,
} from 'payload-plugin-icons/client'

registerIconProviderClientFactory('custom', (id, label) => ({
  id,
  label,
  getIconNames: () => ['Home'],
  getCategoryMap: () => ({ Home: ['Home'] }),
  getCategoryRepresentative: (category) => category,
  resolveIconComponent: (name) =>
    name === 'Home' ? CustomIcons.Home : null,
}))

export { Icon, IconCell, IconSelectField }
```

Point `packageImport` at a package or alias whose `/client` export is the module above, then register the same provider id on the server:

```ts
const { iconField, iconPlugin } = createIconPlugin({
  packageImport: '@acme/icons',
  providers: [{ id: 'custom', label: 'Custom icons' }],
})
```

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
