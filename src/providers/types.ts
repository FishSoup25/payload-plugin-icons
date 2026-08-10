import type { SVGProps } from 'react'

export type IconGlyphProps = {
  size?: number | string
  /** Phosphor: thin | light | regular | bold | fill | duotone. */
  weight?: string
} & Omit<SVGProps<SVGSVGElement>, 'ref'>

export type IconCatalogEntry = { category?: string; name: string; tags?: string[] }
export type IconCatalog = {
  icons: IconCatalogEntry[]
  provider: string
  version: string
  weights?: string[]
}
export type IconRequest = { names: string[]; weight?: string }
export type SerializedSvgNode = {
  attributes: Record<string, string>
  children?: SerializedSvgNode[]
  tag: string
}
export type SerializedIcon = {
  /** Safe outer SVG attributes supplied by the provider, excluding viewBox. */
  attributes?: Record<string, string>
  nodes: SerializedSvgNode[]
  viewBox: string
}

/** Server-only adapter. Provider packages must never be imported by a client module. */
export interface IconProvider {
  id: string
  label: string
  loadCatalog(): Promise<IconCatalog>
  loadIcons(request: IconRequest): Promise<Record<string, SerializedIcon>>
  packageName: string
}
