import MainLayout from '@/components/layout/MainLayout'

export default async function RootUILayout({ children, modal }: LayoutProps<'/'>) {
  return (
    <MainLayout>
      {children}
      {modal}
    </MainLayout>
  )
}
