import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { sort } from './sort'

export const metadata: Metadata = {
  title: 'Open - PaperPlane.cc',
}

export default function OpenPage() {
  redirect(`/open/${sort[0]}`)
}
