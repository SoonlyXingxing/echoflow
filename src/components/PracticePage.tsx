import { toPng } from 'html-to-image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProsodyCanvas } from './ProsodyCanvas'
import { useRecorder } from '../hooks/useRecorder'

const baseF0 = Array.from({ length: 120 }, (_, i) => 140 + Math.sin(i / 5) * 40 + ((i % 16) - 8) * 1.5)

const alignPitch = (origin: number[], delay = 0.04) =>
  origin.map((value, i) => value + Math.sin(i / 4 + delay * 10) * 10 + (i % 7 === 0 ? 20 : 0) - 6)

export function PracticePage() {
  const { id } = useParams()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(24)
  const [started, setStarted] = useState(false)
  const [userF0, setUserF0] = useState<number[]>([])
  const { start, stop, state, audioUrl } = useRecorder()
  const reportRef = useRef<HTMLDivElement>(null)

  const title = useMemo(() => `TED 素材 #${id ?? ''} 跟读训练`, [id])

  useEffect(() => {
    let frame = 0
    if (!started) return
    const tick = () => {
      setCurrentTime((prev) => {
        const next = prev + 0.05
        return next > duration ? 0 : next
      })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [duration, started])

  const handleStart = async () => {
    setStarted(true)
    await start()
  }

  const handleStop = () => {
    stop()
    const aligned = alignPitch(baseF0)
    setUserF0(aligned)
  }

  const saveReport = async () => {
    if (!reportRef.current) return
    const dataUrl = await toPng(reportRef.current)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `echoflow-report-${id ?? 'demo'}.png`
    link.click()
  }

  return (
    <main className="page practice-page" ref={reportRef}>
      <h2>{title}</h2>
      <p>iOS Safari 提示：必须点击“开始练习”后才初始化 AudioContext/录音，否则会静音。</p>
      <div className="canvas-wrap">
        <ProsodyCanvas originF0={baseF0} userF0={userF0} currentTime={currentTime} duration={duration} />
      </div>
      <div className="actions">
        <button onClick={handleStart} disabled={state === 'recording'}>开始练习</button>
        <button onClick={handleStop} disabled={state !== 'recording'}>结束并比对</button>
        <button onClick={saveReport}>保存分析报告为图片</button>
      </div>
      {audioUrl && <audio src={audioUrl} controls />}
    </main>
  )
}
