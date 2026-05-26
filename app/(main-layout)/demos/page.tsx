import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { sort } from './sort'

export const metadata: Metadata = {
  title: 'Demos - PaperPlane.cc',
}

export default function DemosPage() {
  redirect(`/demos/${sort[0]}`)
}
