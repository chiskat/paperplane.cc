import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { sort } from './sort'

export const metadata: Metadata = {
  title: '开源项目 - PaperPlane.cc',
}

export default function OpenPage() {
  redirect(`/open/${sort[0]}`)
}
