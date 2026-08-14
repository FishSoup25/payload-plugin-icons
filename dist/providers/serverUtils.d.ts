import { type ComponentType } from 'react';
import type { IconGlyphProps, SerializedIcon } from './types.js';
export declare function getPackageVersion(packageName: string): string;
/** Load a fixed provider package through Node so bundlers never traverse its export graph. */
export declare function loadPackageModule(packageName: string): Promise<Record<string, unknown>>;
export declare function isIconComponent(value: unknown): value is ComponentType<IconGlyphProps>;
export declare function pascalToKebab(value: string): string;
export declare function isSerializedIcon(value: unknown): value is SerializedIcon;
/** Convert provider output to a small, validated structure safe for the client renderer. */
export declare function serializeIconComponent(Component: ComponentType<IconGlyphProps>, props?: IconGlyphProps): SerializedIcon;
