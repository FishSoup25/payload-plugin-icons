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

/**
 * True when `shorter` is a full stored icon name that is the start of `longer`,
 * and the remainder begins a new PascalCase segment (uppercase letter).
 * Avoids grouping `App` + first-segment heuristics: only real prefix edges merge icons.
 */
function isPascalCaseIconPrefix(shorter: string, longer: string): boolean {
  if (shorter.length >= longer.length || !longer.startsWith(shorter)) {
    return false
  }
  const next = longer[shorter.length]
  return next !== undefined && next === next.toUpperCase() && next !== next.toLowerCase()
}

function shortestNameInList(names: string[]): string {
  let best = names[0]!
  for (let i = 1; i < names.length; i++) {
    const cur = names[i]!
    if (cur.length < best.length || (cur.length === best.length && cur < best)) {
      best = cur
    }
  }
  return best
}

function buildPhosphorCategoryMap(storedNames: string[]): Record<string, string[]> {
  const parent = new Map<string, string>()
  for (const n of storedNames) {
    parent.set(n, n)
  }
  function find(x: string): string {
    let p = parent.get(x)!
    if (p !== x) {
      p = find(p)
      parent.set(x, p)
    }
    return p
  }
  function union(a: string, b: string): void {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) {
      parent.set(ra, rb)
    }
  }

  const byLength = [...storedNames].sort((a, b) => a.length - b.length || a.localeCompare(b))
  for (const a of byLength) {
    for (const b of storedNames) {
      if (isPascalCaseIconPrefix(a, b)) {
        union(a, b)
      }
    }
  }

  const membersByRoot = new Map<string, string[]>()
  for (const n of storedNames) {
    const r = find(n)
    if (!membersByRoot.has(r)) {
      membersByRoot.set(r, [])
    }
    membersByRoot.get(r)!.push(n)
  }

  const categoryMap: Record<string, string[]> = {}
  for (const members of membersByRoot.values()) {
    const cat = shortestNameInList(members)
    categoryMap[cat] = [...members].sort()
  }
  return categoryMap
}

const exportKeys = getAllPhosphorIconExportKeys()
const storedNames = exportKeys.map(exportKeyToStoredName)
const categoryMap = buildPhosphorCategoryMap(storedNames)

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
