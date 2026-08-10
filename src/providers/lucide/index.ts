import type { IconCatalog, IconProvider } from '../types.js'

import { getPackageVersion, isIconComponent, loadPackageModule, pascalToKebab, serializeIconComponent } from '../serverUtils.js'

type IconModule = Record<string, unknown>
let modulePromise: Promise<IconModule> | undefined
let catalogPromise: Promise<{ catalog: IconCatalog; exportsByName: Map<string, string> }> | undefined

function loadModule(): Promise<IconModule> {
  modulePromise ??= loadPackageModule('lucide-react') as Promise<IconModule>
  return modulePromise
}

async function loadBaseCatalog(): Promise<{ catalog: IconCatalog; exportsByName: Map<string, string> }> {
  catalogPromise ??= (async () => {
    const mod = await loadModule()
    const exportsByName = new Map<string, string>()
    for (const key of Object.keys(mod).sort()) {
      // Lucide also exports the lower-case createLucideIcon factory. It is not an icon component.
      if (!/^[A-Z].*Icon$/.test(key) || !isIconComponent(mod[key])) {continue}
      const name = pascalToKebab(key.slice(0, -4))
      if (name) {exportsByName.set(name, key)}
    }
    return {
      catalog: {
        icons: [...exportsByName.keys()].sort().map((name) => ({
          name,
          category: name.split('-')[0],
        })),
        provider: 'lucide',
        version: getPackageVersion('lucide-react'),
      },
      exportsByName,
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
      const { catalog } = await loadBaseCatalog()
      return { ...catalog, provider: id }
    },
    async loadIcons(request) {
      const [{ exportsByName }, mod] = await Promise.all([loadBaseCatalog(), loadModule()])
      const icons: Record<string, ReturnType<typeof serializeIconComponent>> = {}
      for (const name of request.names) {
        const key = exportsByName.get(name)
        const Component = key ? mod[key] : undefined
        if (isIconComponent(Component)) {icons[name] = serializeIconComponent(Component)}
      }
      return icons
    },
    packageName: 'lucide-react',
  }
}
