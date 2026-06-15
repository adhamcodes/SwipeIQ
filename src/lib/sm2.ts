export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5;

export const QUALITY_SUCCESS: QualityScore = 5;
export const QUALITY_FAILURE: QualityScore = 1;

export const MIN_EFACTOR = 1.3;
export const DEFAULT_EFACTOR = 2.5;

export interface SM2State {
  repetition: number;
  interval: number;
  eFactor: number;
}

export interface SM2Result extends SM2State {
  nextReviewTimestamp: number;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function updateEasinessFactor(oldEF: number, quality: QualityScore): number {
  const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  return Math.max(MIN_EFACTOR, oldEF + delta);
}

export function applySM2(
  state: SM2State,
  quality: QualityScore,
  now: Date = new Date(),
): SM2Result {
  let { repetition, interval, eFactor } = state;

  eFactor = updateEasinessFactor(eFactor, quality);

  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * eFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  return {
    repetition,
    interval,
    eFactor,
    nextReviewTimestamp: addDays(now, interval).getTime(),
  };
}
