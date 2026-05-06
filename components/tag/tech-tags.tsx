import Image from 'next/image'
import type { ImageProps } from 'next/image'
import Link from 'next/link'

import antdIcon from '@/assets/tech-icons/antd.svg'
import codeReferenceIcon from '@/assets/tech-icons/code-reference.svg'
import craIcon from '@/assets/tech-icons/cra.svg'
import dockerIcon from '@/assets/tech-icons/docker.svg'
import dumiIcon from '@/assets/tech-icons/dumi.png'
import elementIcon from '@/assets/tech-icons/element.svg'
import hexoIcon from '@/assets/tech-icons/hexo.svg'
import itToolsIcon from '@/assets/tech-icons/it-tools.png'
import joplinIcon from '@/assets/tech-icons/joplin.png'
import mantineIcon from '@/assets/tech-icons/mantine.svg'
import memosIcon from '@/assets/tech-icons/memos.png'
import mongodbIcon from '@/assets/tech-icons/mongodb.svg'
import muiIcon from '@/assets/tech-icons/mui.svg'
import nestjsIcon from '@/assets/tech-icons/nestjs.svg'
import nextchatIcon from '@/assets/tech-icons/nextchat.png'
import nextjsIcon from '@/assets/tech-icons/nextjs.svg'
import nodejsIcon from '@/assets/tech-icons/nodejs.svg'
import openwebuiIcon from '@/assets/tech-icons/openwebui.png'
import postgresqlIcon from '@/assets/tech-icons/postgresql.svg'
import prismaIcon from '@/assets/tech-icons/prisma.svg'
import reactIcon from '@/assets/tech-icons/react.svg'
import redisIcon from '@/assets/tech-icons/redis.svg'
import restifyIcon from '@/assets/tech-icons/restify.svg'
import shadcnIcon from '@/assets/tech-icons/shadcn.svg'
import shieldsIcon from '@/assets/tech-icons/shields-io.png'
import tdesignIcon from '@/assets/tech-icons/tdesign.svg'
import trpcIcon from '@/assets/tech-icons/trpc.svg'
import viteIcon from '@/assets/tech-icons/vite.svg'
import vueIcon from '@/assets/tech-icons/vue.svg'
import webpackIcon from '@/assets/tech-icons/webpack.svg'
import { cn } from '@/utils/style'

export const techIcons = {
  antd: antdIcon,
  codereference: codeReferenceIcon,
  cra: craIcon,
  docker: dockerIcon,
  dumi: dumiIcon,
  element: elementIcon,
  hexo: hexoIcon,
  ittools: itToolsIcon,
  joplin: joplinIcon,
  mantine: mantineIcon,
  memos: memosIcon,
  mongodb: mongodbIcon,
  mui: muiIcon,
  nestjs: nestjsIcon,
  nextchat: nextchatIcon,
  nextjs: nextjsIcon,
  nodejs: nodejsIcon,
  openwebui: openwebuiIcon,
  postgresql: postgresqlIcon,
  prisma: prismaIcon,
  react: reactIcon,
  redis: redisIcon,
  restify: restifyIcon,
  shadcn: shadcnIcon,
  shieldsio: shieldsIcon,
  tdesign: tdesignIcon,
  trpc: trpcIcon,
  vite: viteIcon,
  vue: vueIcon,
  webpack: webpackIcon,
} satisfies Record<string, ImageProps['src']>

export interface TechTagProps {
  icon: ImageProps['src']
  alt?: string
  name: string
  href: string
  className?: string
}

export function TechTag({ icon, alt, name, href, className }: TechTagProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group inline-flex items-center gap-2 rounded-xs border border-[#d4deeb] bg-[#fcfeff] px-2 py-1 text-sm text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-200 hover:border-[#2f629d] hover:bg-[#f3f8fd] hover:text-[#2a5a94] hover:shadow-[0_3px_8px_rgba(47,98,157,0.12)]',
        className
      )}
    >
      <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center">
        <Image src={icon} alt={alt ?? name} width={16} height={16} className="h-4 w-4" />
      </span>
      <span>{name}</span>
    </Link>
  )
}

interface CreateTechTagOptions {
  name: string
  href: string
  icon: ImageProps['src']
  alt?: string
}

export function createTechTag({ name, href, icon, alt }: CreateTechTagOptions) {
  return function CreatedTechTag({ className }: Pick<TechTagProps, 'className'>) {
    return <TechTag name={name} href={href} icon={icon} alt={alt} className={className} />
  }
}

type CreatedTechTag = ReturnType<typeof createTechTag>

export const HexoTag = createTechTag({
  name: 'Hexo',
  href: 'https://hexo.io/zh-cn/',
  icon: hexoIcon,
})

export const MemosTag = createTechTag({
  name: 'Memos',
  href: 'https://www.usememos.com/',
  icon: memosIcon,
})

export const NextChatTag = createTechTag({
  name: 'NextChat',
  href: 'https://nextchat.dev/',
  icon: nextchatIcon,
})

export const OpenWebUITag = createTechTag({
  name: 'OpenWebUI',
  href: 'https://openwebui.com/',
  icon: openwebuiIcon,
})

export const ITToolsTag = createTechTag({
  name: 'IT-Tools',
  href: 'https://github.com/CorentinTh/it-tools/',
  icon: itToolsIcon,
})

export const QuickReferenceTag = createTechTag({
  name: 'Quick Reference',
  href: 'https://github.com/jaywcjlove/reference',
  icon: codeReferenceIcon,
})

export const JoplinTag = createTechTag({
  name: 'Joplin',
  href: 'https://joplinapp.org/',
  icon: joplinIcon,
})

export const ShieldsTag = createTechTag({
  name: 'Shields.io',
  href: 'https://shields.io/',
  icon: shieldsIcon,
})

export const ReactTag = createTechTag({
  name: 'React',
  href: 'https://react.dev/',
  icon: reactIcon,
  alt: 'React',
})

export const VueTag = createTechTag({
  name: 'Vue',
  href: 'https://cn.vuejs.org/index.html',
  icon: vueIcon,
})

export const CRATag = createTechTag({
  name: 'Create React App',
  href: 'https://create-react-app.dev/',
  icon: craIcon,
})

export const WebpackTag = createTechTag({
  name: 'Webpack',
  href: 'https://webpack.js.org/',
  icon: webpackIcon,
})

export const ViteTag = createTechTag({
  name: 'Vite',
  href: 'https://vitejs.dev/',
  icon: viteIcon,
})

export const AntDTag = createTechTag({
  name: 'AntD',
  href: 'https://ant-design.antgroup.com/index-cn',
  icon: antdIcon,
})

export const MuiTag = createTechTag({
  name: 'MUI',
  href: 'https://mui.com/material-ui/',
  icon: muiIcon,
})

export const DockerTag = createTechTag({
  name: 'Docker',
  href: 'https://www.docker.com/',
  icon: dockerIcon,
})

export const NodejsTag = createTechTag({
  name: 'Node.js',
  href: 'https://nodejs.org/',
  icon: nodejsIcon,
})

export const TDesignTag = createTechTag({
  name: 'TDesign',
  href: 'https://tdesign.tencent.com/react',
  icon: tdesignIcon,
})

export const NestjsTag = createTechTag({
  name: 'Nest.js',
  href: 'https://nestjs.com/',
  icon: nestjsIcon,
})

export const PrismaTag = createTechTag({
  name: 'Prisma',
  href: 'https://www.prisma.io/',
  icon: prismaIcon,
})

export const PostgreSQLTag = createTechTag({
  name: 'PostgreSQL',
  href: 'https://www.postgresql.org/',
  icon: postgresqlIcon,
})

export const RedisTag = createTechTag({
  name: 'Redis',
  href: 'https://redis.io/',
  icon: redisIcon,
})

export const NextjsTag = createTechTag({
  name: 'Next.js',
  href: 'https://nextjs.org/',
  icon: nextjsIcon,
})

export const DumiTag = createTechTag({
  name: 'Dumi',
  href: 'https://d.umijs.org/zh-CN',
  icon: dumiIcon,
})

export const ElementTag = createTechTag({
  name: 'Element',
  href: 'https://element.eleme.cn/#/zh-CN',
  icon: elementIcon,
})

export const RestifyTag = createTechTag({
  name: 'Restify',
  href: 'http://restify.com/',
  icon: restifyIcon,
})

export const MongoDBTag = createTechTag({
  name: 'MongoDB',
  href: 'https://www.mongodb.com/',
  icon: mongodbIcon,
})

export const MantineTag = createTechTag({
  name: 'MantineUI',
  href: 'https://mantine.dev/',
  icon: mantineIcon,
})

export const TRPCTag = createTechTag({
  name: 'tRPC',
  href: 'https://trpc.io/',
  icon: trpcIcon,
})

export const ShadcnTag = createTechTag({
  name: 'shadcn/ui',
  href: 'https://ui.shadcn.com/',
  icon: shadcnIcon,
  alt: 'shadcn/ui',
})

const techTagsByName: Record<string, CreatedTechTag> = {
  antd: AntDTag,
  codereference: QuickReferenceTag,
  createreactapp: CRATag,
  cra: CRATag,
  docker: DockerTag,
  dumi: DumiTag,
  element: ElementTag,
  hexo: HexoTag,
  ittools: ITToolsTag,
  joplin: JoplinTag,
  mantine: MantineTag,
  mantineui: MantineTag,
  memos: MemosTag,
  mongodb: MongoDBTag,
  mui: MuiTag,
  nestjs: NestjsTag,
  nextchat: NextChatTag,
  nextjs: NextjsTag,
  nodejs: NodejsTag,
  openwebui: OpenWebUITag,
  postgresql: PostgreSQLTag,
  prisma: PrismaTag,
  quickreference: QuickReferenceTag,
  react: ReactTag,
  redis: RedisTag,
  restify: RestifyTag,
  shadcn: ShadcnTag,
  shadcnui: ShadcnTag,
  shields: ShieldsTag,
  shieldsio: ShieldsTag,
  tdesign: TDesignTag,
  trpc: TRPCTag,
  vite: ViteTag,
  vue: VueTag,
  webpack: WebpackTag,
}

export function getTechTagByName(name: string): CreatedTechTag | null {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  return techTagsByName[normalizedName] ?? null
}
