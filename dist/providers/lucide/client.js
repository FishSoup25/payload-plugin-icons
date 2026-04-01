'use client';
import * as LucideReact from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs';
import { lucideKebabToPascalCase } from '../../lib/lucideCase.js';
const allIconNames = Object.keys(dynamicIconImports);
const categoryMap = {};
for (const name of allIconNames){
    const category = String(name).split('-')[0];
    if (!categoryMap[category]) {
        categoryMap[category] = [];
    }
    categoryMap[category].push(name);
}
for (const cat of Object.keys(categoryMap)){
    categoryMap[cat].sort();
}
function getCategoryRepresentative(category) {
    const icons = categoryMap[category];
    if (!icons?.length) {
        return category;
    }
    if (icons.includes(category)) {
        return category;
    }
    return icons[0] ?? category;
}
const lucideNamespace = LucideReact;
function isLucideGlyphComponent(x) {
    if (x == null) {
        return false;
    }
    if (typeof x === 'function') {
        return true;
    }
    return typeof x === 'object' && '$$typeof' in x;
}
/**
 * Resolve a glyph from one synchronous eager import graph (`import * as LucideReact from 'lucide-react'`).
 * Do not use `React.lazy` or per-name `import()` here — that causes one network chunk per visible icon in admin.
 */ function resolveLucideIconComponent(name) {
    if (!dynamicIconImports[name]) {
        return null;
    }
    const pascal = lucideKebabToPascalCase(name);
    const candidates = [
        pascal,
        `${pascal}Icon`,
        `Lucide${pascal}`,
        `Lucide${pascal}Icon`
    ];
    for (const key of candidates){
        const Cmp = lucideNamespace[key];
        if (isLucideGlyphComponent(Cmp)) {
            return Cmp;
        }
    }
    return null;
}
export function createLucideClientProvider(id = 'lucide', label = 'Lucide') {
    return {
        id,
        getCategoryMap: ()=>categoryMap,
        getCategoryRepresentative,
        getIconNames: ()=>allIconNames,
        label,
        resolveIconComponent: (name)=>resolveLucideIconComponent(name)
    };
}

//# sourceMappingURL=client.js.map