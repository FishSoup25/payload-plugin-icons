'use client'

import type { GroupFieldClientComponent, GroupFieldClientProps } from 'payload'

import { useField } from '@payloadcms/ui'
import { groupHasName } from 'payload/shared'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { IconProviderClient } from '../providers/types.js'

import { IconPickerDropdown, PAGE_SIZE, useIconPickerSearch } from '../lib/iconPickerUi.js'
import { getProviderClients } from '../providers/registry.js'
import './IconSelectField.scss'

/** Serialized `clientProps` from `iconField()` (also merged onto root props by the admin). */
export type IconSelectClientProps = {
  labelsById?: Record<string, string>
  providerIds?: string[]
}

/**
 * Props the picker actually receives: Payload group field props plus optional plugin options.
 */
export type IconSelectFieldProps = {
    clientProps?: IconSelectClientProps
  } &
  GroupFieldClientProps & Partial<IconSelectClientProps>

const noopClient: IconProviderClient = {
  id: 'noop',
  getCategoryMap: () => ({}),
  getCategoryRepresentative: (c) => c,
  getIconNames: () => [],
  label: 'noop',
  resolveIconComponent: () => null,
}

function pickIconClientProps(
  props: { clientProps?: IconSelectClientProps } &
    GroupFieldClientProps & Partial<IconSelectClientProps>,
): IconSelectClientProps {
  const nested = props.clientProps
  return {
    labelsById: props.labelsById ?? nested?.labelsById,
    providerIds: props.providerIds ?? nested?.providerIds,
  }
}

function fieldLabelText(props: GroupFieldClientProps): string {
  const { field } = props
  if (typeof field.label === 'string') {
    return field.label
  }
  if (groupHasName(field)) {
    return field.name
  }
  return 'Icon'
}

/** `NamedGroupFieldClient` omits `required` in Payload typings; runtime field config may still include it. */
function fieldIsRequired(props: GroupFieldClientProps): boolean {
  const { field } = props
  if (!groupHasName(field)) {
    return false
  }
  return Boolean((field as { required?: boolean } & GroupFieldClientProps['field']).required)
}

export const IconSelectField: GroupFieldClientComponent = (props) => {
  const { path, readOnly } = props
  const { labelsById, providerIds = ['lucide', 'phosphor'] } = pickIconClientProps(props)

  const providers = useMemo(
    () => getProviderClients(providerIds, labelsById),
    [providerIds, labelsById],
  )

  const providerPath = `${path}.provider`
  const namePath = `${path}.name`

  const { setValue: setProvider, value: providerValue } = useField<string>({
    path: providerPath,
  })
  const { setValue: setName, value: nameValue } = useField<string>({
    path: namePath,
  })

  const firstId = providers[0]?.id ?? providerIds[0] ?? 'lucide'

  useEffect(() => {
    if (!providerValue && firstId) {
      void setProvider(firstId)
    }
  }, [providerValue, setProvider, firstId])

  const activeProviderId = providerValue || firstId
  const activeClient: IconProviderClient | undefined = useMemo(
    () => providers.find((p) => p.id === activeProviderId) ?? providers[0],
    [providers, activeProviderId],
  )

  const [search, setSearch] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [page, setPage] = useState(0)
  const [expandedCategory, setExpandedCategory] = useState<null | string>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { matchingCategories, totalMatchingIcons } = useIconPickerSearch(
    activeClient ?? providers[0] ?? noopClient,
    search,
  )

  const handleProviderChange = (nextId: string): void => {
    void setProvider(nextId)
    void setName('')
    setSearch('')
    setPage(0)
    setExpandedCategory(null)
  }

  const totalPages = Math.ceil(matchingCategories.length / PAGE_SIZE) || 1
  const paginatedCategories = matchingCategories.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const handleSelect = (iconName: string): void => {
    void setName(iconName)
    setSearch('')
    setShowPicker(false)
    setExpandedCategory(null)
  }

  const toggleExpand = (category: string): void => {
    setExpandedCategory((prev) => (prev === category ? null : category))
  }

  const handlePageChange = (delta: number): void => {
    setPage((p) => Math.max(0, Math.min(totalPages - 1, p + delta)))
    setExpandedCategory(null)
  }

  const categoryMap = useMemo(() => activeClient?.getCategoryMap() ?? {}, [activeClient])

  const expandedVariants = useMemo((): string[] => {
    if (!expandedCategory || !activeClient) {
      return []
    }
    const icons = categoryMap[expandedCategory] ?? []
    if (!search) {
      return icons
    }
    const lower = search.toLowerCase()
    return icons.filter((n) => String(n).toLowerCase().includes(lower))
  }, [expandedCategory, search, activeClient, categoryMap])

  const PreviewCmp = useMemo(() => {
    if (!nameValue || !activeClient) {
      return null
    }
    return activeClient.resolveIconComponent(nameValue)
  }, [activeClient, nameValue])

  const labelText = fieldLabelText(props)
  const required = fieldIsRequired(props)
  const { field } = props

  if (!activeClient) {
    return <div className="icon-select-field">No icon providers configured.</div>
  }

  return (
    <div className="icon-select-field" ref={dropdownRef}>
      <div className="field-label-wrapper">
        <label className="field-label">
          {labelText}
          {required && <span className="required">*</span>}
        </label>
      </div>

      <div className="icon-provider-row">
        <label className="icon-provider-label" htmlFor={`${path}-provider`}>
          Provider
        </label>
        <select
          className="icon-provider-select"
          disabled={readOnly ?? providers.length <= 1}
          id={`${path}-provider`}
          onChange={(e) => handleProviderChange(e.target.value)}
          value={activeProviderId}
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="icon-search-wrapper">
        <input
          className="icon-search-input"
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowPicker(true)}
          placeholder="Search icons... (e.g., shield, home, user)"
          readOnly={readOnly}
          type="text"
          value={search}
        />
      </div>

      {nameValue && (
        <div className="selected-icon-preview">
          <div className="preview-label">Selected icon</div>
          <div className="preview-content">
            <span className="preview-provider-badge">{activeClient.label}</span>
            {PreviewCmp ? (
              <PreviewCmp size={32} strokeWidth={1.5} weight="regular" />
            ) : null}
            <span className="icon-name">{nameValue}</span>
            {!readOnly && (
              <button
                className="clear-button"
                onClick={() => {
                  void setName('')
                }}
                type="button"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {showPicker && !readOnly && (
        <IconPickerDropdown
          client={activeClient}
          expandedCategory={expandedCategory}
          expandedVariants={expandedVariants}
          matchingCategories={matchingCategories}
          onCloseVariants={(): void => setExpandedCategory(null)}
          onPageChange={handlePageChange}
          onSelect={handleSelect}
          onToggleExpand={toggleExpand}
          page={page}
          paginatedCategories={paginatedCategories}
          search={search}
          selectedValue={nameValue ?? ''}
          totalMatchingIcons={totalMatchingIcons}
          totalPages={totalPages}
        />
      )}

      {field.admin && 'description' in field.admin && field.admin.description && (
        <div className="field-description">
          {typeof field.admin.description === 'string'
            ? field.admin.description
            : String(field.admin.description)}
        </div>
      )}
    </div>
  )
}
