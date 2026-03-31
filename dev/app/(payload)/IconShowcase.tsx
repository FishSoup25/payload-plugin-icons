'use client'

import { Icon } from 'payload-plugin-icons/client'
import type { IconData } from 'payload-plugin-icons'

export type IconShowcaseItem = {
  id: number | string
  title: string
  icon?: IconData | null
}

export function IconShowcase({ items }: { items: IconShowcaseItem[] }) {
  return (
    <ul
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {items.map((item) => (
        <li
          key={String(item.id)}
          style={{
            border: '1px solid color-mix(in srgb, currentColor 18%, transparent)',
            borderRadius: 8,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <Icon icon={item.icon} aria-hidden size={32} />
          </div>
          <div style={{ fontSize: 14 }}>{item.title}</div>
          {item.icon ? (
            <div style={{ color: 'color-mix(in srgb, currentColor 55%, transparent)', fontSize: 11, marginTop: 4 }}>
              {item.icon.provider}:{item.icon.name}
            </div>
          ) : (
            <div style={{ color: 'color-mix(in srgb, currentColor 45%, transparent)', fontSize: 11, marginTop: 4 }}>
              No icon
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
