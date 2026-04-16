import { redirect } from 'next/navigation'

import { sort } from './sort'

export default function DemosPage() {
  redirect(`/demos/${sort[0]}`)
}
