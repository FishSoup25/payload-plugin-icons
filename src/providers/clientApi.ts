'use client'

import { useEffect, useMemo, useState } from 'react'

import type { IconCatalog, SerializedIcon } from './types.js'

const catalogCache = new Map<string, Promise<IconCatalog>>()
const definitionCache = new Map<string, SerializedIcon>()
type PendingBatch = { names: Set<string>; timer?: ReturnType<typeof setTimeout>; waiters: Array<() => void> }
const pendingBatches = new Map<string, PendingBatch>()

function definitionKey(provider: string, name: string, weight?: string): string {
  return `${provider}:${weight ?? ''}:${name}`
}
function endpoint(provider: string, resource: string): string {
  return `/api/payload-icons/${encodeURIComponent(provider)}/${resource}`
}

export function loadCatalog(provider: string): Promise<IconCatalog> {
  let promise = catalogCache.get(provider)
  if (!promise) {
    promise = fetch(endpoint(provider, 'catalog')).then(async (response) => {
      if (!response.ok) {throw new Error(`Unable to load ${provider} icon catalog`)}
      return response.json() as Promise<IconCatalog>
    })
    catalogCache.set(provider, promise)
  }
  return promise
}

async function flushBatch(provider: string, weight: string | undefined, batchKey: string): Promise<void> {
  const batch = pendingBatches.get(batchKey)
  if (!batch) {return}
  pendingBatches.delete(batchKey)
  const names = [...batch.names]
  try {
    for (let offset = 0; offset < names.length; offset += 100) {
      const response = await fetch(endpoint(provider, 'icons'), {
        body: JSON.stringify({ names: names.slice(offset, offset + 100), weight }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) {throw new Error(`Unable to load ${provider} icons`)}
      const icons = await response.json() as Record<string, SerializedIcon>
      for (const [name, icon] of Object.entries(icons)) {
        definitionCache.set(definitionKey(provider, name, weight), icon)
      }
    }
  } finally {
    batch.waiters.forEach((resolve) => resolve())
  }
}

function requestDefinitions(provider: string, names: string[], weight?: string): Promise<void> {
  const missing = names.filter((name) => !definitionCache.has(definitionKey(provider, name, weight)))
  if (missing.length === 0) {return Promise.resolve()}
  const batchKey = `${provider}:${weight ?? ''}`
  let batch = pendingBatches.get(batchKey)
  if (!batch) { batch = { names: new Set(), waiters: [] }; pendingBatches.set(batchKey, batch) }
  missing.forEach((name) => batch.names.add(name))
  const promise = new Promise<void>((resolve) => batch.waiters.push(resolve))
  batch.timer ??= setTimeout(() => { void flushBatch(provider, weight, batchKey).catch(() => undefined) }, 0)
  return promise
}

export function useIconCatalog(provider: string): IconCatalog | undefined {
  const [catalog, setCatalog] = useState<IconCatalog>()
  useEffect(() => {
    if (!provider) {return}
    let active = true
    void loadCatalog(provider).then((value) => { if (active) {setCatalog(value)} }).catch(() => undefined)
    return () => { active = false }
  }, [provider])
  return catalog?.provider === provider ? catalog : undefined
}

export function useIconDefinitions(provider: string, names: string[], weight?: string): Record<string, SerializedIcon> {
  const namesKey = names.join('\u0000')
  const stableNames = useMemo(() => namesKey.split('\u0000').filter(Boolean), [namesKey])
  const [, refresh] = useState(0)
  useEffect(() => {
    let active = true
    void requestDefinitions(provider, stableNames, weight).then(() => { if (active) {refresh((value) => value + 1)} })
    return () => { active = false }
  }, [provider, stableNames, weight])
  const definitions: Record<string, SerializedIcon> = {}
  for (const name of stableNames) {
    const icon = definitionCache.get(definitionKey(provider, name, weight))
    if (icon) {definitions[name] = icon}
  }
  return definitions
}
