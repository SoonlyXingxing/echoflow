import { z } from 'zod'

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} 不能为空`)

type CompareRequestInput = {
  originF0: number[]
  userF0: number[]
  threshold: number
}

export const materialSchema = z.object({
  id: nonEmpty('id'),
  title: nonEmpty('title'),
  speaker: nonEmpty('speaker'),
  cover: z.string().url('cover 必须是合法 URL'),
  duration: nonEmpty('duration')
})

export const pitchSeriesSchema = z
  .array(z.number().finite())
  .min(2, '至少需要 2 个音高点')
  .superRefine((value: number[], ctx: z.RefinementCtx) => {
    if (value.some((point) => point < 30 || point > 600)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '音高点必须位于 30Hz ~ 600Hz 范围内'
      })
    }
  })

export const compareRequestSchema = z
  .object({
    originF0: pitchSeriesSchema,
    userF0: pitchSeriesSchema,
    threshold: z.number().positive().default(18)
  })
  .superRefine((value: CompareRequestInput, ctx: z.RefinementCtx) => {
    const delta = Math.abs(value.originF0.length - value.userF0.length)
    if (delta > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['userF0'],
        message: '用户音高序列与原音长度差距过大，请重新录音'
      })
    }
  })

export type Material = z.infer<typeof materialSchema>
export type CompareRequest = z.infer<typeof compareRequestSchema>
