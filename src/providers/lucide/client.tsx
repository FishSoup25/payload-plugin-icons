'use client'

import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs'
import { type ComponentType, lazy, Suspense, useMemo } from 'react'

import type { IconGlyphProps, IconProviderClient } from '../types.js'

/** Lucide icon keys from the dynamic import map (avoid `lucide-react/dynamic` — Node breaks on its CJS interop). */
type IconName = keyof typeof dynamicIconImports

const allIconNames = Object.keys(dynamicIconImports)

const categoryMap: Record<string, IconName[]> = {}
for (const name of allIconNames) {
  const category = String(name).split('-')[0]
  if (!categoryMap[category]) {
    categoryMap[category] = []
  }
  categoryMap[category].push(name)
}
for (const cat of Object.keys(categoryMap)) {
  categoryMap[cat].sort()
}

function getCategoryRepresentative(category: string): IconName {
  const icons = categoryMap[category]
  if (!icons?.length) {
    return category
  }
  if (icons.includes(category)) {
    return category
  }
  return icons[0]
}

const componentByName = new Map<string, ComponentType<IconGlyphProps>>()

function getOrCreateLucideIconComponent(name: string): ComponentType<IconGlyphProps> | null {
  if (!dynamicIconImports[name]) {
    return null
  }
  const hit = componentByName.get(name)
  if (hit) {
    return hit
  }
  const Loader = dynamicIconImports[name]

  function LucideGlyph(props: IconGlyphProps) {
    const Cmp = useMemo(() => lazy(Loader), [])
    return (
      <Suspense fallback={<span className="icon-placeholder-sm" />}>
        <Cmp {...props} />
      </Suspense>
    )
  }

  LucideGlyph.displayName = `Lucide(${name})`
  componentByName.set(name, LucideGlyph)
  return LucideGlyph
}

export function createLucideClientProvider(
  id: string = 'lucide',
  label: string = 'Lucide',
): IconProviderClient {
  return {
    id,
    getCategoryMap: () => categoryMap,
    getCategoryRepresentative,
    getIconNames: () => allIconNames as readonly string[],
    label,
    resolveIconComponent: (name: string) => getOrCreateLucideIconComponent(name),
  }
}
