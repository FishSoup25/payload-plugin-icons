import type { IconProviderServerConfig } from '../../types.js'

export function lucideProvider(
  overrides?: Partial<Pick<IconProviderServerConfig, 'id' | 'label'>>,
): IconProviderServerConfig {
  return {
    id: overrides?.id ?? 'lucide',
    label: overrides?.label ?? 'Lucide',
  }
}
