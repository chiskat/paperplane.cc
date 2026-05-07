import path from 'path'
import { withContentCollections } from '@content-collections/next'
import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  assetPrefix:
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_CDN_BASE_URL || undefined
      : undefined,
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: `cdn.paperplane.cc` },
      { protocol: 'https', hostname: `shields.paperplane.cc` },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      ['remark-frontmatter'],
      ['remark-mdx-frontmatter'],
      ['remark-gfm'],
      ['remark-directive'],
      [path.resolve(process.cwd(), './plugins/remark-plain-text-directive.mjs')],
      [path.resolve(process.cwd(), './plugins/remark-alert-directive.mjs')],
      [path.resolve(process.cwd(), './plugins/remark-collapse-directive.mjs')],
      [path.resolve(process.cwd(), './plugins/remark-tabs-directive.mjs')],
      [path.resolve(process.cwd(), './plugins/remark-code-group.mjs')],
    ],
    rehypePlugins: [
      ['rehype-mdx-import-media'],
      ['rehype-slug'],
      [
        'rehype-autolink-headings',
        {
          behavior: 'append',
          content: [{ type: 'text', value: '#' }],
          properties: { className: ['heading-anchor'] },
        },
      ],
      ['rehype-pretty-code', { theme: 'github-light', keepBackground: false }],
    ],
  },
})

export default withContentCollections(withMDX(nextConfig))
