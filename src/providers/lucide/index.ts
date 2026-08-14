import type { IconCatalog, IconProvider } from '../types.js'

import { getPackageVersion, isIconComponent, loadPackageModule, serializeIconComponent } from '../serverUtils.js'

type IconLoader = () => Promise<{ default: unknown }>
type IconLoaders = Record<string, IconLoader>
let loadersPromise: Promise<IconLoaders> | undefined
let catalogPromise: Promise<IconCatalog> | undefined

async function loadIconLoaders(): Promise<IconLoaders> {
  loadersPromise ??= (async () => {
    const mod = await loadPackageModule('lucide-react/dynamicIconImports.mjs')
    const loaders = mod.default
    if (!loaders || typeof loaders !== 'object' || Array.isArray(loaders) ||
      Object.values(loaders).some((loader) => typeof loader !== 'function')) {
      throw new Error('Lucide dynamic icon imports are unavailable')
    }
    return loaders as IconLoaders
  })()
  return loadersPromise
}

async function loadBaseCatalog(): Promise<IconCatalog> {
  catalogPromise ??= (async () => {
    const loaders = await loadIconLoaders()
    return {
      icons: Object.keys(loaders).sort().map((name) => ({
        name,
        category: name.split('-')[0],
      })),
      provider: 'lucide',
      version: getPackageVersion('lucide-react'),
    }
  })()
  return catalogPromise
}

export function lucideProvider(overrides?: Partial<Pick<IconProvider, 'id' | 'label'>>): IconProvider {
  const id = overrides?.id ?? 'lucide'
  return {
    id,
    label: overrides?.label ?? 'Lucide',
    async loadCatalog() {
      const catalog = await loadBaseCatalog()
      return { ...catalog, provider: id }
    },
    async loadIcons(request) {
      const loaders = await loadIconLoaders()
      const icons: Record<string, ReturnType<typeof serializeIconComponent>> = {}
      await Promise.all(request.names.map(async (name) => {
        const loader = loaders[name]
        if (!loader) {return}
        const { default: Component } = await loader()
        if (isIconComponent(Component)) {icons[name] = serializeIconComponent(Component)}
      }))
      return icons
    },
    packageName: 'lucide-react',
  }
}
