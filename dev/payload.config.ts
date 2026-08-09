import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'
import { buildConfig } from 'payload'
import {
  createIconPlugin,
  lucideProvider,
  phosphorProvider,
} from 'payload-plugin-icons'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const iconProviders = [lucideProvider(), phosphorProvider()]

const { iconField, iconPlugin } = createIconPlugin({
  packageImport: 'payload-plugin-icons',
  providers: iconProviders,
})

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'icon-displays',
      admin: {
        defaultColumns: ['title', 'icon'],
        description:
          'Each document is one row on the dev site root (/), so you can try different icons and see them together.',
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        iconField({
          name: 'icon',
          label: 'Icon',
          required: false,
        }),
      ],
      labels: {
        plural: 'Icon displays',
        singular: 'Icon display',
      },
    },
  ],
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./dev/payload.db',
    },
    push: true,
  }),
  email: testEmailAdapter,
  plugins: [iconPlugin],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
