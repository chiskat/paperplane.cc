import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '博文标签 - PaperPlane.cc',
}

export default function PostPage() {
  return redirect('/')
}
