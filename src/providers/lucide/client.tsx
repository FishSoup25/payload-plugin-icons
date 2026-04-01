'use client'

import type { ComponentType } from 'react'

import * as LucideReact from 'lucide-react'
import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs'

import type { IconGlyphProps, IconProviderClient } from '../types.js'

import { lucideKebabToPascalCase } from '../../lib/lucideCase.js'

const allIconNames = Object.keys(dynamicIconImports)

const categoryMap: Record<string, string[]> = {}
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

function getCategoryRepresentative(category: string): string {
  const icons = categoryMap[category]
  if (!icons?.length) {
    return category
  }
  if (icons.includes(category)) {
    return category
  }
  return icons[0] ?? category
}

const lucideNamespace = LucideReact as Record<string, unknown>

function isLucideGlyphComponent(x: unknown): x is ComponentType<IconGlyphProps> {
  if (x == null) {
    return false
  }
  if (typeof x === 'function') {
    return true
  }
  return typeof x === 'object' && '$$typeof' in x
}

/**
 * Resolve a glyph from one synchronous eager import graph (`import * as LucideReact from 'lucide-react'`).
 * Do not use `React.lazy` or per-name `import()` here — that causes one network chunk per visible icon in admin.
 */
function resolveLucideIconComponent(name: string): ComponentType<IconGlyphProps> | null {
  if (!dynamicIconImports[name]) {
    return null
  }
  const pascal = lucideKebabToPascalCase(name)
  const candidates = [
    pascal,
    `${pascal}Icon`,
    `Lucide${pascal}`,
    `Lucide${pascal}Icon`,
  ] as const
  for (const key of candidates) {
    const Cmp = lucideNamespace[key]
    if (isLucideGlyphComponent(Cmp)) {
      return Cmp
    }
  }
  return null
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
    resolveIconComponent: (name: string) => resolveLucideIconComponent(name),
  }
}
