import assert from 'node:assert/strict'

import { lucideProvider, phosphorProvider } from '../dist/index.js'
import { isSerializedIcon } from '../dist/providers/serverUtils.js'

const lucide = lucideProvider()
const lucideCatalog = await lucide.loadCatalog()
assert.equal(lucideCatalog.provider, 'lucide')
assert.ok(lucideCatalog.icons.length > 1_000)
assert.ok(lucideCatalog.icons.some(({ name }) => name === 'house'))
const lucideIcons = await lucide.loadIcons({ names: ['house', 'map-pin'] })
assert.equal(lucideIcons.house.viewBox, '0 0 24 24')
assert.ok(lucideIcons.house.nodes.length > 0)

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
