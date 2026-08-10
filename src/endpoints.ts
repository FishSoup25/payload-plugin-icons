import type { Endpoint } from 'payload'

import type { IconProvider, IconRequest } from './providers/types.js'

import { isSerializedIcon } from './providers/serverUtils.js'

const MAX_BATCH_SIZE = 100
const MAX_NAME_LENGTH = 200
const json = (body: unknown, status = 200): Response => Response.json(body, {
  headers: { 'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-store' },
  status,
})

function providerIdFromURL(url: string): string {
  const parts = new URL(url).pathname.split('/').filter(Boolean)
  const marker = parts.lastIndexOf('payload-icons')
  return marker >= 0 ? decodeURIComponent(parts[marker + 1] ?? '') : ''
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export function createIconEndpoints(providers: IconProvider[]): Endpoint[] {
  const byId = new Map(providers.map((provider) => [provider.id, provider]))
  const getProvider = (url: string): IconProvider | undefined => byId.get(providerIdFromURL(url))

  return [
    {
      async handler(req) {
        const provider = getProvider(req.url ?? '')
        if (!provider) {return json({ error: 'Unknown icon provider' }, 404)}
        try {
          return json(await provider.loadCatalog())
        } catch {
          return json({ error: 'Unable to load icon catalog' }, 500)
        }
      },
      method: 'get',
      path: '/payload-icons/:provider/catalog',
    },
    {
      async handler(req) {
        const provider = getProvider(req.url ?? '')
        if (!provider) {return json({ error: 'Unknown icon provider' }, 404)}
        const contentLength = Number(req.headers.get('content-length') ?? 0)
        if (contentLength > 32_768) {return json({ error: 'Request is too large' }, 413)}
        let body: unknown
        try {
          if (!req.json) {return json({ error: 'Invalid JSON body' }, 400)}
          body = await req.json()
        } catch {
          return json({ error: 'Invalid JSON body' }, 400)
        }
        if (!isRecord(body) || !Array.isArray(body.names)) {
          return json({ error: 'names must be an array' }, 400)
        }
        if (!body.names.every((name): name is string => typeof name === 'string')) {
          return json({ error: 'names must contain strings' }, 400)
        }
        const names = [...new Set(body.names)]
        if (names.length === 0 || names.length > MAX_BATCH_SIZE || names.some((name) =>
          name.length === 0 || name.length > MAX_NAME_LENGTH
        )) {return json({ error: `names must contain 1-${MAX_BATCH_SIZE} valid icon names` }, 400)}
        if (body.weight !== undefined && typeof body.weight !== 'string') {
          return json({ error: 'weight must be a string' }, 400)
        }
        try {
          const catalog = await provider.loadCatalog()
          const validNames = new Set(catalog.icons.map(({ name }) => name))
          if (names.some((name) => !validNames.has(name))) {
            return json({ error: 'Request contains an unknown icon name' }, 400)
          }
          if (body.weight && !catalog.weights?.includes(body.weight)) {
            return json({ error: 'Request contains an invalid weight' }, 400)
          }
          const request: IconRequest = {
            names,
            weight: body.weight,
          }
          const icons = await provider.loadIcons(request)
          if (Object.entries(icons).some(([name, icon]) =>
            !names.includes(name) || !isSerializedIcon(icon)
          )) {
            return json({ error: 'Provider returned an invalid SVG definition' }, 500)
          }
          return json(icons)
        } catch {
          return json({ error: 'Unable to load icons' }, 500)
        }
      },
      method: 'post',
      path: '/payload-icons/:provider/icons',
    },
  ]
}
