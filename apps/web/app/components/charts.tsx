import { useRef, useEffect, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Gauge — circular SVG arc showing percentage
// ---------------------------------------------------------------------------

interface GaugeProps {
  value: number // 0-100
  label: string
  size?: number
}

function gaugeColor(value: number): string {
  if (value >= 90) return 'var(--color-destructive)'
  if (value >= 70) return 'var(--color-warning)'
  return 'var(--color-success)'
}

export function Gauge({ value, label, size = 96 }: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={strokeWidth}
        />
        {/* Foreground arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={gaugeColor(clamped)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-lg font-bold tabular-nums text-foreground">
          {Math.round(clamped)}%
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sparkline — SVG polyline showing trend data
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

export function Sparkline({
  data,
  width = 200,
  height = 40,
  color = 'var(--color-primary)',
}: SparklineProps) {
  const points = useMemo(() => {
    if (data.length === 0) return ''
    const max = Math.max(...data, 1)
    const step = width / Math.max(data.length - 1, 1)
    return data
      .map((v, i) => {
        const x = i * step
        const y = height - (v / max) * (height - 4) - 2
        return `${x},${y}`
      })
      .join(' ')
  }, [data, width, height])

  const areaPath = useMemo(() => {
    if (data.length === 0) return ''
    const max = Math.max(...data, 1)
    const step = width / Math.max(data.length - 1, 1)
    const pts = data.map((v, i) => {
      const x = i * step
      const y = height - (v / max) * (height - 4) - 2
      return `${x},${y}`
    })
    return `M0,${height} L${pts.join(' L')} L${width},${height} Z`
  }, [data, width, height])

  if (data.length < 2) {
    return (
      <svg width={width} height={height}>
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-muted-foreground)"
          fontSize="10"
        >
          No data
        </text>
      </svg>
    )
  }

  return (
    <svg width={width} height={height}>
      <path d={areaPath} fill={color} opacity={0.1} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
