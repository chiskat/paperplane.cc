import { getAwesomeMetadata } from '@/app/(main-layout)/awesome/_item/awesome-metadata'

export async function generateMetadata({ params }: LayoutProps<'/awesome/[id]'>) {
  const { id } = await params
  return getAwesomeMetadata(id)
}

export default function AwesomeDetailModalLayout({ children }: LayoutProps<'/awesome/[id]'>) {
  return children
}
