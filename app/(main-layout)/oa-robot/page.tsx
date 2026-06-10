import type { Metadata } from 'next'

import OARobotPageClient from './oa-robot-page-client'

export const metadata: Metadata = {
  title: 'OA 机器人 - PaperPlane.cc',
}

export default function OARobotPage() {
  return <OARobotPageClient />
}
