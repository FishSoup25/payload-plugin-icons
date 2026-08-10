import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// Next compiles literal imports (and Lucide's full export graph); keep this fixed server loader opaque.
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const nativeImport = Function('specifier', 'return import(specifier)');
const SAFE_TAGS = new Set([
    'circle',
    'ellipse',
    'g',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect'
]);
export function getPackageVersion(packageName) {
    const pkg = Reflect.apply(require, undefined, [
        `${packageName}/package.json`
    ]);
    return typeof pkg.version === 'string' ? pkg.version : 'unknown';
}
/** Load a fixed provider package through Node so bundlers never traverse its export graph. */ export function loadPackageModule(packageName) {
    return nativeImport(packageName);
}
export function isIconComponent(value) {
    return typeof value === 'function' || Boolean(value && typeof value === 'object' && '$$typeof' in value);
}
export function pascalToKebab(value) {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase();
}
function isSafeAttribute(name, outer) {
    if (/^on/i.test(name) || name === 'style' || name.includes(':')) {
        return false;
    }
    const shape = /^(?:c[xy]|[dxy]|height|opacity|points|r[xy]?|transform|width|x[12]|y[12])$/;
    const paint = /^(?:fill|stroke)(?:-(?:dasharray|dashoffset|linecap|linejoin|miterlimit|opacity|width))?$/;
    return paint.test(name) || !outer && shape.test(name);
}
function attributeName(name) {
    if (name === 'viewBox') {
        return name;
    }
    return name.replace(/[A-Z]/g, (letter)=>`-${letter.toLowerCase()}`);
}
function parseAttributes(props, outer = false) {
    const attributes = {};
    for (const [rawName, rawValue] of Object.entries(props)){
        const name = attributeName(rawName);
        const value = typeof rawValue === 'number' ? String(rawValue) : rawValue;
        if (typeof value === 'string' && isSafeAttribute(name, outer) && !/[<>&]|javascript:|url\(/i.test(value)) {
            attributes[name] = value;
        }
    }
    return attributes;
}
function validAttributes(value, outer) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const entries = Object.entries(value);
    return entries.length <= 32 && entries.every(([name, attribute])=>typeof attribute === 'string' && attribute.length <= 10_000 && isSafeAttribute(name, outer) && !/[<>&]|javascript:|url\(/i.test(attribute));
}
function validNode(value, depth) {
    if (depth > 16 || !value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const node = value;
    return typeof node.tag === 'string' && SAFE_TAGS.has(node.tag) && validAttributes(node.attributes, false) && (node.children === undefined || Array.isArray(node.children) && node.children.length <= 256 && node.children.every((child)=>validNode(child, depth + 1)));
}
function invoke(component, props) {
    let result;
    if (typeof component === 'function') {
        result = component(props);
    } else if (component && typeof component === 'object' && 'render' in component) {
        result = component.render(props, null);
    }
    if (!result || typeof result !== 'object' || !('type' in result) || !('props' in result)) {
        throw new Error('Provider icon did not return a React element');
    }
    return result;
}
function unwrapSvg(Component, props) {
    let element = invoke(Component, props);
    for(let depth = 0; depth < 8 && element.type !== 'svg'; depth++){
        element = invoke(element.type, element.props);
    }
    if (element.type !== 'svg') {
        throw new Error('Provider icon did not return an SVG root');
    }
    return element;
}
function serializeChildren(value) {
    if (Array.isArray(value)) {
        return value.flatMap(serializeChildren);
    }
    if (!value || typeof value !== 'object' || !('type' in value) || !('props' in value)) {
        return [];
    }
    const element = value;
    if (typeof element.type === 'symbol') {
        return serializeChildren(element.props.children);
    }
    if (typeof element.type !== 'string') {
        return serializeChildren(invoke(element.type, element.props));
    }
    const tag = element.type.toLowerCase();
    if (!SAFE_TAGS.has(tag)) {
        throw new Error(`Provider icon contains unsupported SVG element: ${tag}`);
    }
    const children = serializeChildren(element.props.children);
    return [
        {
            attributes: parseAttributes(element.props),
            children: children.length > 0 ? children : undefined,
            tag
        }
    ];
}
export function isSerializedIcon(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const icon = value;
    return typeof icon.viewBox === 'string' && icon.viewBox.length <= 100 && !/[<>&]/.test(icon.viewBox) && (icon.attributes === undefined || validAttributes(icon.attributes, true)) && Array.isArray(icon.nodes) && icon.nodes.length <= 256 && icon.nodes.every((node)=>validNode(node, 0));
}
/** Convert provider output to a small, validated structure safe for the client renderer. */ export function serializeIconComponent(Component, props = {}) {
    const svg = unwrapSvg(Component, props);
    const viewBox = svg.props.viewBox;
    if (typeof viewBox !== 'string') {
        throw new Error('Provider icon SVG is missing a viewBox');
    }
    return {
        attributes: parseAttributes(svg.props, true),
        nodes: serializeChildren(svg.props.children),
        viewBox
    };
}

//# sourceMappingURL=serverUtils.js.map