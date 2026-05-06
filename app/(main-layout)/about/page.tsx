import { IconId, IconInfoCircle, IconMail } from '@tabler/icons-react'

import MoonFavicon from '@/assets/nav-icons/favicon-moon.png'
import PaperPlaneFavicon from '@/assets/nav-icons/favicon-paperplane.png'
import { KVPairs, KVPairsItem } from '@/components/data/kv-pairs'
import {
  CodeReferenceIcon,
  createTechIcon,
  DockerIcon,
  DroneIcon,
  GiteaIcon,
  GithubIcon,
  ITToolsIcon,
  JoplinIcon,
  NpmIcon,
  OpenwebuiIcon,
  ShieldsioIcon,
} from '@/components/icon/tech-icons'
import Website, { type WebsiteProps } from './Website'

const MainSiteIcon = createTechIcon(PaperPlaneFavicon, '')
const TimelineIcon = createTechIcon(MoonFavicon, '')

const creavites: WebsiteProps[] = [
  {
    title: 'PaperPlane.cc (本站)',
    icon: <MainSiteIcon />,
    href: 'https://paperplane.cc',
    desc: '技术博客 · 在线 Demo',
    techs: ['next.js'],
  },
  {
    title: '时间线',
    icon: <TimelineIcon />,
    href: 'https://tl.paperplane.cc',
    hrefHighlight: 'tl.',
    desc: '灵感 · 动态 · 摘录',
    techs: ['hexo'],
  },
]

const techs: WebsiteProps[] = [
  {
    title: 'GitHub',
    icon: <GithubIcon />,
    href: 'https://github.com/chiskat',
    hrefHighlight: '/chiskat',
    desc: '我的 GitHub 主页',
  },
  {
    title: 'npm',
    icon: <NpmIcon />,
    href: 'https://npmjs.com/~chiskat',
    hrefHighlight: '/~chiskat',
    desc: '我的 npm 主页',
  },
  {
    title: 'Docker Hub',
    icon: <DockerIcon />,
    href: 'https://hub.docker.com/r/chiskat',
    hrefHighlight: '/chiskat',
    desc: '我的 Docker Hub 主页',
  },
  {
    title: 'Drone CI',
    icon: <DroneIcon />,
    href: 'https://drone.paperplane.cc',
    hrefHighlight: 'drone.',
    desc: '自部署 CI/CD 工具',
  },
  {
    title: 'Gitea',
    icon: <GiteaIcon />,
    href: 'https://git.paperplane.cc',
    hrefHighlight: 'git.',
    desc: '自部署，作为 GitHub 镜像',
  },
]

const services: WebsiteProps[] = [
  {
    title: 'OpenWebUI',
    icon: <OpenwebuiIcon />,
    href: 'https://gpt.paperplane.cc',
    hrefHighlight: 'gpt.',
    desc: '自部署 AI Agent 与知识库',
    techs: ['openwebui'],
  },
  {
    title: '开发工具合集',
    icon: <ITToolsIcon />,
    href: 'https://tools.paperplane.cc',
    hrefHighlight: 'tools.',
    desc: '自部署常用工具合集',
    techs: ['it-tools'],
  },
  {
    title: '代码速查',
    icon: <CodeReferenceIcon />,
    href: 'https://code.paperplane.cc',
    hrefHighlight: 'code.',
    desc: '自部署代码速查工具',
    techs: ['code-reference'],
  },
  {
    title: 'Shields 徽标服务',
    icon: <ShieldsioIcon />,
    href: 'https://shields.paperplane.cc',
    hrefHighlight: 'shields.',
    desc: '自部署，可联系我添加 CORS',
    techs: ['shields'],
  },
  {
    title: 'Joplin 云端笔记',
    icon: <JoplinIcon />,
    href: 'https://joplin.paperplane.cc',
    hrefHighlight: 'joplin.',
    desc: '自部署 Joplin 笔记云端',
    techs: ['joplin'],
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4"></div>

      <div className="relative flex gap-24">
        <section>
          <header className="font-title-serif mb-8 text-2xl text-slate-800">关于我</header>
          <section className="text-slate-600">
            <KVPairs className="inline-block" colon="：">
              <KVPairsItem icon={<IconId />} label="ID">
                chiskat
              </KVPairsItem>
              <KVPairsItem icon={<IconMail />} label="邮箱">
                1@paperplane.cc
              </KVPairsItem>
              <KVPairsItem icon={<IconInfoCircle />} label="介绍">
                全栈 Web 开发者
              </KVPairsItem>
            </KVPairs>
          </section>

          <header className="font-title-serif mt-8 mb-8 text-2xl text-slate-800">创作</header>
          <div className="flex flex-col gap-y-8">
            {creavites.map(item => (
              <Website key={item.href} {...item} />
            ))}
          </div>
        </section>

        <section>
          <header className="font-title-serif mb-8 text-2xl text-slate-800">技术主页</header>
          <div className="flex flex-col gap-y-8">
            {techs.map(item => (
              <Website key={item.href} {...item} />
            ))}
          </div>
        </section>

        <section>
          <header className="font-title-serif mb-8 text-2xl text-slate-800">在线服务</header>
          <div className="flex flex-col gap-y-8">
            {services.map(item => (
              <Website key={item.href} {...item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
