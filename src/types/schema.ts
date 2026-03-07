export type Material = {
  id: string
  title: string
  speaker: string
  cover: string
  duration: string
}

export type CompareRequest = {
  originF0: number[]
  userF0: number[]
  threshold: number
}

const isNonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const isPitchArray = (value: unknown): value is number[] => {
  if (!Array.isArray(value) || value.length < 2) return false
  return value.every((point) => typeof point === 'number' && Number.isFinite(point) && point >= 30 && point <= 600)
}

export const validateMaterial = (value: unknown): value is Material => {
  if (typeof value !== 'object' || value === null) return false
  const material = value as Partial<Material>

  return (
    isNonEmpty(material.id) &&
    isNonEmpty(material.title) &&
    isNonEmpty(material.speaker) &&
    isNonEmpty(material.duration) &&
    typeof material.cover === 'string' &&
    isValidUrl(material.cover)
  )
}

export const validateCompareRequest = (value: unknown): value is CompareRequest => {
  if (typeof value !== 'object' || value === null) return false
  const request = value as Partial<CompareRequest>

  if (!isPitchArray(request.originF0) || !isPitchArray(request.userF0)) return false

  const threshold = request.threshold ?? 18
  if (typeof threshold !== 'number' || !Number.isFinite(threshold) || threshold <= 0) return false

  const delta = Math.abs(request.originF0.length - request.userF0.length)
  if (delta > 20) return false

  request.threshold = threshold
  return true
}
