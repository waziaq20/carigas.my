type PricePoint = {
  price: number
  createdAt: string
}

type PriceSparklineProps = {
  data: PricePoint[]
  label: string
}

export function PriceSparkline({ data, label }: PriceSparklineProps) {
  if (data.length < 2) {
    return null
  }

  const prices = data.map((d) => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const width = 80
  const height = 24

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((d.price - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
