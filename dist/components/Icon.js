'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { resolveIconComponentForData } from '../providers/registry.js';
/**
 * Renders an icon from Payload icon group data (`provider` + `name`).
 * Pass sizing, stroke, Phosphor `weight`, `className`, and other SVG props as you would to the underlying library.
 */ export function Icon({ icon, ...rest }) {
    const provider = icon?.provider;
    const name = icon?.name;
    const Cmp = useMemo(()=>provider && name ? resolveIconComponentForData({
            name,
            provider
        }) : null, [
        provider,
        name
    ]);
    if (!Cmp) {
        return null;
    }
    return /*#__PURE__*/ _jsx(Cmp, {
        ...rest
    });
}

//# sourceMappingURL=Icon.js.map