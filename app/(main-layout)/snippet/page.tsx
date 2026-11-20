import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '样板与配置 - PaperPlane.cc',
}

export default function SnippetPage() {
  return redirect('/snippet/command/npm')
}
