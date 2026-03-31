'use client'

import { type ReactNode, useMemo } from 'react'

import type { IconGlyphProps } from '../providers/types.js'
import type { IconData } from '../types.js'

import { resolveIconComponentForData } from '../providers/registry.js'

export type UniversalIconProps = {
  icon: IconData | null | undefined
} & IconGlyphProps

/**
 * Renders an icon from Payload icon group data (`provider` + `name`).
 * Pass sizing, stroke, Phosphor `weight`, `className`, and other SVG props as you would to the underlying library.
 */
export function Icon({ icon, ...rest }: UniversalIconProps): ReactNode {
  const provider = icon?.provider
  const name = icon?.name
  const Cmp = useMemo(
    () => (provider && name ? resolveIconComponentForData({ name, provider }) : null),
    [provider, name],
  )

  if (!Cmp) {
    return null
  }

  return <Cmp {...rest} />
}
