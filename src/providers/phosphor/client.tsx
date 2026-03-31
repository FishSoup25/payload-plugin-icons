'use client'

import type { ComponentType } from 'react'

import * as PhosphorIcons from '@phosphor-icons/react'

import type { IconGlyphProps, IconProviderClient } from '../types.js'

type PhosphorCmp = ComponentType<IconGlyphProps>

/** Phosphor icons are `forwardRef` components (`typeof` object), not plain functions. */
function isPhosphorIconComponent(x: unknown): x is PhosphorCmp {
  if (x == null) {
    return false
  }
  if (typeof x === 'function') {
    return true
  }
  return typeof x === 'object' && '$$typeof' in x
}

const EXCLUDED = new Set([
  'default',
  'IconBase',
  'IconContext',
  'IconProps',
  'SSR',
])

function toExportKey(storedName: string): string {
  if (storedName.endsWith('Icon')) {
    return storedName
  }
  return `${storedName}Icon`
}

function getAllPhosphorIconExportKeys(): string[] {
  const mod = PhosphorIcons as Record<string, unknown>
  return Object.keys(mod)
    .filter(
      (key) =>
        !EXCLUDED.has(key) &&
        key.endsWith('Icon') &&
        (typeof mod[key] === 'function' || (typeof mod[key] === 'object' && mod[key] !== null)),
    )
    .sort()
}

/** Strip `Icon` suffix for display/storage per plan (PascalCase without Icon). */
function exportKeyToStoredName(exportKey: string): string {
  return exportKey.replace(/Icon$/, '') || exportKey
}

function getCategoryFromBaseName(baseName: string): string {
  const m = baseName.match(/^[A-Z][a-z]*/)
  return m ? m[0] : baseName.slice(0, 1) || 'Other'
}

const exportKeys = getAllPhosphorIconExportKeys()
const storedNames = exportKeys.map(exportKeyToStoredName)

const categoryMap: Record<string, string[]> = {}
for (let i = 0; i < exportKeys.length; i++) {
  const stored = storedNames[i]
  const cat = getCategoryFromBaseName(stored)
  if (!categoryMap[cat]) {
    categoryMap[cat] = []
  }
  categoryMap[cat].push(stored)
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
  return icons[0]
}

export function createPhosphorClientProvider(
  id: string = 'phosphor',
  label: string = 'Phosphor',
): IconProviderClient {
  return {
    id,
    getCategoryMap: () => categoryMap,
    getCategoryRepresentative,
    getIconNames: () => storedNames,
    label,
    resolveIconComponent: (name: string): null | PhosphorCmp => {
      const key = toExportKey(name) as keyof typeof PhosphorIcons
      const Cmp = PhosphorIcons[key]
      if (!isPhosphorIconComponent(Cmp)) {
        return null
      }
      return Cmp
    },
  }
}
