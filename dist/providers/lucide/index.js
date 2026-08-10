import { getPackageVersion, isIconComponent, loadPackageModule, pascalToKebab, serializeIconComponent } from '../serverUtils.js';
let modulePromise;
let catalogPromise;
function loadModule() {
    modulePromise ??= loadPackageModule('lucide-react');
    return modulePromise;
}
async function loadBaseCatalog() {
    catalogPromise ??= (async ()=>{
        const mod = await loadModule();
        const exportsByName = new Map();
        for (const key of Object.keys(mod).sort()){
            if (!key.endsWith('Icon') || !isIconComponent(mod[key])) {
                continue;
            }
            const name = pascalToKebab(key.slice(0, -4));
            if (name) {
                exportsByName.set(name, key);
            }
        }
        return {
            catalog: {
                icons: [
                    ...exportsByName.keys()
                ].sort().map((name)=>({
                        name,
                        category: name.split('-')[0]
                    })),
                provider: 'lucide',
                version: getPackageVersion('lucide-react')
            },
            exportsByName
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
            const { catalog } = await loadBaseCatalog();
            return {
                ...catalog,
                provider: id
            };
        },
        async loadIcons (request) {
            const [{ exportsByName }, mod] = await Promise.all([
                loadBaseCatalog(),
                loadModule()
            ]);
            const icons = {};
            for (const name of request.names){
                const key = exportsByName.get(name);
                const Component = key ? mod[key] : undefined;
                if (isIconComponent(Component)) {
                    icons[name] = serializeIconComponent(Component);
                }
            }
            return icons;
        },
        packageName: 'lucide-react'
    };
}

//# sourceMappingURL=index.js.map