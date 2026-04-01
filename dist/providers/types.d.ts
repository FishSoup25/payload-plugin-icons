import type { ComponentType, SVGProps } from 'react';
/**
 * Props forwarded to the underlying library icon. Consumers style/size icons by passing these when rendering.
 */
export type IconGlyphProps = {
    size?: number | string;
    /** Phosphor: thin | light | regular | bold | fill | duotone */
    weight?: string;
} & Omit<SVGProps<SVGSVGElement>, 'ref'>;
/** Client-side provider API (admin picker + frontend). */
export type IconProviderClient = {
    /** Category key -> icon names (same as brainy-builds prefix grouping). */
    getCategoryMap(): Record<string, string[]>;
    getCategoryRepresentative(category: string): string;
    /** Sorted unique icon identifiers for this provider. */
    getIconNames(): readonly string[];
    id: string;
    label: string;
    /**
     * React component for this icon name, or null if unknown.
     * Render with whatever {@link IconGlyphProps} (or provider-specific props) you need.
     *
     * **Admin / picker:** Implementations must resolve icons from an **eager** module graph — for example
     * a single `import * as Icons from '…'` or a static map. Do **not** use per-icon `React.lazy(() => import(…))`
     * or other patterns that emit one async chunk per icon; that floods the server with static asset requests
     * when many previews mount (see built-in Lucide + Phosphor providers).
     */
    resolveIconComponent(name: string): ComponentType<IconGlyphProps> | null;
};
