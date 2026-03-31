import type { ComponentType } from 'react';
import type { IconData } from '../types.js';
import type { IconGlyphProps, IconProviderClient } from './types.js';
export declare function registerIconProviderClientFactory(id: string, factory: (id: string, label: string) => IconProviderClient): void;
export declare function getProviderClients(providerIds: string[], labelsById?: Record<string, string>): IconProviderClient[];
export declare function getProviderClientById(providerId: string, labelsById?: Record<string, string>): IconProviderClient | undefined;
/**
 * Resolves {@link IconData} to the React component for that glyph (same registry admin + site use).
 */
export declare function resolveIconComponentForData(icon: IconData | null | undefined, labelsById?: Record<string, string>): ComponentType<IconGlyphProps> | null;
