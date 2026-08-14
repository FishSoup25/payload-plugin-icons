import { getPackageVersion, isIconComponent, loadPackageModule, serializeIconComponent } from '../serverUtils.js';
let loadersPromise;
let catalogPromise;
async function loadIconLoaders() {
    loadersPromise ??= (async ()=>{
        const mod = await loadPackageModule('lucide-react/dynamicIconImports.mjs');
        const loaders = mod.default;
        if (!loaders || typeof loaders !== 'object' || Array.isArray(loaders) || Object.values(loaders).some((loader)=>typeof loader !== 'function')) {
            throw new Error('Lucide dynamic icon imports are unavailable');
        }
        return loaders;
    })();
    return loadersPromise;
}
async function loadBaseCatalog() {
    catalogPromise ??= (async ()=>{
        const loaders = await loadIconLoaders();
        return {
            icons: Object.keys(loaders).sort().map((name)=>({
                    name,
                    category: name.split('-')[0]
                })),
            provider: 'lucide',
            version: getPackageVersion('lucide-react')
        };
    })();
    return catalogPromise;
}
export function lucideProvider(overrides) {
    const id = overrides?.id ?? 'lucide';
    return {
        id,
        label: overrides?.label ?? 'Lucide',
        async loadCatalog () {
            const catalog = await loadBaseCatalog();
            return {
                ...catalog,
                provider: id
            };
        },
        async loadIcons (request) {
            const loaders = await loadIconLoaders();
            const icons = {};
            await Promise.all(request.names.map(async (name)=>{
                const loader = loaders[name];
                if (!loader) {
                    return;
                }
                const { default: Component } = await loader();
                if (isIconComponent(Component)) {
                    icons[name] = serializeIconComponent(Component);
                }
            }));
            return icons;
        },
        packageName: 'lucide-react'
    };
}

//# sourceMappingURL=index.js.map