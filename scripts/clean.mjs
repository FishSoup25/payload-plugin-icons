import { rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

for (const path of ['dist', 'tsconfig.tsbuildinfo']) {
  rmSync(resolve(root, path), { force: true, recursive: true })
}
