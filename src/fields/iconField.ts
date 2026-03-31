import type { Field } from 'payload'

import type { IconFieldOptions } from '../types.js'

const DEFAULT_PROVIDER_IDS = ['lucide', 'phosphor'] as const

/** Set by iconPlugin at build time (same process as buildConfig). */
let packageImportSpecifier = 'payload-plugin-icons'

export function setIconPluginPackageImportSpecifier(spec: string): void {
  packageImportSpecifier = spec
}

export function getIconPluginPackageImportSpecifier(): string {
  return packageImportSpecifier
}

export function iconField(options: IconFieldOptions): Field {
  const {
    name,
    label,
    required,
    providerIds = [...DEFAULT_PROVIDER_IDS],
    labelsById,
    defaultProviderId = providerIds[0],
    packageImport: packageImportOverride,
    admin: adminOverride,
  } = options

  const spec = packageImportOverride ?? packageImportSpecifier
  const clientPath = `${spec}/client#IconSelectField`
  const cellPath = `${spec}/client#IconCell`

  const defaultValue =
    defaultProviderId && providerIds.includes(defaultProviderId)
      ? { provider: defaultProviderId, name: '' }
      : { provider: providerIds[0] ?? 'lucide', name: '' }

  return {
    name,
    type: 'group',
    label,
    required,
    ...(defaultValue.provider
      ? {
          defaultValue: {
            provider: defaultValue.provider,
            name: defaultValue.name,
          },
        }
      : {}),
    fields: [
      {
        name: 'provider',
        type: 'text',
        required: true,
        admin: {
          hidden: true,
        },
      },
      {
        name: 'name',
        type: 'text',
        required: Boolean(required),
        admin: {
          hidden: true,
        },
      },
    ],
    admin: {
      ...adminOverride,
      components: {
        Field: {
          path: clientPath,
          clientProps: {
            providerIds,
            labelsById,
          },
        },
        Cell: {
          path: cellPath,
          clientProps: {
            providerIds,
            labelsById,
          },
        },
      },
    },
  } as Field
}
