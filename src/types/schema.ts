import { z } from "zod";

/**
 * Device environment contract for handling sample-rate differences
 * between desktop/web (44.1kHz) and mobile devices (48kHz).
 */
export interface EnvironmentConfig {
  isMobile: boolean;
  sampleRate: 44100 | 48000;
}

/**
 * Normalize and resolve runtime environment.
 */
export const resolveEnvironmentConfig = (isMobile: boolean): EnvironmentConfig => ({
  isMobile,
  sampleRate: isMobile ? 48000 : 44100,
});

/**
 * Audio metadata for source material.
 * - durationMs: full duration in milliseconds
 * - chunks: semantic segmentation timestamps in milliseconds
 */
export interface AudioMetadata {
  durationMs: number;
  chunks: number[];
}

/**
 * Original F0 trajectory point.
 * - t: timestamp in milliseconds
 * - v: frequency in Hz
 */
export interface PitchPoint {
  t: number;
  v: number;
}

/**
 * Original F0 path.
 */
export interface PitchData {
  f0: PitchPoint[];
}

/**
 * Multi-dimensional user scoring contract.
 */
export interface UserScores {
  Pitch: number;
  Rhythm: number;
  Intensity: number;
}

/**
 * User recording data after alignment.
 * - recording: recorded blob
 * - alignedOffsetMs: alignment offset to reference material in milliseconds
 * - scores: scoring by dimensions
 */
export interface UserRecord {
  recording: Blob;
  alignedOffsetMs: number;
  scores: UserScores;
}

// -----------------------------
// Zod Schemas
// -----------------------------

export const EnvironmentConfigSchema = z
  .object({
    isMobile: z.boolean(),
    sampleRate: z.union([z.literal(44100), z.literal(48000)]),
  })
  .superRefine((value, ctx) => {
    const expected = value.isMobile ? 48000 : 44100;
    if (value.sampleRate !== expected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `sampleRate must be ${expected} when isMobile=${value.isMobile}`,
        path: ["sampleRate"],
      });
    }
  });

export const AudioMetadataSchema = z
  .object({
    durationMs: z.number().nonnegative(),
    chunks: z.array(z.number().nonnegative()),
  })
  .superRefine((value, ctx) => {
    for (let i = 0; i < value.chunks.length; i += 1) {
      if (value.chunks[i] > value.durationMs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "chunk timestamp cannot exceed durationMs",
          path: ["chunks", i],
        });
      }
      if (i > 0 && value.chunks[i] < value.chunks[i - 1]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "chunks must be sorted in non-decreasing order",
          path: ["chunks", i],
        });
      }
    }
  });

export const PitchPointSchema = z.object({
  t: z.number().nonnegative(),
  v: z.number().positive(),
});

export const PitchDataSchema = z
  .object({
    f0: z.array(PitchPointSchema),
  })
  .superRefine((value, ctx) => {
    for (let i = 1; i < value.f0.length; i += 1) {
      if (value.f0[i].t < value.f0[i - 1].t) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "f0 timestamps must be sorted in non-decreasing order",
          path: ["f0", i, "t"],
        });
      }
    }
  });

export const UserScoresSchema = z.object({
  Pitch: z.number().min(0).max(100),
  Rhythm: z.number().min(0).max(100),
  Intensity: z.number().min(0).max(100),
});

export const UserRecordSchema = z.object({
  recording: z.instanceof(Blob),
  alignedOffsetMs: z.number(),
  scores: UserScoresSchema,
});

/**
 * API-delivered material package contract.
 */
export const ApiMaterialPackageSchema = z.object({
  environment: EnvironmentConfigSchema,
  metadata: AudioMetadataSchema,
  pitch: PitchDataSchema,
});

export type EnvironmentConfigDTO = z.infer<typeof EnvironmentConfigSchema>;
export type AudioMetadataDTO = z.infer<typeof AudioMetadataSchema>;
export type PitchDataDTO = z.infer<typeof PitchDataSchema>;
export type UserScoresDTO = z.infer<typeof UserScoresSchema>;
export type UserRecordDTO = z.infer<typeof UserRecordSchema>;
export type ApiMaterialPackageDTO = z.infer<typeof ApiMaterialPackageSchema>;

/**
 * Validate API JSON payload for material package.
 */
export const validateApiMaterialPackage = (payload: unknown): ApiMaterialPackageDTO =>
  ApiMaterialPackageSchema.parse(payload);
