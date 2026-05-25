'use client'

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'

import { cn } from '@/utils/style'

declare global {
  interface Window {
    BMapGL?: any
    __paperplaneBaiduMapGLInit?: () => void
  }
}

const BAIDU_MAP_GL_SCRIPT_ID = 'paperplane-baidu-map-gl-sdk'
const BAIDU_MAP_GL_CALLBACK = '__paperplaneBaiduMapGLInit'
const BAIDU_MAP_STYLE_ID = '975d24a1bf601154fa5f759cac0ff9a5'

let baiduMapGLLoader: any = null

function isValidCoordinate(value?: string | null) {
  if (!value) {
    return false
  }

  return Number.isFinite(Number(value))
}

function loadBaiduMapGL() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('在线地图初始化失败'))
  }
  if (window.BMapGL) {
    return Promise.resolve(window.BMapGL)
  }
  if (baiduMapGLLoader) {
    return baiduMapGLLoader
  }

  const ak = process.env.NEXT_PUBLIC_BAIDU_MAP_WEBSDK_AK
  baiduMapGLLoader = new Promise((resolve, reject) => {
    window[BAIDU_MAP_GL_CALLBACK] = () => {
      if (window.BMapGL) {
        resolve(window.BMapGL)
        return
      }

      baiduMapGLLoader = null
      reject(new Error('在线地图初始化失败'))
    }

    const existedScript = document.getElementById(BAIDU_MAP_GL_SCRIPT_ID)

    if (existedScript) {
      return
    }

    const script = document.createElement('script')
    script.id = BAIDU_MAP_GL_SCRIPT_ID
    script.async = true
    script.src = `https://api.map.baidu.com/api?type=webgl&v=1.0&ak=${encodeURIComponent(ak!)}&callback=${BAIDU_MAP_GL_CALLBACK}`
    script.onerror = () => {
      baiduMapGLLoader = null
      reject(new Error('在线地图初始化失败'))
    }

    document.head.appendChild(script)
  })

  return baiduMapGLLoader
}

export interface TrafficViewProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  latitude?: string | null
  longitude?: string | null
}

export function TrafficView({ latitude, longitude, className, ...restProps }: TrafficViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [loadedCoordinate, setLoadedCoordinate] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<{ coordinate: string; message: string } | null>(null)

  const hasValidPosition = isValidCoordinate(longitude) && isValidCoordinate(latitude)
  const coordinate = hasValidPosition ? `${longitude},${latitude}` : ''
  const error = loadError?.coordinate === coordinate ? loadError.message : null
  const loading = hasValidPosition && loadedCoordinate !== coordinate && !error

  useEffect(() => {
    if (!hasValidPosition) {
      return
    }

    let cancelled = false
    let animationFrame = 0

    loadBaiduMapGL()
      .then((BMapGL: any) => {
        if (cancelled) {
          return
        }

        animationFrame = window.requestAnimationFrame(() => {
          const container = mapContainerRef.current

          if (!container || cancelled) {
            return
          }

          container.replaceChildren()

          const point = new BMapGL.Point(Number(longitude), Number(latitude))
          const map = new BMapGL.Map(container)

          map.centerAndZoom(point, 17)
          map.enableScrollWheelZoom(true)
          map.setMapStyleV2({ styleId: BAIDU_MAP_STYLE_ID })
          map.setTrafficOn()
          map.addOverlay(new BMapGL.Marker(point))

          setLoadedCoordinate(coordinate)
          setLoadError(null)
        })
      })
      .catch((reason: any) => {
        if (cancelled) {
          return
        }

        setLoadError({
          coordinate,
          message: reason instanceof Error ? reason.message : '在线地图初始化失败',
        })
      })

    return () => {
      cancelled = true

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [coordinate, hasValidPosition, latitude, longitude])

  if (!hasValidPosition) {
    return (
      <div
        {...restProps}
        className={cn(
          'border-input text-muted-foreground flex items-center justify-center rounded-lg border border-dashed bg-white/60 text-sm',
          className
        )}
      >
        坐标无效
      </div>
    )
  }

  return (
    <div
      {...restProps}
      className={cn(
        'relative overflow-hidden border bg-white [&_.BMap_cpyCtrl]:hidden [&_.anchorBL]:hidden',
        className
      )}
    >
      <div ref={mapContainerRef} className="size-full" />

      {loading ? (
        <div className="bg-background/80 text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
          地图加载中...
        </div>
      ) : null}

      {error ? (
        <div className="bg-background/90 absolute inset-0 flex items-center justify-center px-6 text-center">
          <p className="border-destructive/40 bg-destructive/8 text-destructive rounded-md border px-3 py-2 text-sm">
            {error}
          </p>
        </div>
      ) : null}
    </div>
  )
}
