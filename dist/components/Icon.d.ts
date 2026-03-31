import { type ReactNode } from 'react';
import type { IconGlyphProps } from '../providers/types.js';
import type { IconData } from '../types.js';
export type UniversalIconProps = {
    icon: IconData | null | undefined;
} & IconGlyphProps;
/**
 * Renders an icon from Payload icon group data (`provider` + `name`).
 * Pass sizing, stroke, Phosphor `weight`, `className`, and other SVG props as you would to the underlying library.
 */
export declare function Icon({ icon, ...rest }: UniversalIconProps): ReactNode;
