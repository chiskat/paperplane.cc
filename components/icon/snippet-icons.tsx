import Image, { type StaticImageData } from 'next/image'
import type { CSSProperties } from 'react'

import BabelAsset from '@/assets/snippet-icons/babel.svg'
import ClaudeAsset from '@/assets/snippet-icons/claude.svg'
import CodexAsset from '@/assets/snippet-icons/codex.svg'
import CommandAsset from '@/assets/snippet-icons/command.svg'
import CommitizenAsset from '@/assets/snippet-icons/commitizen.svg'
import CommitlintAsset from '@/assets/snippet-icons/commitlint.svg'
import CraAsset from '@/assets/snippet-icons/cra.svg'
import DefaultAsset from '@/assets/snippet-icons/default.svg'
import DockerAsset from '@/assets/snippet-icons/docker.svg'
import DroneAsset from '@/assets/snippet-icons/drone.svg'
import EditorconfigAsset from '@/assets/snippet-icons/editorconfig.svg'
import EslintAsset from '@/assets/snippet-icons/eslint.svg'
import GitAsset from '@/assets/snippet-icons/git.svg'
import HuskyAsset from '@/assets/snippet-icons/husky.svg'
import LicenseAsset from '@/assets/snippet-icons/license.svg'
import LintstagedAsset from '@/assets/snippet-icons/lintstaged.svg'
import MonorepoAsset from '@/assets/snippet-icons/monorepo.svg'
import NextjsAsset from '@/assets/snippet-icons/nextjs.svg'
import NodejsAsset from '@/assets/snippet-icons/nodejs.svg'
import NpmAsset from '@/assets/snippet-icons/npm.svg'
import PostcssAsset from '@/assets/snippet-icons/postcss.svg'
import PrettierAsset from '@/assets/snippet-icons/prettier.svg'
import RollupAsset from '@/assets/snippet-icons/rollup.svg'
import TailwindcssAsset from '@/assets/snippet-icons/tailwindcss.svg'
import TypescriptAsset from '@/assets/snippet-icons/typescript.svg'
import ViteAsset from '@/assets/snippet-icons/vite.svg'
import VitestAsset from '@/assets/snippet-icons/vitest.svg'
import VscodeAsset from '@/assets/snippet-icons/vscode.svg'
import WebpackAsset from '@/assets/snippet-icons/webpack.svg'
import { cn } from '@/utils/style'

// 图标来源： https://github.com/material-extensions/vscode-material-icon-theme

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
export const ClaudeIcon = createSnippetIcon(ClaudeAsset, 'claude')
export const CodexIcon = createSnippetIcon(CodexAsset, 'codex')
export const CommandIcon = createSnippetIcon(CommandAsset, 'command')
export const CommitizenIcon = createSnippetIcon(CommitizenAsset, 'commitizen')
export const CommitlintIcon = createSnippetIcon(CommitlintAsset, 'commitlint')
export const CraIcon = createSnippetIcon(CraAsset, 'cra')
export const DefaultIcon = createSnippetIcon(DefaultAsset, 'default')
export const DockerIcon = createSnippetIcon(DockerAsset, 'docker')
export const DroneIcon = createSnippetIcon(DroneAsset, 'drone')
export const EditorconfigIcon = createSnippetIcon(EditorconfigAsset, 'editorconfig')
export const EslintIcon = createSnippetIcon(EslintAsset, 'eslint')
export const GitIcon = createSnippetIcon(GitAsset, 'git')
export const HuskyIcon = createSnippetIcon(HuskyAsset, 'husky')
export const LicenseIcon = createSnippetIcon(LicenseAsset, 'license')
export const LintstagedIcon = createSnippetIcon(LintstagedAsset, 'lintstaged')
export const MonorepoIcon = createSnippetIcon(MonorepoAsset, 'monorepo')
export const NextjsIcon = createSnippetIcon(NextjsAsset, 'nextjs')
export const NodejsIcon = createSnippetIcon(NodejsAsset, 'nodejs')
export const NpmIcon = createSnippetIcon(NpmAsset, 'npm')
export const PostcssIcon = createSnippetIcon(PostcssAsset, 'postcss')
export const PrettierIcon = createSnippetIcon(PrettierAsset, 'prettier')
export const RollupIcon = createSnippetIcon(RollupAsset, 'rollup')
export const TailwindcssIcon = createSnippetIcon(TailwindcssAsset, 'tailwindcss')
export const TypescriptIcon = createSnippetIcon(TypescriptAsset, 'typescript')
export const ViteIcon = createSnippetIcon(ViteAsset, 'vite')
export const VitestIcon = createSnippetIcon(VitestAsset, 'vitest')
export const VscodeIcon = createSnippetIcon(VscodeAsset, 'vscode')
export const WebpackIcon = createSnippetIcon(WebpackAsset, 'webpack')

export const snippetIcons = {
  babel: BabelIcon,
  claude: ClaudeIcon,
  codex: CodexIcon,
  command: CommandIcon,
  commitizen: CommitizenIcon,
  commitlint: CommitlintIcon,
  cra: CraIcon,
  default: DefaultIcon,
  docker: DockerIcon,
  drone: DroneIcon,
  editorconfig: EditorconfigIcon,
  eslint: EslintIcon,
  git: GitIcon,
  husky: HuskyIcon,
  license: LicenseIcon,
  lintstaged: LintstagedIcon,
  monorepo: MonorepoIcon,
  nextjs: NextjsIcon,
  nodejs: NodejsIcon,
  npm: NpmIcon,
  postcss: PostcssIcon,
  prettier: PrettierIcon,
  rollup: RollupIcon,
  tailwindcss: TailwindcssIcon,
  typescript: TypescriptIcon,
  vite: ViteIcon,
  vitest: VitestIcon,
  vscode: VscodeIcon,
  webpack: WebpackIcon,
} as const

export type SnippetIconName = keyof typeof snippetIcons

function normalizeSnippetIconKey(key: string): string {
  return key.trim().toLowerCase().replace(/_/g, '-')
}

function isSnippetIconName(key: string): key is SnippetIconName {
  return key in snippetIcons
}

export function getSnippetIconByKey(key: string) {
  const normalizedKey = normalizeSnippetIconKey(key)
  const matchedKey: SnippetIconName = isSnippetIconName(normalizedKey) ? normalizedKey : 'default'

  return snippetIcons[matchedKey]
}
