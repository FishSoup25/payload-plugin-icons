import { type ReactNode } from 'react';
import type { IconGlyphProps, SerializedIcon } from '../providers/types.js';
import type { IconData } from '../types.js';
export type UniversalIconProps = {
    icon: IconData | null | undefined;
} & IconGlyphProps;
export declare function SerializedIconSvg({ definition, size, weight: _weight, ...props }: {
    definition: SerializedIcon;
} & IconGlyphProps): ReactNode;
/** Render stored icon data without importing its provider package into the client bundle. */
export declare function Icon({ icon, weight, ...props }: UniversalIconProps): ReactNode;
