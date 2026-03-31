import type { Config } from 'payload';
import type { CreateIconPluginResult, IconPluginOptions } from './types.js';
export type { IconData, IconFieldOptions, IconPluginOptions, IconProviderServerConfig, CreateIconPluginResult, } from './types.js';
export { iconField, setIconPluginPackageImportSpecifier } from './fields/iconField.js';
export { lucideProvider } from './providers/lucide/index.js';
export { phosphorProvider } from './providers/phosphor/index.js';
export { registerIconProviderClientFactory } from './providers/registry.js';
/**
 * Payload plugin: configures package import path used in admin component specifiers
 * and validates provider list. Register the same providers in each `iconField` (or use `createIconPlugin`).
 */
export declare function iconPlugin(pluginOptions?: IconPluginOptions): (config: Config) => Config;
/**
 * Returns a matched pair of `iconPlugin` and `iconField` so provider ids/labels stay in sync.
 */
export declare function createIconPlugin(options: Omit<IconPluginOptions, 'disabled'> & {
    disabled?: boolean;
}): CreateIconPluginResult;
