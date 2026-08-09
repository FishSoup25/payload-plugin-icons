declare module 'lucide-react/dynamicIconImports.mjs' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'

  type LucideIcon = ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> & {
      absoluteStrokeWidth?: boolean
      size?: number | string
    } &
      RefAttributes<SVGSVGElement>
  >

  const dynamicIconImports: Record<string, () => Promise<{ default: LucideIcon }>>
  export default dynamicIconImports
}
