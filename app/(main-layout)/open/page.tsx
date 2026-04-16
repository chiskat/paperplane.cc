import { redirect } from 'next/navigation'

import { sort } from './sort'

export default function OpenPage() {
  redirect(`/open/${sort[0]}`)
}
