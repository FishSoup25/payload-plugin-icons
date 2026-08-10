'use client'

import type { DefaultCellComponentProps, GroupFieldClient } from 'payload'

import { type ReactElement } from 'react'

import type { IconData } from '../types.js'

import { Icon } from './Icon.js'
import './IconCell.scss'

export type IconCellExtraProps = {
  labelsById?: Record<string, string>
  providerIds?: string[]
}
export type IconCellProps = {
  clientProps?: IconCellExtraProps
} & DefaultCellComponentProps<GroupFieldClient, IconData | null | undefined> & Partial<IconCellExtraProps>

function mergeCellProps(props: IconCellProps): IconCellExtraProps {
  return {
    labelsById: props.labelsById ?? props.clientProps?.labelsById,
    providerIds: props.providerIds ?? props.clientProps?.providerIds,
  }
}
function normalizeCellData(cellData: IconCellProps['cellData']): IconData | undefined {
  if (!cellData || typeof cellData !== 'object' || !('provider' in cellData) || !('name' in cellData)) {return}
  const { name, provider } = cellData as Record<string, unknown>
  return typeof provider === 'string' && typeof name === 'string' ? { name, provider } : undefined
}

export const IconCell = (props: IconCellProps): ReactElement => {
  const { labelsById } = mergeCellProps(props)
  const data = normalizeCellData(props.cellData)
  if (!data?.name) {return <span className="icon-cell-empty">—</span>}
  return (
    <div className="icon-cell">
      <Icon icon={data} size={20} strokeWidth={1.5} weight="regular" />
      <span className="icon-cell-name">
        {labelsById?.[data.provider] ?? data.provider} · {data.name}
      </span>
    </div>
  )
}
