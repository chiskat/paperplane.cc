import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '制品库 - PaperPlane.cc',
}

export default function RegistryPage() {
  redirect('/registry/docker-mirror')
}
