# payload-plugin-icons

[Payload 3](https://payloadcms.com) plugin: pick icons in the admin (Lucide and Phosphor included), store `{ provider, name }`, and render them on the site with a small `Icon` component.

## Install

```bash
npm install payload-plugin-icons lucide-react @phosphor-icons/react
```

Requires Payload **^3.37**, React **≥19**, and the icon libraries above as peers.

## Configure

Use `createIconPlugin` so the field and plugin share the same provider list. Set `packageImport` to this package’s name (or your monorepo alias).

```ts
import { buildConfig } from 'payload'
import {
  createIconPlugin,
  lucideProvider,
  phosphorProvider,
} from 'payload-plugin-icons'

const { iconField, iconPlugin } = createIconPlugin({
  packageImport: 'payload-plugin-icons',
  providers: [lucideProvider(), phosphorProvider()],
})

export default buildConfig({
  plugins: [iconPlugin],
  collections: [
    /* ... */
    {
      fields: [
        iconField({
          name: 'icon',
          label: 'Icon',
        }),
      ],
    },
  ],
})
```

## Frontend

```tsx
'use client'

import { Icon } from 'payload-plugin-icons/client'
import type { IconData } from 'payload-plugin-icons'

export function Hero({ icon }: { icon?: IconData | null }) {
  return <Icon icon={icon} className="size-6" />
}
```

Admin-only UI lives under `payload-plugin-icons/client` (`IconSelectField`, `IconCell`, etc.).

### Custom icon providers

Register client factories with `registerIconProviderClientFactory` (see `src/providers/registry.ts`). Implement `IconProviderClient.resolveIconComponent` using an **eager** module graph — for example `import * as Icons from 'your-pack'` or statically resolvable components. **Do not** wrap each icon in `React.lazy(() => import(...))` or otherwise load one async chunk per icon: the admin picker renders many previews at once, which can overwhelm reverse proxies with hundreds of simultaneous `/_next/static/chunks/...` requests. Built-in Lucide uses a single `import * as LucideReact from 'lucide-react'` lookup; Phosphor uses a namespace import of `@phosphor-icons/react`.

## Package exports

| Import path | Purpose |
|-------------|---------|
| `payload-plugin-icons` | `createIconPlugin`, `iconPlugin`, `iconField`, providers, types |
| `payload-plugin-icons/client` | Admin components + `Icon` for the browser |
| `payload-plugin-icons/providers/lucide` | Lucide provider only |
| `payload-plugin-icons/providers/phosphor` | Phosphor provider only |

## Develop this repo

Clone, copy `dev/.env.example` → `dev/.env` (Postgres + `PAYLOAD_SECRET`), then `npm install` and `npm run dev` (admin at [http://localhost:2515](http://localhost:2515)).

Built output is committed under `dist/` (no build runs on `npm install`). After clone, run `npm run install:hooks` once if you want a Git pre-push hook that runs `npm run clean && npm run build` before every push. CI also checks that `dist/` matches a fresh build.
