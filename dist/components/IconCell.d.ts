import type { DefaultCellComponentProps, GroupFieldClient } from 'payload';
import { type ReactElement } from 'react';
import type { IconData } from '../types.js';
import './IconCell.scss';
export type IconCellExtraProps = {
    labelsById?: Record<string, string>;
    providerIds?: string[];
};
export type IconCellProps = {
    clientProps?: IconCellExtraProps;
} & DefaultCellComponentProps<GroupFieldClient, IconData | null | undefined> & Partial<IconCellExtraProps>;
export declare const IconCell: (props: IconCellProps) => ReactElement;
