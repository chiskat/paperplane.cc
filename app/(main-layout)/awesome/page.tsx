import type { Metadata } from 'next'

import AwesomePageClient from './awesome-page-client'

export const metadata: Metadata = {
  title: 'Awesome - PaperPlane.cc',
}

export default function AwesomePage() {
  return <AwesomePageClient />
}
