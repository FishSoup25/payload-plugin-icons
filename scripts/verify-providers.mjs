import assert from 'node:assert/strict'
import { createElement, memo } from 'react'
import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs'

import { lucideProvider, phosphorProvider, serializeIconComponent } from '../dist/index.js'
import { createIconEndpoints } from '../dist/endpoints.js'
import { isSerializedIcon } from '../dist/providers/serverUtils.js'

const lucide = lucideProvider()
const lucideCatalog = await lucide.loadCatalog()
assert.equal(lucideCatalog.provider, 'lucide')
assert.ok(lucideCatalog.icons.length > 1_000)
assert.ok(lucideCatalog.icons.some(({ name }) => name === 'house'))
assert.ok(!lucideCatalog.icons.some(({ name }) => name === 'create-lucide'))
const lucideNames = lucideCatalog.icons.map(({ name }) => name)
assert.deepEqual(lucideNames, Object.keys(dynamicIconImports).sort())
for (const name of ['building-2', 'arrow-down-0-1', 'arrow-down-01', 'axis-3d', 'axis-3-d']) {
  assert.ok(lucideNames.includes(name))
}
for (const name of ['building2', 'arrow-down01', 'axis3-d']) {
  assert.ok(!lucideNames.includes(name))
}
const lucideIcons = await lucide.loadIcons({
  names: ['house', 'map-pin', 'building-2', 'arrow-down-0-1', 'arrow-down-01', 'axis-3d', 'axis-3-d'],
})
assert.equal(lucideIcons.house.viewBox, '0 0 24 24')
assert.ok(lucideIcons.house.nodes.length > 0)
assert.equal(lucideIcons['building-2'].viewBox, '0 0 24 24')
assert.deepEqual(lucideIcons['arrow-down-0-1'], lucideIcons['arrow-down-01'])
assert.deepEqual(lucideIcons['axis-3d'], lucideIcons['axis-3-d'])
for (let offset = 0; offset < lucideCatalog.icons.length; offset += 100) {
  const names = lucideCatalog.icons.slice(offset, offset + 100).map(({ name }) => name)
  const icons = await lucide.loadIcons({ names })
  assert.deepEqual(Object.keys(icons).sort(), [...names].sort())
}

const lucideIconEndpoint = createIconEndpoints([lucide]).find(({ method }) => method === 'post')
assert.ok(lucideIconEndpoint)
const lucideIconResponse = await lucideIconEndpoint.handler(new Request(
  'http://localhost/api/payload-icons/lucide/icons',
  {
    body: JSON.stringify({ names: ['house'], weight: 'regular' }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  },
))
assert.equal(lucideIconResponse.status, 200)
assert.ok((await lucideIconResponse.json()).house)

const mixedLucideIconResponse = await lucideIconEndpoint.handler(new Request(
  'http://localhost/api/payload-icons/lucide/icons',
  {
    body: JSON.stringify({ names: ['building-2', 'hotel', 'not-an-icon'] }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  },
))
assert.equal(mixedLucideIconResponse.status, 200)
assert.deepEqual(
  Object.keys(await mixedLucideIconResponse.json()).sort(),
  ['building-2', 'hotel'],
)

const unknownLucideIconResponse = await lucideIconEndpoint.handler(new Request(
  'http://localhost/api/payload-icons/lucide/icons',
  {
    body: JSON.stringify({ names: ['not-an-icon'] }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  },
))
assert.equal(unknownLucideIconResponse.status, 200)
assert.deepEqual(await unknownLucideIconResponse.json(), {})

const MemoIcon = memo(() => createElement(
  'svg',
  { viewBox: '0 0 24 24' },
  createElement('path', { d: 'M4 4h16v16H4z' }),
))
const memoDefinition = serializeIconComponent(MemoIcon)
assert.equal(memoDefinition.viewBox, '0 0 24 24')
assert.equal(memoDefinition.nodes[0]?.attributes.d, 'M4 4h16v16H4z')

let customRequest
const customProvider = {
  id: 'custom',
  label: 'Custom',
  packageName: '@acme/custom-icons',
  async loadCatalog() {
    return {
      icons: [{ category: '__proto__', name: 'CustomHome' }],
      provider: 'custom',
      version: '1',
      weights: ['outline', 'solid'],
    }
  },
  async loadIcons(request) {
    customRequest = request
    return { CustomHome: memoDefinition }
  },
}
const customIconEndpoint = createIconEndpoints([customProvider]).find(({ method }) => method === 'post')
assert.ok(customIconEndpoint)
const customIconResponse = await customIconEndpoint.handler(new Request(
  'http://localhost/api/payload-icons/custom/icons',
  {
    body: JSON.stringify({ names: ['CustomHome'] }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  },
))
assert.equal(customIconResponse.status, 200)
assert.deepEqual(customRequest, { names: ['CustomHome'], weight: undefined })
assert.ok((await customIconResponse.json()).CustomHome)

const phosphor = phosphorProvider()
const phosphorCatalog = await phosphor.loadCatalog()
assert.equal(phosphorCatalog.provider, 'phosphor')
assert.ok(phosphorCatalog.icons.length > 1_000)
assert.deepEqual(phosphorCatalog.weights, ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'])
const phosphorIcons = await phosphor.loadIcons({ names: ['House'], weight: 'duotone' })
assert.equal(phosphorIcons.House.viewBox, '0 0 256 256')
assert.equal(phosphorIcons.House.nodes[0]?.attributes.opacity, '0.2')
assert.ok(isSerializedIcon(phosphorIcons.House))
assert.equal(isSerializedIcon({
  nodes: [{ attributes: { fill: 'url(javascript:alert(1))' }, tag: 'path' }],
  viewBox: '0 0 24 24',
}), false)

console.log(`Verified ${lucideCatalog.icons.length} Lucide and ${phosphorCatalog.icons.length} Phosphor icons.`)
