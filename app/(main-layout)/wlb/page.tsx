import type { Metadata } from 'next'

import WLBPageClient from './wlb-page-client'

export const metadata: Metadata = {
  title: 'Work Life Balance - PaperPlane.cc',
}

export default function WLBPage() {
  return <WLBPageClient />
}
