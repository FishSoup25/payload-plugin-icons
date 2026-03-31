'use client';
import * as PhosphorIcons from '@phosphor-icons/react';
/** Phosphor icons are `forwardRef` components (`typeof` object), not plain functions. */ function isPhosphorIconComponent(x) {
    if (x == null) {
        return false;
    }
    if (typeof x === 'function') {
        return true;
    }
    return typeof x === 'object' && '$$typeof' in x;
}
const EXCLUDED = new Set([
    'default',
    'IconBase',
    'IconContext',
    'IconProps',
    'SSR'
]);
function toExportKey(storedName) {
    if (storedName.endsWith('Icon')) {
        return storedName;
    }
    return `${storedName}Icon`;
}
function getAllPhosphorIconExportKeys() {
    const mod = PhosphorIcons;
    return Object.keys(mod).filter((key)=>!EXCLUDED.has(key) && key.endsWith('Icon') && (typeof mod[key] === 'function' || typeof mod[key] === 'object' && mod[key] !== null)).sort();
}
/** Strip `Icon` suffix for display/storage per plan (PascalCase without Icon). */ function exportKeyToStoredName(exportKey) {
    return exportKey.replace(/Icon$/, '') || exportKey;
}
/**
 * True when `shorter` is a full stored icon name that is the start of `longer`,
 * and the remainder begins a new PascalCase segment (uppercase letter).
 * Avoids grouping `App` + first-segment heuristics: only real prefix edges merge icons.
 */ function isPascalCaseIconPrefix(shorter, longer) {
    if (shorter.length >= longer.length || !longer.startsWith(shorter)) {
        return false;
    }
    const next = longer[shorter.length];
    return next !== undefined && next === next.toUpperCase() && next !== next.toLowerCase();
}
function shortestNameInList(names) {
    let best = names[0];
    for(let i = 1; i < names.length; i++){
        const cur = names[i];
        if (cur.length < best.length || cur.length === best.length && cur < best) {
            best = cur;
        }
    }
    return best;
}
function buildPhosphorCategoryMap(storedNames) {
    const parent = new Map();
    for (const n of storedNames){
        parent.set(n, n);
    }
    function find(x) {
        let p = parent.get(x);
        if (p !== x) {
            p = find(p);
            parent.set(x, p);
        }
        return p;
    }
    function union(a, b) {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) {
            parent.set(ra, rb);
        }
    }
    const byLength = [
        ...storedNames
    ].sort((a, b)=>a.length - b.length || a.localeCompare(b));
    for (const a of byLength){
        for (const b of storedNames){
            if (isPascalCaseIconPrefix(a, b)) {
                union(a, b);
            }
        }
    }
    const membersByRoot = new Map();
    for (const n of storedNames){
        const r = find(n);
        if (!membersByRoot.has(r)) {
            membersByRoot.set(r, []);
        }
        membersByRoot.get(r).push(n);
    }
    const categoryMap = {};
    for (const members of membersByRoot.values()){
        const cat = shortestNameInList(members);
        categoryMap[cat] = [
            ...members
        ].sort();
    }
    return categoryMap;
}
const exportKeys = getAllPhosphorIconExportKeys();
const storedNames = exportKeys.map(exportKeyToStoredName);
const categoryMap = buildPhosphorCategoryMap(storedNames);
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
export function createPhosphorClientProvider(id = 'phosphor', label = 'Phosphor') {
    return {
        id,
        getCategoryMap: ()=>categoryMap,
        getCategoryRepresentative,
        getIconNames: ()=>storedNames,
        label,
        resolveIconComponent: (name)=>{
            const key = toExportKey(name);
            const Cmp = PhosphorIcons[key];
            if (!isPhosphorIconComponent(Cmp)) {
                return null;
            }
            return Cmp;
        }
    };
}

//# sourceMappingURL=client.js.map