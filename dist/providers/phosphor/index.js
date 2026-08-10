import { getPackageVersion, isIconComponent, loadPackageModule, serializeIconComponent } from '../serverUtils.js';
const WEIGHTS = [
    'thin',
    'light',
    'regular',
    'bold',
    'fill',
    'duotone'
];
let modulePromise;
let catalogPromise;
function loadModule() {
    modulePromise ??= loadPackageModule('@phosphor-icons/react/ssr');
    return modulePromise;
}
function isPrefix(shorter, longer) {
    if (shorter.length >= longer.length || !longer.startsWith(shorter)) {
        return false;
    }
    const next = longer[shorter.length];
    return Boolean(next && next === next.toUpperCase() && next !== next.toLowerCase());
}
function categoriesFor(names) {
    const sorted = [
        ...names
    ].sort((a, b)=>a.length - b.length || a.localeCompare(b));
    const categories = new Map();
    for (const name of sorted){
        categories.set(name, sorted.find((candidate)=>candidate === name || isPrefix(candidate, name)) ?? name);
    }
    return categories;
}
async function loadBaseCatalog() {
    catalogPromise ??= (async ()=>{
        const mod = await loadModule();
        const exportsByName = new Map();
        for (const key of Object.keys(mod).sort()){
            if (!key.endsWith('Icon') || !isIconComponent(mod[key])) {
                continue;
            }
            const name = key.slice(0, -4);
            if (name) {
                exportsByName.set(name, key);
            }
        }
        const names = [
            ...exportsByName.keys()
        ].sort();
        const categories = categoriesFor(names);
        return {
            catalog: {
                icons: names.map((name)=>({
                        name,
                        category: categories.get(name)
                    })),
                provider: 'phosphor',
                version: getPackageVersion('@phosphor-icons/react'),
                weights: WEIGHTS
            },
            exportsByName
        };
    })();
    return catalogPromise;
}
export function phosphorProvider(overrides) {
    const id = overrides?.id ?? 'phosphor';
    return {
        id,
        label: overrides?.label ?? 'Phosphor',
        async loadCatalog () {
            const { catalog } = await loadBaseCatalog();
            return {
                ...catalog,
                provider: id
            };
        },
        async loadIcons (request) {
            const weight = request.weight && WEIGHTS.includes(request.weight) ? request.weight : 'regular';
            const [{ exportsByName }, mod] = await Promise.all([
                loadBaseCatalog(),
                loadModule()
            ]);
            const icons = {};
            for (const name of request.names){
                const key = exportsByName.get(name);
                const Component = key ? mod[key] : undefined;
                if (isIconComponent(Component)) {
                    icons[name] = serializeIconComponent(Component, {
                        weight
                    });
                }
            }
            return icons;
        },
        packageName: '@phosphor-icons/react'
    };
}

//# sourceMappingURL=index.js.map