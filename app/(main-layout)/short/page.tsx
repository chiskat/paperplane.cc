import type { Metadata } from 'next'

import ShortPageClient from './page-client'

export const metadata: Metadata = {
  title: '短链接 - PaperPlane.cc',
}

export default function ShortPage() {
  return <ShortPageClient />
}
