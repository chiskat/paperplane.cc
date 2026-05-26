import type { Metadata } from 'next'

import AwesomePageClient from './AwesomePageClient'

export const metadata: Metadata = {
  title: 'Awesome - PaperPlane.cc',
}

export default function AwesomePage() {
  return <AwesomePageClient />
}
