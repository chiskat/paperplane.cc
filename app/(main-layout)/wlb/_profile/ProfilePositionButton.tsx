'use client'

import { LocateFixedIcon, SearchIcon } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type BMapPoint = {
  lng: number
  lat: number
}

type BMapSize = {
  width: number
  height: number
}

type BMapIcon = unknown

type BMapClickEvent = {
  point?: BMapPoint
}

type BMapLocalSearchResult = {
  getPoi: (index: number) =>
    | {
        point?: BMapPoint
        title?: string
        address?: string
      }
    | undefined
}

type BMapMap = {
  centerAndZoom: (point: BMapPoint, zoom: number) => void
  enableScrollWheelZoom: (enabled?: boolean) => void
  addControl: (control: unknown) => void
  addOverlay: (overlay: unknown) => void
  panTo: (point: BMapPoint) => void
  addEventListener: (type: string, listener: (event: BMapClickEvent) => void) => void
  removeEventListener: (type: string, listener: (event: BMapClickEvent) => void) => void
}

type BMapMarker = {
  setPosition: (point: BMapPoint) => void
}

type BMapNamespace = {
  Map: new (container: HTMLElement | string) => BMapMap
  Point: new (lng: number, lat: number) => BMapPoint
  Size: new (width: number, height: number) => BMapSize
  Icon: new (
    imageUrl: string,
    size: BMapSize,
    options?: {
      anchor?: BMapSize
      imageSize?: BMapSize
    }
  ) => BMapIcon
  Marker: new (
    point: BMapPoint,
    options?: {
      icon?: BMapIcon
    }
  ) => BMapMarker
  NavigationControl: new () => unknown
  ScaleControl: new () => unknown
  LocalSearch: new (
    map: BMapMap,
    options: {
      onSearchComplete?: (result: BMapLocalSearchResult) => void
    }
  ) => {
    search: (keyword: string) => void
  }
}

declare global {
  interface Window {
    BMap?: BMapNamespace
    __paperplaneBaiduMapInit?: () => void
  }
}

const BAIDU_MAP_SCRIPT_ID = 'paperplane-baidu-map-sdk'
const BAIDU_MAP_CALLBACK = '__paperplaneBaiduMapInit'
const DEFAULT_POINT = {
  longitude: '116.404',
  latitude: '39.915',
}
const SELECTED_POSITION_PIN_SIZE = {
  width: 30,
  height: 40,
}
const SELECTED_POSITION_PIN_ICON =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2230%22%20height%3D%2240%22%20viewBox%3D%220%200%2038%2050%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M19%2049C19%2049%2036%2029.9%2036%2018.8C36%208.97%2028.39%201%2019%201C9.61%201%202%208.97%202%2018.8C2%2029.9%2019%2049%2019%2049Z%22%20fill%3D%22%23E54B4B%22%20stroke%3D%22%23B91C1C%22%20stroke-width%3D%222%22/%3E%3Ccircle%20cx%3D%2219%22%20cy%3D%2218%22%20r%3D%227%22%20fill%3D%22white%22/%3E%3C/svg%3E'

let baiduMapLoader: Promise<BMapNamespace> | null = null

function formatCoordinate(value: number) {
  return Number(value.toFixed(6)).toString()
}

function isValidCoordinate(value?: string | null) {
  if (!value) {
    return false
  }

  return Number.isFinite(Number(value))
}

function toBMapPoint(BMap: BMapNamespace, value?: WLBProfilePositionValue | null) {
  if (!isValidCoordinate(value?.longitude) || !isValidCoordinate(value?.latitude)) {
    return null
  }

  return new BMap.Point(Number(value?.longitude), Number(value?.latitude))
}

function hasValidPosition(value?: WLBProfilePositionValue | null) {
  return isValidCoordinate(value?.longitude) && isValidCoordinate(value?.latitude)
}

function createSelectedPositionMarker(BMap: BMapNamespace, point: BMapPoint) {
  const iconSize = new BMap.Size(
    SELECTED_POSITION_PIN_SIZE.width,
    SELECTED_POSITION_PIN_SIZE.height
  )
  const icon = new BMap.Icon(SELECTED_POSITION_PIN_ICON, iconSize, {
    anchor: new BMap.Size(SELECTED_POSITION_PIN_SIZE.width / 2, SELECTED_POSITION_PIN_SIZE.height),
    imageSize: iconSize,
  })

  return new BMap.Marker(point, { icon })
}

function loadBaiduMap() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('当前环境无法加载百度地图'))
  }

  if (window.BMap) {
    return Promise.resolve(window.BMap)
  }

  if (baiduMapLoader) {
    return baiduMapLoader
  }

  const ak = process.env.NEXT_PUBLIC_BAIDU_MAP_WEBSDK_AK

  if (!ak) {
    return Promise.reject(new Error('缺少 NEXT_PUBLIC_BAIDU_MAP_WEBSDK_AK 环境变量'))
  }

  baiduMapLoader = new Promise((resolve, reject) => {
    window[BAIDU_MAP_CALLBACK] = () => {
      if (window.BMap) {
        resolve(window.BMap)
        return
      }

      baiduMapLoader = null
      reject(new Error('百度地图 SDK 加载失败'))
    }

    const existedScript = document.getElementById(BAIDU_MAP_SCRIPT_ID)

    if (existedScript) {
      return
    }

    const script = document.createElement('script')
    script.id = BAIDU_MAP_SCRIPT_ID
    script.async = true
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${encodeURIComponent(ak)}&callback=${BAIDU_MAP_CALLBACK}`
    script.onerror = () => {
      baiduMapLoader = null
      reject(new Error('百度地图 SDK 加载失败，请检查网络或 AK 配置'))
    }

    document.head.appendChild(script)
  })

  return baiduMapLoader
}

export type WLBProfilePositionValue = {
  latitude: string
  longitude: string
}

export interface WLBProfilePositionButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'onChange' | 'value'
> {
  children: ReactNode
  fallbackKeyword?: string
  value?: WLBProfilePositionValue
  onChange?: (value: WLBProfilePositionValue) => void
}

export function WLBProfilePositionButton({
  children,
  fallbackKeyword,
  value,
  onChange,
  ...buttonProps
}: WLBProfilePositionButtonProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<WLBProfilePositionValue>({
    latitude: value?.latitude ?? '',
    longitude: value?.longitude ?? '',
  })

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const bmapRef = useRef<BMapNamespace | null>(null)
  const mapRef = useRef<BMapMap | null>(null)
  const markerRef = useRef<BMapMarker | null>(null)
  const mapClickHandlerRef = useRef<((event: BMapClickEvent) => void) | null>(null)

  const hasSelectedPosition = useMemo(() => {
    return (
      isValidCoordinate(selectedPosition.longitude) && isValidCoordinate(selectedPosition.latitude)
    )
  }, [selectedPosition.latitude, selectedPosition.longitude])

  const selectPoint = useCallback((point: BMapPoint, panToPoint = true) => {
    const BMap = bmapRef.current
    const map = mapRef.current

    if (!BMap || !map) {
      return
    }

    setSelectedPosition({
      latitude: formatCoordinate(point.lat),
      longitude: formatCoordinate(point.lng),
    })

    if (markerRef.current) {
      markerRef.current.setPosition(point)
    } else {
      const marker = createSelectedPositionMarker(BMap, point)
      markerRef.current = marker
      map.addOverlay(marker)
    }

    if (panToPoint) {
      map.panTo(point)
    }
  }, [])

  const searchAddressByKeyword = useCallback(
    (targetKeyword: string) => {
      const BMap = bmapRef.current
      const map = mapRef.current
      const trimmedKeyword = targetKeyword.trim()

      if (!trimmedKeyword) {
        setError('请输入地址或地点名称')
        return
      }

      if (!BMap || !map) {
        setError('地图还没有加载完成')
        return
      }

      setSearching(true)
      setError(null)

      const searcher = new BMap.LocalSearch(map, {
        onSearchComplete: result => {
          setSearching(false)

          const poi = result.getPoi(0)

          if (!poi?.point) {
            setError('没有找到匹配的位置，请换一个更具体的地址')
            return
          }

          map.centerAndZoom(poi.point, 17)
          selectPoint(poi.point, false)
        },
      })

      searcher.search(trimmedKeyword)
    },
    [selectPoint]
  )

  const searchAddress = useCallback(() => {
    searchAddressByKeyword(keyword)
  }, [keyword, searchAddressByKeyword])

  const centerSelectedPosition = useCallback(() => {
    const BMap = bmapRef.current
    const map = mapRef.current

    if (!BMap || !map) {
      return
    }

    const point = toBMapPoint(BMap, selectedPosition)

    if (!point) {
      return
    }

    map.panTo(point)
  }, [selectedPosition])

  useEffect(() => {
    if (!open) {
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPosition({ latitude: value?.latitude ?? '', longitude: value?.longitude ?? '' })

    const trimmedFallbackKeyword = fallbackKeyword?.trim() ?? ''

    if (!hasValidPosition(value)) {
      setKeyword(trimmedFallbackKeyword)
    }

    let cancelled = false
    let animationFrame = 0

    setLoading(true)
    setError(null)

    loadBaiduMap()
      .then(BMap => {
        if (cancelled) {
          return
        }

        bmapRef.current = BMap

        animationFrame = window.requestAnimationFrame(() => {
          const container = mapContainerRef.current

          if (!container || cancelled) {
            return
          }

          const map = new BMap.Map(container)
          const currentPoint = toBMapPoint(BMap, value)
          const centerPoint =
            currentPoint ??
            new BMap.Point(Number(DEFAULT_POINT.longitude), Number(DEFAULT_POINT.latitude))

          mapRef.current = map
          map.centerAndZoom(centerPoint, currentPoint ? 17 : 12)
          map.enableScrollWheelZoom(true)

          try {
            map.addControl(new BMap.NavigationControl())
            map.addControl(new BMap.ScaleControl())
          } catch {
            // 部分运行环境可能会屏蔽控件，地图主体仍可正常使用。
          }

          if (currentPoint) {
            selectPoint(currentPoint, false)
          }

          const clickHandler = (event: BMapClickEvent) => {
            if (event.point) {
              selectPoint(event.point)
            }
          }

          mapClickHandlerRef.current = clickHandler
          map.addEventListener('click', clickHandler)
          setLoading(false)

          if (!currentPoint && trimmedFallbackKeyword) {
            searchAddressByKeyword(trimmedFallbackKeyword)
          }
        })
      })
      .catch(reason => {
        if (cancelled) {
          return
        }

        setLoading(false)
        setError(reason instanceof Error ? reason.message : '百度地图 SDK 加载失败')
      })

    return () => {
      cancelled = true

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
      }

      if (mapRef.current && mapClickHandlerRef.current) {
        mapRef.current.removeEventListener('click', mapClickHandlerRef.current)
      }

      mapRef.current = null
      markerRef.current = null
      mapClickHandlerRef.current = null
    }
  }, [fallbackKeyword, open, searchAddressByKeyword, selectPoint, value])

  return (
    <Dialog
      open={open}
      onOpenChange={({ open: nextOpen }) => {
        setOpen(nextOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" {...buttonProps}>
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(94vw,960px)] sm:max-w-[min(94vw,960px)]">
        <DialogHeader title="选择地理位置" />

        <DialogBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field className="flex-1">
                <FieldLabel>地址</FieldLabel>
                <Input
                  placeholder="输入地址或地点名称"
                  value={keyword}
                  onChange={event => {
                    setKeyword(event.target.value)
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      searchAddress()
                    }
                  }}
                />
              </Field>

              <Button
                className="sm:mb-0"
                disabled={loading || searching}
                isLoading={searching}
                size="lg"
                type="button"
                onClick={searchAddress}
              >
                <SearchIcon data-icon="inline-start" />
                搜索定位
              </Button>
            </div>

            <div className="bg-muted/32 relative h-90 overflow-hidden rounded-xl border sm:h-115">
              <div ref={mapContainerRef} className="size-full" />

              {loading ? (
                <div className="bg-background/80 text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
                  地图加载中...
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="border-destructive/40 bg-destructive/8 text-destructive rounded-md border px-3 py-2 text-sm">
                {error}
              </p>
            ) : null}
          </div>
        </DialogBody>

        <DialogFooter className="sm:items-center">
          <div className="flex flex-1 flex-col gap-3 sm:me-auto sm:flex-row sm:items-center">
            <Button
              disabled={!hasSelectedPosition || loading}
              size="lg"
              type="button"
              variant="outline"
              onClick={centerSelectedPosition}
            >
              <LocateFixedIcon data-icon="inline-start" />
              居中当前坐标
            </Button>

            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="text-foreground/70">纬度</span>
                <span className="text-foreground font-medium">
                  {selectedPosition.latitude || '--'}
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-foreground/70">经度</span>
                <span className="text-foreground font-medium">
                  {selectedPosition.longitude || '--'}
                </span>
              </span>
            </div>
          </div>

          <Button
            disabled={searching}
            size="lg"
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false)
            }}
          >
            取消
          </Button>

          <Button
            disabled={!hasSelectedPosition || loading || searching}
            size="lg"
            type="button"
            onClick={() => {
              onChange?.(selectedPosition)
              setOpen(false)
            }}
          >
            确认位置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
