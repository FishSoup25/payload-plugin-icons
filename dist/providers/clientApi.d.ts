import type { IconCatalog, SerializedIcon } from './types.js';
export declare function loadCatalog(provider: string): Promise<IconCatalog>;
export declare function useIconCatalog(provider: string): IconCatalog | undefined;
export declare function useIconDefinitions(provider: string, names: string[], weight?: string): Record<string, SerializedIcon>;
