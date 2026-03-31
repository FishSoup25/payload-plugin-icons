/**
 * Lucide ships `dynamicIconImports.mjs` at package root without `package.exports`;
 * Node ESM only auto-resolves `.js`/`.json`/`.node`, so the specifier must include `.mjs`.
 * Avoid `lucide-react/dynamic` in isomorphic code: its re-exports break under Node (CJS `.js` interop).
 */
declare module 'lucide-react/dynamicIconImports.mjs' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'

  type LucideIcon = ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> & RefAttributes<SVGSVGElement> & {
      size?: string | number
      absoluteStrokeWidth?: boolean
    }
  >

  const dynamicIconImports: Record<string, () => Promise<{ default: LucideIcon }>>
  export default dynamicIconImports
}
