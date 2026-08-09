import type { Field } from 'payload'

import type { IconFieldOptions } from '../types.js'

const DEFAULT_PROVIDER_IDS = ['lucide', 'phosphor'] as const
const DEFAULT_PACKAGE_IMPORT = 'payload-plugin-icons'

function assertValidProviderIds(providerIds: string[], defaultProviderId: string): void {
  if (providerIds.length === 0) {
    throw new Error('[payload-plugin-icons] iconField requires at least one provider')
  }
  if (providerIds.some((id) => id.trim() === '')) {
    throw new Error('[payload-plugin-icons] provider ids cannot be empty')
  }
  if (new Set(providerIds).size !== providerIds.length) {
    throw new Error('[payload-plugin-icons] provider ids must be unique')
  }
  if (!providerIds.includes(defaultProviderId)) {
    throw new Error(
      `[payload-plugin-icons] default provider "${defaultProviderId}" is not enabled for field`,
    )
  }
}

export function iconField(options: IconFieldOptions): Field {
  const {
    name,
    admin: adminOverride,
    providerIds = [...DEFAULT_PROVIDER_IDS],
    defaultProviderId = providerIds[0],
    label,
    labelsById,
    packageImport = DEFAULT_PACKAGE_IMPORT,
    required,
  } = options

  if (!packageImport.trim()) {
    throw new Error('[payload-plugin-icons] packageImport cannot be empty')
  }
  if (!defaultProviderId) {
    throw new Error('[payload-plugin-icons] iconField requires a default provider')
  }
  assertValidProviderIds(providerIds, defaultProviderId)

  const clientPath = `${packageImport}/client#IconSelectField`
  const cellPath = `${packageImport}/client#IconCell`
  const { components: adminComponents, ...admin } = adminOverride ?? {}

  return {
    name,
    type: 'group',
    admin: {
      ...admin,
      components: {
        ...adminComponents,
        Cell: {
          clientProps: {
            labelsById,
            providerIds,
          },
          path: cellPath,
        },
        Field: {
          clientProps: {
            labelsById,
            providerIds,
          },
          path: clientPath,
        },
      },
    },
    defaultValue: {
      name: '',
      provider: defaultProviderId,
    },
    fields: [
      {
        name: 'provider',
        type: 'text',
        admin: {
          hidden: true,
        },
        required: true,
      },
      {
        name: 'name',
        type: 'text',
        admin: {
          hidden: true,
        },
        required: Boolean(required),
      },
    ],
    label,
    required,
  } as Field
}
