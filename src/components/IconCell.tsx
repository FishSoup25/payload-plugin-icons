'use client'

import type { DefaultCellComponentProps, GroupFieldClient  } from 'payload'

import { type ReactElement, useMemo } from 'react'

import type { IconData } from '../types.js'

import { getProviderClientById } from '../providers/registry.js'
import './IconCell.scss'

export type IconCellExtraProps = {
  labelsById?: Record<string, string>
  providerIds?: string[]
}

export type IconCellProps = {
    clientProps?: IconCellExtraProps
  } &
  DefaultCellComponentProps<GroupFieldClient, IconData | null | undefined> & Partial<IconCellExtraProps>

function mergeCellProps(props: IconCellProps): IconCellExtraProps {
  const nested = props.clientProps
  return {
    labelsById: props.labelsById ?? nested?.labelsById,
    providerIds: props.providerIds ?? nested?.providerIds,
  }
}

function normalizeCellData(cellData: IconCellProps['cellData']): IconData | undefined {
  if (!cellData || typeof cellData !== 'object') {
    return undefined
  }
  if (!('provider' in cellData) || !('name' in cellData)) {
    return undefined
  }
  const { name, provider } = cellData as Record<string, unknown>
  if (typeof provider !== 'string' || typeof name !== 'string') {
    return undefined
  }
  return { name, provider }
}

export const IconCell = (props: IconCellProps): ReactElement => {
  const { cellData } = props
  const { labelsById } = mergeCellProps(props)
  const data = normalizeCellData(cellData)

  const client = useMemo(() => {
    if (!data?.provider) {
      return undefined
    }
    return getProviderClientById(data.provider, labelsById)
  }, [data?.provider, labelsById])

  const Glyph = useMemo(() => {
    if (!client || !data?.name) {
      return null
    }
    return client.resolveIconComponent(data.name)
  }, [client, data?.name])

  if (!data?.name) {
    return <span className="icon-cell-empty">—</span>
  }

  if (!client) {
    return (
      <div className="icon-cell">
        <span className="icon-cell-name">
          {data.provider}:{data.name}
        </span>
      </div>
    )
  }

  return (
    <div className="icon-cell">
      {Glyph ? <Glyph size={20} strokeWidth={1.5} weight="regular" /> : null}
      <span className="icon-cell-name">
        {data.provider} · {data.name}
      </span>
    </div>
  )
}
