import type { Config } from 'payload'

import { iconField as buildIconField, setIconPluginPackageImportSpecifier } from './fields/iconField.js'
import { lucideProvider } from './providers/lucide/index.js'
import { phosphorProvider } from './providers/phosphor/index.js'
import type {
  CreateIconPluginResult,
  IconFieldOptions,
  IconPluginOptions,
  IconProviderServerConfig,
} from './types.js'

export type {
  IconData,
  IconFieldOptions,
  IconPluginOptions,
  IconProviderServerConfig,
  CreateIconPluginResult,
} from './types.js'

export { iconField, setIconPluginPackageImportSpecifier } from './fields/iconField.js'
export { lucideProvider } from './providers/lucide/index.js'
export { phosphorProvider } from './providers/phosphor/index.js'
export { registerIconProviderClientFactory } from './providers/registry.js'

const defaultProviders = (): IconProviderServerConfig[] => [lucideProvider(), phosphorProvider()]

/**
 * Payload plugin: configures package import path used in admin component specifiers
 * and validates provider list. Register the same providers in each `iconField` (or use `createIconPlugin`).
 */
export function iconPlugin(
  pluginOptions: IconPluginOptions = { providers: defaultProviders() },
): (config: Config) => Config {
  const {
    providers = defaultProviders(),
    packageImport = 'payload-plugin-icons',
    disabled = false,
  } = pluginOptions

  return (config: Config): Config => {
    setIconPluginPackageImportSpecifier(packageImport)

    if (disabled) {
      return config
    }

    const incomingOnInit = config.onInit
    config.onInit = async (payload) => {
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }
      if (process.env.NODE_ENV === 'development') {
        const ids = new Set(providers.map((p) => p.id))
        if (ids.size !== providers.length) {
          // eslint-disable-next-line no-console
          console.warn('[iconPlugin] Duplicate provider ids in iconPlugin({ providers })')
        }
      }
    }

    return config
  }
}

/**
 * Returns a matched pair of `iconPlugin` and `iconField` so provider ids/labels stay in sync.
 */
export function createIconPlugin(
  options: Omit<IconPluginOptions, 'disabled'> & { disabled?: boolean },
): CreateIconPluginResult {
  const { providers, packageImport = 'payload-plugin-icons', disabled = false } = options
  const providerIds = providers.map((p) => p.id)
  const labelsById = Object.fromEntries(providers.map((p) => [p.id, p.label]))

  return {
    iconPlugin: iconPlugin({ providers, packageImport, disabled }),
    iconField: (fieldOptions: Omit<IconFieldOptions, 'providerIds' | 'labelsById'> & {
      providerIds?: string[]
      labelsById?: Record<string, string>
    }) =>
      buildIconField({
        ...fieldOptions,
        packageImport: fieldOptions.packageImport ?? packageImport,
        providerIds: fieldOptions.providerIds ?? providerIds,
        labelsById: fieldOptions.labelsById ?? labelsById,
      }),
  }
}
