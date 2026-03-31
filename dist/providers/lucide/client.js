'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs';
import { lazy, Suspense, useMemo } from 'react';
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
    return icons[0];
}
const componentByName = new Map();
function getOrCreateLucideIconComponent(name) {
    if (!dynamicIconImports[name]) {
        return null;
    }
    const hit = componentByName.get(name);
    if (hit) {
        return hit;
    }
    const Loader = dynamicIconImports[name];
    function LucideGlyph(props) {
        const Cmp = useMemo(()=>/*#__PURE__*/ lazy(Loader), []);
        return /*#__PURE__*/ _jsx(Suspense, {
            fallback: /*#__PURE__*/ _jsx("span", {
                className: "icon-placeholder-sm"
            }),
            children: /*#__PURE__*/ _jsx(Cmp, {
                ...props
            })
        });
    }
    LucideGlyph.displayName = `Lucide(${name})`;
    componentByName.set(name, LucideGlyph);
    return LucideGlyph;
}
export function createLucideClientProvider(id = 'lucide', label = 'Lucide') {
    return {
        id,
        getCategoryMap: ()=>categoryMap,
        getCategoryRepresentative,
        getIconNames: ()=>allIconNames,
        label,
        resolveIconComponent: (name)=>getOrCreateLucideIconComponent(name)
    };
}

//# sourceMappingURL=client.js.map