import type { IconProviderServerConfig } from '../../types.js'

export function phosphorProvider(
  overrides?: Partial<Pick<IconProviderServerConfig, 'id' | 'label'>>,
): IconProviderServerConfig {
  return {
    id: overrides?.id ?? 'phosphor',
    label: overrides?.label ?? 'Phosphor',
  }
}
