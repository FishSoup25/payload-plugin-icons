'use client'

import { type ReactElement, useMemo } from 'react'

import type { IconProviderClient } from '../providers/types.js'

const PAGE_SIZE = 100

function PickerGlyph({
  client,
  iconName,
  size,
}: {
  client: IconProviderClient
  iconName: string
  size: number
}): null | ReactElement {
  const Cmp = useMemo(() => client.resolveIconComponent(iconName), [client, iconName])
  if (!Cmp) {
    return null
  }
  return <Cmp size={size} strokeWidth={1.5} weight="regular" />
}

export type IconPickerDropdownProps = {
  client: IconProviderClient
  expandedCategory: null | string
  expandedVariants: string[]
  matchingCategories: string[]
  onCloseVariants: () => void
  onPageChange: (delta: number) => void
  onSelect: (iconName: string) => void
  onToggleExpand: (category: string) => void
  page: number
  paginatedCategories: string[]
  search: string
  selectedValue: string
  totalMatchingIcons: number
  totalPages: number
}

function IconCategoryCell({
  category,
  categoryMap,
  client,
  expandedCategory,
  onSelect,
  onToggleExpand,
  selectedValue,
}: {
  category: string
  categoryMap: Record<string, string[]>
  client: IconProviderClient
  expandedCategory: null | string
  onSelect: (iconName: string) => void
  onToggleExpand: (category: string) => void
  selectedValue: string
}): ReactElement {
  const icons = categoryMap[category] ?? []
  const representative = client.getCategoryRepresentative(category)
  const hasVariants = icons.length > 1
  const isExpanded = expandedCategory === category

  return (
    <div className={`category-cell${isExpanded ? ' expanded' : ''}`}>
      <button
        className={`icon-option${selectedValue === representative ? ' selected' : ''}`}
        onClick={() => onSelect(representative)}
        title={`Select "${representative}"`}
        type="button"
      >
        <PickerGlyph client={client} iconName={representative} size={24} />
        <span className="icon-option-name">{category}</span>
      </button>
      {hasVariants && (
        <button
          className={`variant-badge${isExpanded ? ' active' : ''}`}
          onClick={() => onToggleExpand(category)}
          title={isExpanded ? 'Collapse variants' : `${icons.length} variants`}
          type="button"
        >
          {isExpanded ? '▲' : icons.length}
        </button>
      )}
    </div>
  )
}

function IconVariantsPanel({
  category,
  client,
  onClose,
  onSelect,
  selectedValue,
  variants,
}: {
  category: string
  client: IconProviderClient
  onClose: () => void
  onSelect: (iconName: string) => void
  selectedValue: string
  variants: string[]
}): ReactElement {
  return (
    <div className="variants-panel">
      <div className="variants-panel-header">
        <span className="variants-panel-title">
          <strong>{category}</strong> variants{' '}
          <span className="variants-panel-count">({variants.length})</span>
        </span>
        <button className="variants-close-btn" onClick={onClose} title="Close" type="button">
          ✕
        </button>
      </div>
      <div className="icon-grid">
        {variants.map((iconName) => (
          <button
            className={`icon-option${selectedValue === iconName ? ' selected' : ''}`}
            key={iconName}
            onClick={() => onSelect(iconName)}
            title={iconName}
            type="button"
          >
            <PickerGlyph client={client} iconName={iconName} size={24} />
            <span className="icon-option-name">{iconName}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function IconPickerDropdown({
  client,
  expandedCategory,
  expandedVariants,
  matchingCategories,
  onCloseVariants,
  onPageChange,
  onSelect,
  onToggleExpand,
  page,
  paginatedCategories,
  search,
  selectedValue,
  totalMatchingIcons,
  totalPages,
}: IconPickerDropdownProps): ReactElement {
  const categoryMap = useMemo(() => client.getCategoryMap(), [client])

  return (
    <div className="icon-picker-dropdown">
      <div className="dropdown-header">
        <span className="dropdown-count">
          {matchingCategories.length} categories · {totalMatchingIcons} icons
        </span>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => onPageChange(-1)}
              type="button"
            >
              ‹
            </button>
            <span className="page-info">
              {page + 1} / {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={page === totalPages - 1}
              onClick={() => onPageChange(1)}
              type="button"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="icon-grid">
        {paginatedCategories.map((category) => (
          <IconCategoryCell
            category={category}
            categoryMap={categoryMap}
            client={client}
            expandedCategory={expandedCategory}
            key={category}
            onSelect={onSelect}
            onToggleExpand={onToggleExpand}
            selectedValue={selectedValue}
          />
        ))}
      </div>

      {expandedCategory && (
        <IconVariantsPanel
          category={expandedCategory}
          client={client}
          onClose={onCloseVariants}
          onSelect={onSelect}
          selectedValue={selectedValue}
          variants={expandedVariants}
        />
      )}

      {matchingCategories.length === 0 && (
        <div className="no-results">No icons found matching &quot;{search}&quot;</div>
      )}
    </div>
  )
}

export function useIconPickerSearch(client: IconProviderClient, search: string) {
  return useMemo(() => {
    const categoryMap = client.getCategoryMap()
    const allCategoryKeys = Object.keys(categoryMap).sort()
    const allIconNames = client.getIconNames()

    if (!search) {
      return {
        matchingCategories: allCategoryKeys,
        totalMatchingIcons: allIconNames.length,
      }
    }

    const lower = search.toLowerCase()
    const matched = new Set<string>()
    for (const name of allIconNames) {
      if (!String(name).toLowerCase().includes(lower)) {
        continue
      }
      for (const c of Object.keys(categoryMap)) {
        if (categoryMap[c].includes(name)) {
          matched.add(c)
          break
        }
      }
    }
    const matchingCategories = Array.from(matched).sort()
    const totalMatchingIcons = allIconNames.filter((n) =>
      String(n).toLowerCase().includes(lower),
    ).length
    return { matchingCategories, totalMatchingIcons }
  }, [client, search])
}

export { PAGE_SIZE }
