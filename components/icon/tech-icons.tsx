import Image, { type StaticImageData } from 'next/image'
import type { CSSProperties } from 'react'

import AlistAsset from '@/assets/tech-icons/alist.svg'
import AntdAsset from '@/assets/tech-icons/antd.svg'
import CodeReferenceAsset from '@/assets/tech-icons/code-reference.svg'
import CraAsset from '@/assets/tech-icons/cra.svg'
import DockerRegistryAsset from '@/assets/tech-icons/docker-registry.svg'
import DockerAsset from '@/assets/tech-icons/docker.svg'
import DroneAsset from '@/assets/tech-icons/drone.svg'
import DumiAsset from '@/assets/tech-icons/dumi.png'
import ElementAsset from '@/assets/tech-icons/element.svg'
import GiteaAsset from '@/assets/tech-icons/gitea.svg'
import GithubAsset from '@/assets/tech-icons/github.svg'
import HexoAsset from '@/assets/tech-icons/hexo.svg'
import ITToolsAsset from '@/assets/tech-icons/it-tools.png'
import JoplinAsset from '@/assets/tech-icons/joplin.png'
import MantineAsset from '@/assets/tech-icons/mantine.svg'
import MemosAsset from '@/assets/tech-icons/memos.png'
import MongodbAsset from '@/assets/tech-icons/mongodb.svg'
import MuiAsset from '@/assets/tech-icons/mui.svg'
import NestjsAsset from '@/assets/tech-icons/nestjs.svg'
import NextchatAsset from '@/assets/tech-icons/nextchat.png'
import NextjsAsset from '@/assets/tech-icons/nextjs.svg'
import NodejsAsset from '@/assets/tech-icons/nodejs.svg'
import NpmFlatAsset from '@/assets/tech-icons/npm-flat.svg'
import NpmAsset from '@/assets/tech-icons/npm.svg'
import OpenwebuiAsset from '@/assets/tech-icons/openwebui.png'
import PostgresqlAsset from '@/assets/tech-icons/postgresql.svg'
import PrismaAsset from '@/assets/tech-icons/prisma.svg'
import PypiAsset from '@/assets/tech-icons/pypi.svg'
import QinglongAsset from '@/assets/tech-icons/qinglong.png'
import RabbitmqAsset from '@/assets/tech-icons/rabbitmq.svg'
import RadixAsset from '@/assets/tech-icons/radix.svg'
import ReactAsset from '@/assets/tech-icons/react.svg'
import RedisAsset from '@/assets/tech-icons/redis.svg'
import RestifyAsset from '@/assets/tech-icons/restify.svg'
import ShadcnAsset from '@/assets/tech-icons/shadcn.svg'
import ShieldsioAsset from '@/assets/tech-icons/shields-io.png'
import TdesignAsset from '@/assets/tech-icons/tdesign.svg'
import TrpcAsset from '@/assets/tech-icons/trpc.svg'
import VerdaccioAsset from '@/assets/tech-icons/verdaccio.svg'
import ViteAsset from '@/assets/tech-icons/vite.svg'
import VueAsset from '@/assets/tech-icons/vue.svg'
import WebpackAsset from '@/assets/tech-icons/webpack.svg'
import { cn } from '@/utils/style'

export interface TechIconProps {
  className?: string
  style?: CSSProperties
  size?: number | string
}

export function createTechIcon(src: StaticImageData, alt: string) {
  return function TechIcon({ className, style, size = '1em' }: TechIconProps) {
    return (
      <Image
        src={src}
        alt={alt}
        className={cn('inline-block', className)}
        style={{ width: size, height: size, ...style }}
      />
    )
  }
}

export const AlistIcon = createTechIcon(AlistAsset, 'alist')
export const AntdIcon = createTechIcon(AntdAsset, 'antd')
export const CodeReferenceIcon = createTechIcon(CodeReferenceAsset, 'code-reference')
export const CraIcon = createTechIcon(CraAsset, 'cra')
export const DockerRegistryIcon = createTechIcon(DockerRegistryAsset, 'docker-registry')
export const DockerIcon = createTechIcon(DockerAsset, 'docker')
export const DroneIcon = createTechIcon(DroneAsset, 'drone')
export const DumiIcon = createTechIcon(DumiAsset, 'dumi')
export const ElementIcon = createTechIcon(ElementAsset, 'element')
export const GiteaIcon = createTechIcon(GiteaAsset, 'gitea')
export const GithubIcon = createTechIcon(GithubAsset, 'github')
export const HexoIcon = createTechIcon(HexoAsset, 'hexo')
export const ITToolsIcon = createTechIcon(ITToolsAsset, 'it-tools')
export const JoplinIcon = createTechIcon(JoplinAsset, 'joplin')
export const MantineIcon = createTechIcon(MantineAsset, 'mantine')
export const MemosIcon = createTechIcon(MemosAsset, 'memos')
export const MongodbIcon = createTechIcon(MongodbAsset, 'mongodb')
export const MuiIcon = createTechIcon(MuiAsset, 'mui')
export const NestjsIcon = createTechIcon(NestjsAsset, 'nestjs')
export const NextchatIcon = createTechIcon(NextchatAsset, 'nextchat')
export const NextjsIcon = createTechIcon(NextjsAsset, 'nextjs')
export const NodejsIcon = createTechIcon(NodejsAsset, 'nodejs')
export const NpmFlatIcon = createTechIcon(NpmFlatAsset, 'npm')
export const NpmIcon = createTechIcon(NpmAsset, 'npm')
export const OpenwebuiIcon = createTechIcon(OpenwebuiAsset, 'openwebui')
export const PostgresqlIcon = createTechIcon(PostgresqlAsset, 'postgresql')
export const PrismaIcon = createTechIcon(PrismaAsset, 'prisma')
export const PypiIcon = createTechIcon(PypiAsset, 'pypi')
export const QinglongIcon = createTechIcon(QinglongAsset, 'qinglong')
export const RabbitmqIcon = createTechIcon(RabbitmqAsset, 'rabbitmq')
export const RadixIcon = createTechIcon(RadixAsset, 'radix')
export const ReactIcon = createTechIcon(ReactAsset, 'react')
export const RedisIcon = createTechIcon(RedisAsset, 'redis')
export const RestifyIcon = createTechIcon(RestifyAsset, 'restify')
export const ShadcnIcon = createTechIcon(ShadcnAsset, 'shadcn')
export const ShieldsioIcon = createTechIcon(ShieldsioAsset, 'shieldsio')
export const TdesignIcon = createTechIcon(TdesignAsset, 'tdesign')
export const TrpcIcon = createTechIcon(TrpcAsset, 'trpc')
export const VerdaccioIcon = createTechIcon(VerdaccioAsset, 'verdaccio')
export const ViteIcon = createTechIcon(ViteAsset, 'vite')
export const VueIcon = createTechIcon(VueAsset, 'vue')
export const WebpackIcon = createTechIcon(WebpackAsset, 'webpack')

export const techIcons = {
  alist: AlistIcon,
  antd: AntdIcon,
  'code-reference': CodeReferenceIcon,
  cra: CraIcon,
  'docker-registry': DockerRegistryIcon,
  docker: DockerIcon,
  drone: DroneIcon,
  dumi: DumiIcon,
  element: ElementIcon,
  gitea: GiteaIcon,
  github: GithubIcon,
  hexo: HexoIcon,
  'it-tools': ITToolsIcon,
  joplin: JoplinIcon,
  mantine: MantineIcon,
  memos: MemosIcon,
  mongodb: MongodbIcon,
  mui: MuiIcon,
  nestjs: NestjsIcon,
  nextchat: NextchatIcon,
  nextjs: NextjsIcon,
  nodejs: NodejsIcon,
  'npm-flat': NpmFlatIcon,
  npm: NpmIcon,
  openwebui: OpenwebuiIcon,
  postgresql: PostgresqlIcon,
  prisma: PrismaIcon,
  pypi: PypiIcon,
  qinglong: QinglongIcon,
  rabbitmq: RabbitmqIcon,
  radix: RadixIcon,
  react: ReactIcon,
  redis: RedisIcon,
  restify: RestifyIcon,
  shadcn: ShadcnIcon,
  shields: ShieldsioIcon,
  tdesign: TdesignIcon,
  trpc: TrpcIcon,
  verdaccio: VerdaccioIcon,
  vite: ViteIcon,
  vue: VueIcon,
  webpack: WebpackIcon,
} as const

export type TechIconName = keyof typeof techIcons
