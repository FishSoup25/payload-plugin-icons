/**
 * Lucide's kebab-case icon ids map to PascalCase exports on the `lucide-react` package.
 * These helpers mirror `dist/esm/shared/src/utils.js` in lucide-react so aliases such as
 * `arrow-down-0-1` → `ArrowDown01` match the bundled exports.
 */
export function lucideKebabToCamelCase(string: string): string {
  return string.replace(/^([A-Z])|[-\s_]+(\w)/g, (match, p1: string, p2: string) =>
    p2 ? p2.toUpperCase() : p1.toLowerCase(),
  )
}

export function lucideKebabToPascalCase(string: string): string {
  const camelCase = lucideKebabToCamelCase(string)
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}
