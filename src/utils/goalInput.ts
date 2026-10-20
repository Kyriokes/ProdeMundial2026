export const MAX_GOALS = 99;

/** True when the value is an integer goal count within the accepted range. */
export function isValidGoals(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_GOALS;
}

/**
 * Parses the raw text of a goals input.
 * Empty or non-numeric text means "no result"; numbers are clamped to [0, MAX_GOALS].
 */
export function parseGoalInput(raw: string): number | undefined {
  if (raw.trim() === '') return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return undefined;
  return Math.min(Math.max(parsed, 0), MAX_GOALS);
}
