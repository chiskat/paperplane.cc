export function ArticleHR() {
  return (
    <div className="my-10 flex items-center gap-3" role="separator" aria-orientation="horizontal">
      {/* 左侧线 */}
      <div
        className="h-px flex-1"
        style={{
          background: 'linear-gradient(to left, #c0332f55, #c0332f18, transparent)',
        }}
      />

      {/* 中央装饰：三个旋转方块 */}
      <div className="flex shrink-0 items-center gap-1.25">
        <span
          style={{
            display: 'block',
            width: 5,
            height: 5,
            background: '#356daa',
            transform: 'rotate(45deg)',
            opacity: 0.45,
          }}
        />
        <span
          style={{
            display: 'block',
            width: 8,
            height: 8,
            background: '#c0332f',
            transform: 'rotate(45deg)',
          }}
        />
        <span
          style={{
            display: 'block',
            width: 5,
            height: 5,
            background: '#356daa',
            transform: 'rotate(45deg)',
            opacity: 0.45,
          }}
        />
      </div>

      {/* 右侧线 */}
      <div
        className="h-px flex-1"
        style={{
          background: 'linear-gradient(to right, #c0332f55, #c0332f18, transparent)',
        }}
      />
    </div>
  )
}
