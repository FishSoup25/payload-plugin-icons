import type { Plugin } from 'payload';
import type { CreateIconPluginOptions, CreateIconPluginResult, IconPluginOptions } from './types.js';
export { iconField } from './fields/iconField.js';
export { lucideProvider } from './providers/lucide/index.js';
export { phosphorProvider } from './providers/phosphor/index.js';
export type { CreateIconPluginOptions, CreateIconPluginResult, IconData, IconFieldOptions, IconPluginOptions, IconProviderServerConfig, } from './types.js';
/**
 * Payload plugin that validates the configured icon providers.
 * Use `createIconPlugin` to keep this configuration in sync with icon fields.
 */
export declare function iconPlugin(pluginOptions?: IconPluginOptions): Plugin;
/**
 * Returns a matched pair of `iconPlugin` and `iconField` so provider ids/labels stay in sync.
 */
export declare function createIconPlugin(options?: CreateIconPluginOptions): CreateIconPluginResult;
