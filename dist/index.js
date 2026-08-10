import { createIconEndpoints } from './endpoints.js';
import { iconField as buildIconField } from './fields/iconField.js';
import { lucideProvider } from './providers/lucide/index.js';
import { phosphorProvider } from './providers/phosphor/index.js';
export { iconField } from './fields/iconField.js';
export { lucideProvider } from './providers/lucide/index.js';
export { phosphorProvider } from './providers/phosphor/index.js';
export { serializeIconComponent } from './providers/serverUtils.js';
export { withPayloadIcons } from './withPayloadIcons.js';
const defaultProviders = ()=>[
        lucideProvider(),
        phosphorProvider()
    ];
function validateProviders(providers) {
    if (providers.length === 0) {
        throw new Error('[payload-plugin-icons] at least one provider is required');
    }
    if (providers.some(({ id, label })=>id.trim() === '' || label.trim() === '')) {
        throw new Error('[payload-plugin-icons] provider ids and labels cannot be empty');
    }
    if (new Set(providers.map(({ id })=>id)).size !== providers.length) {
        throw new Error('[payload-plugin-icons] provider ids must be unique');
    }
}
/**
 * Payload plugin that validates the configured icon providers.
 * Use `createIconPlugin` to keep this configuration in sync with icon fields.
 */ export function iconPlugin(pluginOptions = {}) {
    const providers = pluginOptions.providers ?? defaultProviders();
    validateProviders(providers);
    return (config)=>({
            ...config,
            endpoints: [
                ...config.endpoints ?? [],
                ...createIconEndpoints(providers)
            ]
        });
}
/**
 * Returns a matched pair of `iconPlugin` and `iconField` so provider ids/labels stay in sync.
 */ export function createIconPlugin(options = {}) {
    const { packageImport = 'payload-plugin-icons', providers = defaultProviders() } = options;
    validateProviders(providers);
    const providerIds = providers.map((p)=>p.id);
    const labelsById = Object.fromEntries(providers.map((p)=>[
            p.id,
            p.label
        ]));
    return {
        iconField: (fieldOptions)=>buildIconField({
                ...fieldOptions,
                labelsById: fieldOptions.labelsById ?? labelsById,
                packageImport: fieldOptions.packageImport ?? packageImport,
                providerIds: fieldOptions.providerIds ?? providerIds
            }),
        iconPlugin: iconPlugin({
            providers
        })
    };
}

//# sourceMappingURL=index.js.map