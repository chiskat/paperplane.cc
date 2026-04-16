import Image, { type StaticImageData } from 'next/image'
import type { CSSProperties } from 'react'

import BabelAsset from '@/assets/snippet-icons/babel.svg'
import CraAsset from '@/assets/snippet-icons/cra.svg'
import DefaultAsset from '@/assets/snippet-icons/default.svg'
import DockerAsset from '@/assets/snippet-icons/docker.svg'
import DroneAsset from '@/assets/snippet-icons/drone.svg'
import EditorconfigAsset from '@/assets/snippet-icons/editorconfig.svg'
import EslintAsset from '@/assets/snippet-icons/eslint.svg'
import GitAsset from '@/assets/snippet-icons/git.svg'
import LicenseAsset from '@/assets/snippet-icons/license.svg'
import MonorepoAsset from '@/assets/snippet-icons/monorepo.svg'
import NextjsAsset from '@/assets/snippet-icons/nextjs.svg'
import NodejsAsset from '@/assets/snippet-icons/nodejs.svg'
import NpmAsset from '@/assets/snippet-icons/npm.svg'
import PostcssAsset from '@/assets/snippet-icons/postcss.svg'
import PrettierAsset from '@/assets/snippet-icons/prettier.svg'
import RollupAsset from '@/assets/snippet-icons/rollup.svg'
import TailwindcssAsset from '@/assets/snippet-icons/tailwindcss.svg'
import TerminalAsset from '@/assets/snippet-icons/terminal.svg'
import TypescriptAsset from '@/assets/snippet-icons/typescript.svg'
import ViteAsset from '@/assets/snippet-icons/vite.svg'
import VitestAsset from '@/assets/snippet-icons/vitest.svg'
import VscodeAsset from '@/assets/snippet-icons/vscode.svg'
import WebpackAsset from '@/assets/snippet-icons/webpack.svg'
import { cn } from '@/utils/style'

export interface SnippetIconProps {
  className?: string
  style?: CSSProperties
  size?: number | string
}

function createSnippetIcon(src: StaticImageData, alt: string) {
  return function SnippetIcon({ className, style, size = '1em' }: SnippetIconProps) {
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

export const BabelIcon = createSnippetIcon(BabelAsset, 'babel')
export const CraIcon = createSnippetIcon(CraAsset, 'cra')
export const DefaultIcon = createSnippetIcon(DefaultAsset, 'default')
export const DockerIcon = createSnippetIcon(DockerAsset, 'docker')
export const DroneIcon = createSnippetIcon(DroneAsset, 'drone')
export const EditorconfigIcon = createSnippetIcon(EditorconfigAsset, 'editorconfig')
export const EslintIcon = createSnippetIcon(EslintAsset, 'eslint')
export const GitIcon = createSnippetIcon(GitAsset, 'git')
export const LicenseIcon = createSnippetIcon(LicenseAsset, 'license')
export const MonorepoIcon = createSnippetIcon(MonorepoAsset, 'monorepo')
export const NextjsIcon = createSnippetIcon(NextjsAsset, 'nextjs')
export const NodejsIcon = createSnippetIcon(NodejsAsset, 'nodejs')
export const NpmIcon = createSnippetIcon(NpmAsset, 'npm')
export const PostcssIcon = createSnippetIcon(PostcssAsset, 'postcss')
export const PrettierIcon = createSnippetIcon(PrettierAsset, 'prettier')
export const RollupIcon = createSnippetIcon(RollupAsset, 'rollup')
export const TailwindcssIcon = createSnippetIcon(TailwindcssAsset, 'tailwindcss')
export const TerminalIcon = createSnippetIcon(TerminalAsset, 'terminal')
export const TypescriptIcon = createSnippetIcon(TypescriptAsset, 'typescript')
export const ViteIcon = createSnippetIcon(ViteAsset, 'vite')
export const VitestIcon = createSnippetIcon(VitestAsset, 'vitest')
export const VscodeIcon = createSnippetIcon(VscodeAsset, 'vscode')
export const WebpackIcon = createSnippetIcon(WebpackAsset, 'webpack')

export const snippetIcons = {
  babel: BabelIcon,
  cra: CraIcon,
  default: DefaultIcon,
  docker: DockerIcon,
  drone: DroneIcon,
  editorconfig: EditorconfigIcon,
  eslint: EslintIcon,
  git: GitIcon,
  license: LicenseIcon,
  monorepo: MonorepoIcon,
  nextjs: NextjsIcon,
  nodejs: NodejsIcon,
  npm: NpmIcon,
  postcss: PostcssIcon,
  prettier: PrettierIcon,
  rollup: RollupIcon,
  tailwindcss: TailwindcssIcon,
  terminal: TerminalIcon,
  typescript: TypescriptIcon,
  vite: ViteIcon,
  vitest: VitestIcon,
  vscode: VscodeIcon,
  webpack: WebpackIcon,
} as const

export type SnippetIconName = keyof typeof snippetIcons

const snippetIconAliasMap: Record<string, SnippetIconName> = {
  command: 'terminal',
  'next-js': 'nextjs',
  'package-json': 'default',
}

function normalizeSnippetIconKey(key: string): string {
  return key.trim().toLowerCase().replace(/_/g, '-')
}

function isSnippetIconName(key: string): key is SnippetIconName {
  return key in snippetIcons
}

export function getSnippetIconByKey(key: string) {
  const normalizedKey = normalizeSnippetIconKey(key)
  const matchedKey: SnippetIconName = isSnippetIconName(normalizedKey)
    ? normalizedKey
    : (snippetIconAliasMap[normalizedKey] ?? 'default')

  return snippetIcons[matchedKey]
}
