import { useCallback, useEffect, useRef, useState } from 'react'

type RecorderState = 'idle' | 'recording' | 'ready'

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    chunksRef.current = []
    mediaRecorder.ondataavailable = (event) => chunksRef.current.push(event.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(blob)
      })
      setState('ready')
      stream.getTracks().forEach((track) => track.stop())
    }
    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setState('recording')
  }, [])

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  return { start, stop, state, audioUrl }
}
