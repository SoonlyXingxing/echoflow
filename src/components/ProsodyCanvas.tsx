import { useEffect, useRef } from 'react'

type ProsodyCanvasProps = {
  originF0: number[]
  userF0?: number[]
  currentTime: number
  duration: number
  threshold?: number
}

const toY = (value: number, height: number) => {
  const max = 320
  const min = 70
  const clamped = Math.max(min, Math.min(max, value || min))
  const p = (clamped - min) / (max - min)
  return height - p * (height - 30) - 15
}

const isTwoDContext = (context: unknown): context is TwoDContext => {
  return typeof context === 'object' && context !== null && 'clearRect' in context && 'bezierCurveTo' in context
}

const getBackgroundContext = (target: OffscreenCanvas | HTMLCanvasElement): TwoDContext | null => {
  const rawContext = target.getContext('2d')
  return isTwoDContext(rawContext) ? rawContext : null
}

export function ProsodyCanvas({ originF0, userF0 = [], currentTime, duration, threshold = 18 }: ProsodyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgCanvasRef = useRef<OffscreenCanvas | HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth * dpr
    const height = canvas.clientHeight * dpr
    canvas.width = width
    canvas.height = height

    const target = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(width, height) : document.createElement('canvas')
    target.width = width
    target.height = height

    const bgCtx = getBackgroundContext(target)
    if (!bgCtx) return

    bgCtx.clearRect(0, 0, width, height)
    bgCtx.fillStyle = '#f8fafc'
    bgCtx.fillRect(0, 0, width, height)

    const chunkWidth = width / 6
    for (let i = 0; i < 6; i += 1) {
      bgCtx.fillStyle = i % 2 ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.2)'
      bgCtx.fillRect(i * chunkWidth, 0, chunkWidth, height)
    }

    bgCtx.strokeStyle = 'rgba(100,116,139,0.55)'
    bgCtx.lineWidth = 2 * dpr
    bgCtx.beginPath()

    originF0.forEach((f0, idx) => {
      const x = (idx / Math.max(originF0.length - 1, 1)) * width
      const y = toY(f0, height)
      if (idx === 0) {
        bgCtx.moveTo(x, y)
      } else {
        const prevX = ((idx - 1) / Math.max(originF0.length - 1, 1)) * width
        const prevY = toY(originF0[idx - 1], height)
        const c1x = prevX + (x - prevX) * 0.35
        const c2x = prevX + (x - prevX) * 0.65
        bgCtx.bezierCurveTo(c1x, prevY, c2x, y, x, y)
      }
    })

    bgCtx.stroke()
    bgCanvasRef.current = target
  }, [originF0])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !bgCanvasRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bgCanvasRef.current as CanvasImageSource, 0, 0)

    if (userF0.length > 1) {
      ctx.strokeStyle = 'rgba(37,99,235,0.85)'
      ctx.lineWidth = 2 * (window.devicePixelRatio || 1)
      ctx.beginPath()
      userF0.forEach((f0, idx) => {
        const x = (idx / Math.max(userF0.length - 1, 1)) * canvas.width
        const y = toY(f0, canvas.height)
        if (idx === 0) {
          ctx.moveTo(x, y)
          return
        }
        ctx.lineTo(x, y)
      })
      ctx.stroke()

      const len = Math.min(userF0.length, originF0.length)
      for (let i = 0; i < len; i += 1) {
        const yDiff = Math.abs(toY(userF0[i], canvas.height) - toY(originF0[i], canvas.height))
        if (yDiff > threshold) {
          const x = (i / Math.max(len - 1, 1)) * canvas.width
          ctx.fillStyle = 'rgba(239,68,68,0.2)'
          ctx.fillRect(x - 2, canvas.height - 24, 4, 24)
        }
      }
    }

    const progress = duration > 0 ? currentTime / duration : 0
    const cursorX = Math.max(0, Math.min(1, progress)) * canvas.width
    ctx.strokeStyle = 'rgba(16,185,129,0.95)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cursorX, 0)
    ctx.lineTo(cursorX, canvas.height)
    ctx.stroke()

    const originIndex = Math.floor(progress * (originF0.length - 1))
    const y = toY(originF0[Math.max(0, originIndex)] ?? originF0[0], canvas.height)
    ctx.fillStyle = '#10b981'
    ctx.beginPath()
    ctx.arc(cursorX, y, 6, 0, Math.PI * 2)
    ctx.fill()
  }, [currentTime, duration, originF0, threshold, userF0])

  return <canvas ref={canvasRef} className="prosody-canvas" />
}
