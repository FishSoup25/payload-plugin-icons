import { createRequire } from 'node:module';
import { createElement } from 'react';
const require = createRequire(import.meta.url);
const serverRenderer = Reflect.apply(require, undefined, [
    [
        'react-dom',
        'server'
    ].join('/')
]);
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
function decodeHtml(value) {
    return value.replace(/&(#(?:x[\da-f]+|\d+)|amp|apos|gt|lt|quot);/gi, (entity, code)=>{
        if (code[0] === '#') {
            const hex = code[1]?.toLowerCase() === 'x';
            const number = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
            if (!Number.isSafeInteger(number) || number < 0 || number > 0x10FFFF) {
                throw new Error('Provider icon contains an invalid character reference');
            }
            return String.fromCodePoint(number);
        }
        return ({
            amp: '&',
            apos: "'",
            gt: '>',
            lt: '<',
            quot: '"'
        })[code.toLowerCase()] ?? entity;
    });
}
function renderedAttributes(source) {
    const attributes = {};
    let rest = source.trim();
    while(rest){
        const match = /^([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')\s*/.exec(rest);
        if (!match) {
            throw new Error('Provider icon rendered an invalid SVG attribute');
        }
        attributes[match[1]] = decodeHtml(match[2] ?? match[3] ?? '');
        rest = rest.slice(match[0].length);
    }
    return attributes;
}
function parseRenderedSvg(markup) {
    if (markup.length > 1_000_000) {
        throw new Error('Provider icon SVG is too large');
    }
    const stack = [];
    let root;
    let position = 0;
    while(position < markup.length){
        const openingBracket = markup.indexOf('<', position);
        if (openingBracket < 0) {
            if (markup.slice(position).trim()) {
                throw new Error('Provider icon SVG cannot contain text');
            }
            break;
        }
        if (markup.slice(position, openingBracket).trim()) {
            throw new Error('Provider icon SVG cannot contain text');
        }
        if (markup.startsWith('<!--', openingBracket)) {
            const commentEnd = markup.indexOf('-->', openingBracket + 4);
            if (commentEnd < 0) {
                throw new Error('Provider icon rendered an invalid comment');
            }
            position = commentEnd + 3;
            continue;
        }
        const closingBracket = markup.indexOf('>', openingBracket + 1);
        if (closingBracket < 0) {
            throw new Error('Provider icon rendered invalid SVG markup');
        }
        const token = markup.slice(openingBracket, closingBracket + 1);
        position = closingBracket + 1;
        const closing = /^<\/([a-z][\w:-]*)\s*>$/i.exec(token);
        if (closing) {
            const node = stack.pop();
            if (!node || node.tag !== closing[1].toLowerCase()) {
                throw new Error('Provider icon rendered mismatched SVG tags');
            }
            continue;
        }
        const selfClosing = token.endsWith('/>');
        const body = token.slice(1, selfClosing ? -2 : -1).trim();
        const separator = body.search(/\s/);
        const tag = (separator < 0 ? body : body.slice(0, separator)).toLowerCase();
        if (!/^[a-z][\w:-]*$/i.test(tag)) {
            throw new Error('Provider icon rendered invalid SVG markup');
        }
        const node = {
            attributes: renderedAttributes(separator < 0 ? '' : body.slice(separator + 1)),
            children: [],
            tag
        };
        const parent = stack.at(-1);
        if (parent) {
            parent.children.push(node);
        } else if (!root) {
            root = node;
        } else {
            throw new Error('Provider icon must render one SVG root');
        }
        if (!selfClosing) {
            stack.push(node);
        }
    }
    if (!root || stack.length > 0 || root.tag !== 'svg') {
        throw new Error('Provider icon did not render a valid SVG root');
    }
    return root;
}
function serializeRenderedNode(node) {
    if (!SAFE_TAGS.has(node.tag)) {
        throw new Error(`Provider icon contains unsupported SVG element: ${node.tag}`);
    }
    const children = node.children.map(serializeRenderedNode);
    return {
        attributes: parseAttributes(node.attributes),
        children: children.length > 0 ? children : undefined,
        tag: node.tag
    };
}
export function isSerializedIcon(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const icon = value;
    return typeof icon.viewBox === 'string' && icon.viewBox.length <= 100 && !/[<>&]/.test(icon.viewBox) && (icon.attributes === undefined || validAttributes(icon.attributes, true)) && Array.isArray(icon.nodes) && icon.nodes.length <= 256 && icon.nodes.every((node)=>validNode(node, 0));
}
/** Convert provider output to a small, validated structure safe for the client renderer. */ export function serializeIconComponent(Component, props = {}) {
    const svg = parseRenderedSvg(serverRenderer.renderToStaticMarkup(createElement(Component, props)));
    const viewBox = svg.attributes.viewBox;
    if (typeof viewBox !== 'string') {
        throw new Error('Provider icon SVG is missing a viewBox');
    }
    return {
        attributes: parseAttributes(svg.attributes, true),
        nodes: svg.children.map(serializeRenderedNode),
        viewBox
    };
}

//# sourceMappingURL=serverUtils.js.map