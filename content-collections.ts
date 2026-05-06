import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

const articles = defineCollection({
  name: 'articles',
  directory: 'app/(main-layout)/(blog)/_articles/posts',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    old_filename: z.string().optional(),
    date: z.string(),
    tags: z.array(z.string()),
    categories: z.array(z.string()).length(1),
    content: z.string(),
  }),
})

const open = defineCollection({
  name: 'open',
  directory: 'app/(main-layout)/open/_list',
  include: '**/*.mdx',
  schema: z.object({
    name: z.string(),
    repo: z.string(),
    type: z.enum(['npm', 'docker']),
    homepage: z.url().optional(),
    techs: z.array(z.string()).optional(),
    override: z.object({ shields: z.string().optional() }).optional(),
    content: z.string(),
  }),
})

const demos = defineCollection({
  name: 'demos',
  directory: 'app/(main-layout)/demos/_list',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    href: z.url().optional(),
    hrefHighlight: z.string().optional(),
    type: z.enum(['frontend', 'backend', 'fullstack']),
    status: z.string(),
    repo: z.string(),
    backendRepo: z.string().optional(),
    techs: z.array(z.string()).optional(),
    content: z.string(),
  }),
})

const registry = defineCollection({
  name: 'registry',
  directory: 'app/(main-layout)/registry/_list',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    type: z.enum(['docker', 'npm', 'pypi']),
    repo: z.enum(['mirror', 'registry']),
    content: z.string(),
  }),
})

const snippet = defineCollection({
  name: 'snippet',
  directory: 'app/(main-layout)/snippet/_snippet',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    content: z.string(),
  }),
})

const kms = defineCollection({
  name: 'kms',
  directory: 'app/(main-layout)/kms/_docs',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    group: z.string().optional(),
    content: z.string(),
  }),
})

const llms = defineCollection({
  name: 'llms',
  directory: 'app/(misc)/llms.txt',
  include: 'llms.md',
  schema: z.object({
    content: z.string(),
  }),
})

export default defineConfig({
  content: [articles, open, demos, registry, snippet, kms, llms],
})
