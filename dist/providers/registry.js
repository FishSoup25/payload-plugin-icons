'use client';
import { createLucideClientProvider } from './lucide/client.js';
import { createPhosphorClientProvider } from './phosphor/client.js';
const builtInFactories = {
    lucide: createLucideClientProvider,
    phosphor: createPhosphorClientProvider
};
/** Default labels when only id is known (must match server defaults). */ const defaultLabels = {
    lucide: 'Lucide',
    phosphor: 'Phosphor'
};
/**
 * Resolve client providers for the given enabled ids (order preserved).
 * Unknown ids are skipped; extend by adding entries to builtInFactories or
 * calling `registerIconProviderClientFactory` before render (advanced).
 */ const extraFactories = {};
export function registerIconProviderClientFactory(id, factory) {
    extraFactories[id] = factory;
}
export function getProviderClients(providerIds, labelsById) {
    const out = [];
    for (const id of providerIds){
        const label = labelsById?.[id] ?? defaultLabels[id] ?? id;
        const factory = builtInFactories[id] ?? extraFactories[id];
        if (factory) {
            out.push(factory(id, label));
        }
    }
    return out;
}
export function getProviderClientById(providerId, labelsById) {
    const label = labelsById?.[providerId] ?? defaultLabels[providerId] ?? providerId;
    const factory = builtInFactories[providerId] ?? extraFactories[providerId];
    return factory ? factory(providerId, label) : undefined;
}
/**
 * Resolves {@link IconData} to the React component for that glyph (same registry admin + site use).
 */ export function resolveIconComponentForData(icon, labelsById) {
    if (!icon?.provider || !icon?.name) {
        return null;
    }
    const client = getProviderClientById(icon.provider, labelsById);
    return client?.resolveIconComponent(icon.name) ?? null;
}

//# sourceMappingURL=registry.js.map