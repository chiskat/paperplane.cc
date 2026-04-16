import { IconPackage } from '@tabler/icons-react'
import type { CSSProperties, ReactNode } from 'react'

import { DockerIcon, NpmFlatIcon, PypiIcon } from './tech-icons'

interface PackageIconBaseProps {
  className?: string
  style?: CSSProperties
  size?: number | string
}

const packageIcons = {
  docker: DockerIcon,
  npm: NpmFlatIcon,
  pypi: PypiIcon,
} as const

export interface PackageIconProps extends PackageIconBaseProps {
  type: string
  fallback?: ReactNode
}

export function PackageIcon({ type, className, style, size = '1em', fallback }: PackageIconProps) {
  const normalizedType = type.trim().toLowerCase()
  const Icon = packageIcons[normalizedType as keyof typeof packageIcons]

  if (Icon) {
    return <Icon className={className} style={style} size={size} />
  }

  if (fallback !== undefined) {
    return fallback
  }

  return <IconPackage className={className} style={style} size={size} />
}

export function fromURL(url: string) {
  const normalizedURL = url.toLowerCase()
  const result = normalizedURL.startsWith('https://www.npmjs.com')
    ? 'npm'
    : normalizedURL.startsWith('https://hub.docker.com')
      ? 'docker'
      : normalizedURL.startsWith('https://pypi.org/project')
        ? 'pypi'
        : 'unknown'

  return result
}
