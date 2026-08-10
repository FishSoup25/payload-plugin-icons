'use client'

import { createElement, type ReactNode } from 'react'

import type { IconGlyphProps, SerializedIcon, SerializedSvgNode } from '../providers/types.js'
import type { IconData } from '../types.js'

import { useIconDefinitions } from '../providers/clientApi.js'

export type UniversalIconProps = { icon: IconData | null | undefined } & IconGlyphProps
type SvgProps = Record<string, string>

function reactAttributes(attributes: Record<string, string> = {}): SvgProps {
  const result: SvgProps = {}
  for (const [name, value] of Object.entries(attributes)) {
    result[name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())] = value
  }
  return result
}
function renderNode(node: SerializedSvgNode, key: number): ReactNode {
  return createElement(
    node.tag,
    { ...reactAttributes(node.attributes), key },
    node.children?.map(renderNode),
  )
}

export function SerializedIconSvg({ definition, size, weight: _weight, ...props }: {
  definition: SerializedIcon
} & IconGlyphProps): ReactNode {
  return (
    <svg
      {...reactAttributes(definition.attributes)}
      {...props}
      height={size ?? 24}
      viewBox={definition.viewBox}
      width={size ?? 24}
      xmlns="http://www.w3.org/2000/svg"
    >
      {definition.nodes.map(renderNode)}
    </svg>
  )
}

/** Render stored icon data without importing its provider package into the client bundle. */
export function Icon({ icon, weight, ...props }: UniversalIconProps): ReactNode {
  const provider = icon?.provider ?? ''
  const name = icon?.name ?? ''
  const definitions = useIconDefinitions(provider, name ? [name] : [], weight)
  const definition = definitions[name]
  return definition ? (
    <SerializedIconSvg definition={definition} {...props} weight={weight} />
  ) : null
}
