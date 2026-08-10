import type { IconCatalog, IconProvider } from '../types.js'

import { getPackageVersion, isIconComponent, loadPackageModule, serializeIconComponent } from '../serverUtils.js'

const WEIGHTS = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone']
type IconModule = Record<string, unknown>
let modulePromise: Promise<IconModule> | undefined
let catalogPromise: Promise<{ catalog: IconCatalog; exportsByName: Map<string, string> }> | undefined

function loadModule(): Promise<IconModule> {
  modulePromise ??= loadPackageModule('@phosphor-icons/react/ssr') as Promise<IconModule>
  return modulePromise
}
function isPrefix(shorter: string, longer: string): boolean {
  if (shorter.length >= longer.length || !longer.startsWith(shorter)) {return false}
  const next = longer[shorter.length]
  return Boolean(next && next === next.toUpperCase() && next !== next.toLowerCase())
}
function categoriesFor(names: string[]): Map<string, string> {
  const sorted = [...names].sort((a, b) => a.length - b.length || a.localeCompare(b))
  const categories = new Map<string, string>()
  for (const name of sorted) {
    categories.set(name, sorted.find((candidate) => candidate === name || isPrefix(candidate, name)) ?? name)
  }
  return categories
}

async function loadBaseCatalog(): Promise<{ catalog: IconCatalog; exportsByName: Map<string, string> }> {
  catalogPromise ??= (async () => {
    const mod = await loadModule()
    const exportsByName = new Map<string, string>()
    for (const key of Object.keys(mod).sort()) {
      if (!key.endsWith('Icon') || !isIconComponent(mod[key])) {continue}
      const name = key.slice(0, -4)
      if (name) {exportsByName.set(name, key)}
    }
    const names = [...exportsByName.keys()].sort()
    const categories = categoriesFor(names)
    return {
      catalog: {
        icons: names.map((name) => ({ name, category: categories.get(name) })),
        provider: 'phosphor',
        version: getPackageVersion('@phosphor-icons/react'),
        weights: WEIGHTS,
      },
      exportsByName,
    }
  })()
  return catalogPromise
}

export function phosphorProvider(overrides?: Partial<Pick<IconProvider, 'id' | 'label'>>): IconProvider {
  const id = overrides?.id ?? 'phosphor'
  return {
    id,
    label: overrides?.label ?? 'Phosphor',
    async loadCatalog() {
      const { catalog } = await loadBaseCatalog()
      return { ...catalog, provider: id }
    },
    async loadIcons(request) {
      const weight = request.weight && WEIGHTS.includes(request.weight) ? request.weight : 'regular'
      const [{ exportsByName }, mod] = await Promise.all([loadBaseCatalog(), loadModule()])
      const icons: Record<string, ReturnType<typeof serializeIconComponent>> = {}
      for (const name of request.names) {
        const key = exportsByName.get(name)
        const Component = key ? mod[key] : undefined
        if (isIconComponent(Component)) {icons[name] = serializeIconComponent(Component, { weight })}
      }
      return icons
    },
    packageName: '@phosphor-icons/react',
  }
}
