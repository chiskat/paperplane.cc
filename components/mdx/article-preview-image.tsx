'use client'

import Image, { type ImageProps } from 'next/image'
import { PhotoProvider, PhotoView } from 'react-photo-view'

import 'react-photo-view/dist/react-photo-view.css'

import { cn } from '@/utils/style'

type ArticlePreviewImageProps = Omit<ImageProps, 'alt'> & {
  alt?: string
}

type StaticSrc = { src: string } | { default: { src: string } }

function resolvePreviewSrc(src: ImageProps['src']) {
  if (typeof src === 'string') return src
  const staticSrc = src as StaticSrc
  return 'src' in staticSrc ? staticSrc.src : staticSrc.default.src
}

export function ArticlePreviewImage({
  alt = '',
  className,
  src,
  ...props
}: ArticlePreviewImageProps) {
  const previewSrc = resolvePreviewSrc(src)

  return (
    <PhotoProvider>
      <PhotoView src={previewSrc}>
        <Image
          {...props}
          src={src}
          alt={alt}
          className={cn('cursor-zoom-in shadow-[0_0_10px_rgba(0,0,0,0.2)]', className)}
        />
      </PhotoView>
    </PhotoProvider>
  )
}
