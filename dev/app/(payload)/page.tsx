import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import { IconShowcase } from './IconShowcase'

/** Dev-only: lists Icon displays on `/` using the plugin’s client Icon component. */
export default async function DevIconShowcasePage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'icon-displays',
    limit: 100,
    sort: '-createdAt',
  })

  const items = docs.map((d) => ({
    id: d.id,
    title: typeof d.title === 'string' ? d.title : '',
    icon: d.icon,
  }))

  return (
    <div style={{ margin: '0 auto', maxWidth: 960, padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Icon displays (dev)</h1>
        <p style={{ marginTop: 8, opacity: 0.85 }}>
          Each admin document is a card below. Use the collection to pick different icons and refresh this page.
        </p>
        <p style={{ marginTop: 12 }}>
          <Link href="/admin/collections/icon-displays">Edit in admin →</Link>
        </p>
      </header>
      {items.length === 0 ? (
        <p>No documents yet. Create some in Icon displays.</p>
      ) : (
        <IconShowcase items={items} />
      )}
    </div>
  )
}
