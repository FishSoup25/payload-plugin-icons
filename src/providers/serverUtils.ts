import type { ComponentType } from 'react'

import { createRequire } from 'node:module'

import type { IconGlyphProps, SerializedIcon, SerializedSvgNode } from './types.js'

const require = createRequire(import.meta.url)
// Next compiles literal imports (and Lucide's full export graph); keep this fixed server loader opaque.
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const nativeImport = Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<Record<string, unknown>>
const SAFE_TAGS = new Set(['circle', 'ellipse', 'g', 'line', 'path', 'polygon', 'polyline', 'rect'])

export function getPackageVersion(packageName: string): string {
  const pkg = Reflect.apply(require, undefined, [`${packageName}/package.json`]) as { version?: string }
  return typeof pkg.version === 'string' ? pkg.version : 'unknown'
}
/** Load a fixed provider package through Node so bundlers never traverse its export graph. */
export function loadPackageModule(packageName: string): Promise<Record<string, unknown>> {
  return nativeImport(packageName)
}
export function isIconComponent(value: unknown): value is ComponentType<IconGlyphProps> {
  return typeof value === 'function' || Boolean(value && typeof value === 'object' && '$$typeof' in value)
}
export function pascalToKebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase()
}

function isSafeAttribute(name: string, outer: boolean): boolean {
  if (/^on/i.test(name) || name === 'style' || name.includes(':')) {return false}
  const shape = /^(?:c[xy]|[dxy]|height|opacity|points|r[xy]?|transform|width|x[12]|y[12])$/
  const paint = /^(?:fill|stroke)(?:-(?:dasharray|dashoffset|linecap|linejoin|miterlimit|opacity|width))?$/
  return paint.test(name) || (!outer && shape.test(name))
}

function attributeName(name: string): string {
  if (name === 'viewBox') {return name}
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}
function parseAttributes(props: Record<string, unknown>, outer = false): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const [rawName, rawValue] of Object.entries(props)) {
    const name = attributeName(rawName)
    const value = typeof rawValue === 'number' ? String(rawValue) : rawValue
    if (typeof value === 'string' && isSafeAttribute(name, outer) && !/[<>&]|javascript:|url\(/i.test(value)) {
      attributes[name] = value
    }
  }
  return attributes
}

function validAttributes(value: unknown, outer: boolean): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {return false}
  const entries = Object.entries(value)
  return entries.length <= 32 && entries.every(([name, attribute]) =>
    typeof attribute === 'string' && attribute.length <= 10_000 &&
    isSafeAttribute(name, outer) && !/[<>&]|javascript:|url\(/i.test(attribute)
  )
}

function validNode(value: unknown, depth: number): value is SerializedSvgNode {
  if (depth > 16 || !value || typeof value !== 'object' || Array.isArray(value)) {return false}
  const node = value as Partial<SerializedSvgNode>
  return typeof node.tag === 'string' && SAFE_TAGS.has(node.tag) &&
    validAttributes(node.attributes, false) &&
    (node.children === undefined || (
      Array.isArray(node.children) && node.children.length <= 256 &&
      node.children.every((child) => validNode(child, depth + 1))
    ))
}

type ElementTree = { props: Record<string, unknown>; type: unknown }
type Renderable = { render: (props: Record<string, unknown>, ref: null) => unknown }
type WrappedComponent = { type: unknown }

function invoke(component: unknown, props: Record<string, unknown>, depth = 0): ElementTree {
  if (depth > 8) {throw new Error('Provider icon component wrapper depth exceeded')}
  let result: unknown
  if (typeof component === 'function') {
    result = component(props)
  } else if (component && typeof component === 'object' && 'render' in component) {
    result = (component as Renderable).render(props, null)
  } else if (component && typeof component === 'object' && 'type' in component) {
    return invoke((component as WrappedComponent).type, props, depth + 1)
  }
  if (!result || typeof result !== 'object' || !('type' in result) || !('props' in result)) {
    throw new Error('Provider icon did not return a React element')
  }
  return result as ElementTree
}

function unwrapSvg(Component: ComponentType<IconGlyphProps>, props: IconGlyphProps): ElementTree {
  let element = invoke(Component, props as Record<string, unknown>)
  for (let depth = 0; depth < 8 && element.type !== 'svg'; depth++) {
    element = invoke(element.type, element.props)
  }
  if (element.type !== 'svg') {throw new Error('Provider icon did not return an SVG root')}
  return element
}

function serializeChildren(value: unknown): SerializedSvgNode[] {
  if (Array.isArray(value)) {return value.flatMap(serializeChildren)}
  if (!value || typeof value !== 'object' || !('type' in value) || !('props' in value)) {return []}
  const element = value as ElementTree
  if (typeof element.type === 'symbol') {return serializeChildren(element.props.children)}
  if (typeof element.type !== 'string') {
    return serializeChildren(invoke(element.type, element.props))
  }
  const tag = element.type.toLowerCase()
  if (!SAFE_TAGS.has(tag)) {throw new Error(`Provider icon contains unsupported SVG element: ${tag}`)}
  const children = serializeChildren(element.props.children)
  return [{
    attributes: parseAttributes(element.props),
    children: children.length > 0 ? children : undefined,
    tag,
  }]
}

export function isSerializedIcon(value: unknown): value is SerializedIcon {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {return false}
  const icon = value as Partial<SerializedIcon>
  return typeof icon.viewBox === 'string' && icon.viewBox.length <= 100 &&
    !/[<>&]/.test(icon.viewBox) &&
    (icon.attributes === undefined || validAttributes(icon.attributes, true)) &&
    Array.isArray(icon.nodes) && icon.nodes.length <= 256 &&
    icon.nodes.every((node) => validNode(node, 0))
}

/** Convert provider output to a small, validated structure safe for the client renderer. */
export function serializeIconComponent(Component: ComponentType<IconGlyphProps>, props: IconGlyphProps = {}): SerializedIcon {
  const svg = unwrapSvg(Component, props)
  const viewBox = svg.props.viewBox
  if (typeof viewBox !== 'string') {throw new Error('Provider icon SVG is missing a viewBox')}
  return {
    attributes: parseAttributes(svg.props, true),
    nodes: serializeChildren(svg.props.children),
    viewBox,
  }
}
