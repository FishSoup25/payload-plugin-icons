import type { Config, Field, GroupField } from 'payload'

/** Registered in `iconPlugin({ providers: [...] })`. */
export type IconProviderServerConfig = {
  id: string
  label: string
}

/** Value stored for an icon in the database (group field shape). */
export type IconData = {
  provider: string
  name?: string | null
}

export type IconFieldOptions = {
  name: string
  label?: GroupField['label']
  required?: boolean
  /**
   * Provider ids enabled for this field. Must match ids passed to `iconPlugin({ providers })`.
   * Defaults to `['lucide', 'phosphor']`.
   */
  providerIds?: string[]
  /** Admin/provider dropdown labels (should match `iconPlugin({ providers })` labels). */
  labelsById?: Record<string, string>
  /** Default provider when empty (first in providerIds if omitted). */
  defaultProviderId?: string
  /**
   * NPM/import specifier for admin component paths (e.g. dev alias).
   * If omitted, uses the value set by `iconPlugin` via `setIconPluginPackageImportSpecifier` (must be set before `iconField()` runs — see dev `payload.config.ts`).
   */
  packageImport?: string
  admin?: Field['admin']
}

export type IconPluginOptions = {
  providers: IconProviderServerConfig[]
  /**
   * Optional NPM/import specifier used in admin component paths.
   * Dev apps should use their tsconfig alias (e.g. `plugin-package-name-placeholder`).
   */
  packageImport?: string
  disabled?: boolean
}

/** Result of createIconPlugin: pre-bound field helper + plugin. */
export type CreateIconPluginResult = {
  iconPlugin: (config: Config) => Config
  iconField: (options: Omit<IconFieldOptions, 'providerIds'> & { providerIds?: string[] }) => Field
}
