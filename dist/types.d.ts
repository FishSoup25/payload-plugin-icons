import type { Field, GroupField, Plugin } from 'payload';
import type { IconProvider } from './providers/types.js';
/** Server-side metadata for an icon provider. */
/** @deprecated Use `IconProvider`. */
export type IconProviderServerConfig = IconProvider;
/** Value stored for an icon in the database (group field shape). */
export type IconData = {
    name?: null | string;
    provider: string;
};
export type IconFieldOptions = {
    admin?: GroupField['admin'];
    /** Default provider when empty (first in providerIds if omitted). */
    defaultProviderId?: string;
    label?: GroupField['label'];
    /** Labels shown in the provider dropdown, keyed by provider id. */
    labelsById?: Record<string, string>;
    name: string;
    /**
     * Package name or alias used in Payload's admin component paths.
     * Defaults to `payload-plugin-icons`.
     */
    packageImport?: string;
    /**
     * Provider ids enabled for this field.
     * Defaults to `['lucide', 'phosphor']`.
     */
    providerIds?: string[];
    required?: boolean;
};
export type IconPluginOptions = {
    providers?: IconProvider[];
};
export type CreateIconPluginOptions = {
    /** Package name or alias used in Payload's generated admin import map. */
    packageImport?: string;
} & IconPluginOptions;
/** A Payload plugin and a field factory bound to the same providers. */
export type CreateIconPluginResult = {
    iconField: (options: {
        labelsById?: Record<string, string>;
        providerIds?: string[];
    } & Omit<IconFieldOptions, 'labelsById' | 'providerIds'>) => Field;
    iconPlugin: Plugin;
};
