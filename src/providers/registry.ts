'use client'

import type { ComponentType } from 'react'

import type { IconData } from '../types.js'
import type { IconGlyphProps, IconProviderClient } from './types.js'

import { createLucideClientProvider } from './lucide/client.js'
import { createPhosphorClientProvider } from './phosphor/client.js'

const builtInFactories: Record<string, (id: string, label: string) => IconProviderClient> = {
  lucide: createLucideClientProvider,
  phosphor: createPhosphorClientProvider,
}

/** Default labels when only id is known (must match server defaults). */
const defaultLabels: Record<string, string> = {
  lucide: 'Lucide',
  phosphor: 'Phosphor',
}

/**
 * Resolve client providers for the given enabled ids (order preserved).
 * Unknown ids are skipped; extend by adding entries to builtInFactories or
 * calling `registerIconProviderClientFactory` before render (advanced).
 */
const extraFactories: Record<string, (id: string, label: string) => IconProviderClient> = {}

export function registerIconProviderClientFactory(
  id: string,
  factory: (id: string, label: string) => IconProviderClient,
): void {
  extraFactories[id] = factory
}

export function getProviderClients(
  providerIds: string[],
  labelsById?: Record<string, string>,
): IconProviderClient[] {
  const out: IconProviderClient[] = []
  for (const id of providerIds) {
    const label = labelsById?.[id] ?? defaultLabels[id] ?? id
    const factory = builtInFactories[id] ?? extraFactories[id]
    if (factory) {
      out.push(factory(id, label))
    }
  }
  return out
}

export function getProviderClientById(
  providerId: string,
  labelsById?: Record<string, string>,
): IconProviderClient | undefined {
  const label = labelsById?.[providerId] ?? defaultLabels[providerId] ?? providerId
  const factory = builtInFactories[providerId] ?? extraFactories[providerId]
  return factory ? factory(providerId, label) : undefined
}

/**
 * Resolves {@link IconData} to the React component for that glyph (same registry admin + site use).
 */
export function resolveIconComponentForData(
  icon: IconData | null | undefined,
  labelsById?: Record<string, string>,
): ComponentType<IconGlyphProps> | null {
  if (!icon?.provider || !icon?.name) {
    return null
  }
  const client = getProviderClientById(icon.provider, labelsById)
  return client?.resolveIconComponent(icon.name) ?? null
}
