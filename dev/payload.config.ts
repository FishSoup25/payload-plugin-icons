import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import {
  createIconPlugin,
  lucideProvider,
  phosphorProvider,
} from 'payload-plugin-icons'
import sharp from 'sharp'
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
    {
      slug: 'media',
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
    },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true,
  }),
  editor: lexicalEditor(),
  email: testEmailAdapter,
  plugins: [iconPlugin],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
