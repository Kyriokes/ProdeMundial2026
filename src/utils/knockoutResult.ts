import { KnockoutMatch, MatchResult } from '../types';
import { parseGoalInput } from './goalInput';

export type KnockoutResult = MatchResult & { winner?: string };

function deriveWinner(match: KnockoutMatch, result: KnockoutResult): string | undefined {
  if (result.homeGoals === undefined || result.awayGoals === undefined) return undefined;
  if (result.homeGoals > result.awayGoals) return match.homeTeam ?? undefined;
  if (result.awayGoals > result.homeGoals) return match.awayTeam ?? undefined;
  if (result.isPenalty && result.penaltyWinner) {
    return result.penaltyWinner === 'home' ? match.homeTeam ?? undefined : match.awayTeam ?? undefined;
  }
  return undefined;
}

const emptyResult = (): KnockoutResult => ({ homeGoals: undefined, awayGoals: undefined });

/** Applies a score input to a knockout match, clearing stale penalty data when the score is no longer a draw. */
export function updateKnockoutScore(match: KnockoutMatch, side: 'home' | 'away', raw: string): KnockoutResult {
  const next: KnockoutResult = { ...(match.result ?? emptyResult()) };
  next[side === 'home' ? 'homeGoals' : 'awayGoals'] = parseGoalInput(raw);

  const complete = next.homeGoals !== undefined && next.awayGoals !== undefined;
  if (complete && next.homeGoals !== next.awayGoals) {
    delete next.isPenalty;
    delete next.penaltyWinner;
  }

  next.winner = deriveWinner(match, next);
  return next;
}

/** Selects (or unselects, when already selected) the side that wins on penalties. */
export function toggleKnockoutPenalty(match: KnockoutMatch, side: 'home' | 'away'): KnockoutResult {
  const current = match.result ?? emptyResult();
  const penaltyWinner = current.penaltyWinner === side ? undefined : side;
  const next: KnockoutResult = { ...current, isPenalty: penaltyWinner !== undefined, penaltyWinner };
  next.winner = deriveWinner(match, next);
  return next;
}
