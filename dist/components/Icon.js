'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createElement } from 'react';
import { useIconDefinitions } from '../providers/clientApi.js';
function reactAttributes(attributes = {}) {
    const result = {};
    for (const [name, value] of Object.entries(attributes)){
        result[name.replace(/-([a-z])/g, (_, letter)=>letter.toUpperCase())] = value;
    }
    return result;
}
function renderNode(node, key) {
    return /*#__PURE__*/ createElement(node.tag, {
        ...reactAttributes(node.attributes),
        key
    }, node.children?.map(renderNode));
}
export function SerializedIconSvg({ definition, size, weight: _weight, ...props }) {
    return /*#__PURE__*/ _jsx("svg", {
        ...reactAttributes(definition.attributes),
        ...props,
        height: size ?? 24,
        viewBox: definition.viewBox,
        width: size ?? 24,
        xmlns: "http://www.w3.org/2000/svg",
        children: definition.nodes.map(renderNode)
    });
}
/** Render stored icon data without importing its provider package into the client bundle. */ export function Icon({ icon, weight, ...props }) {
    const provider = icon?.provider ?? '';
    const name = icon?.name ?? '';
    const definitions = useIconDefinitions(provider, name ? [
        name
    ] : [], weight);
    const definition = definitions[name];
    return definition ? /*#__PURE__*/ _jsx(SerializedIconSvg, {
        definition: definition,
        ...props,
        weight: weight
    }) : null;
}

//# sourceMappingURL=Icon.js.map