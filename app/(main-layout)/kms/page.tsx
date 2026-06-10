import type { Metadata } from 'next'

import KmsPageClient from './kms-page-client'

export const metadata: Metadata = {
  title: 'KMS 激活 - PaperPlane.cc',
}

export default function KmsPage() {
  return <KmsPageClient />
}
