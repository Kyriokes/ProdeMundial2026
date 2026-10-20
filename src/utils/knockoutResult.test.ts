import { describe, it, expect } from 'vitest';
import { updateKnockoutScore, toggleKnockoutPenalty } from './knockoutResult';
import { KnockoutMatch } from '../types';

const baseMatch = (): KnockoutMatch => ({
  id: 'M73',
  round: 'roundOf32',
  homeTeam: 'ARG',
  awayTeam: 'BRA',
});

describe('updateKnockoutScore', () => {
  it('sets the winner by goals', () => {
    const match = { ...baseMatch(), result: { homeGoals: 1, awayGoals: 0 } };
    expect(updateKnockoutScore(match, 'away', '0').winner).toBe('ARG');
    expect(updateKnockoutScore(match, 'away', '2').winner).toBe('BRA');
  });

  it('clears a stale penalty winner when the score stops being a draw', () => {
    const match = { ...baseMatch(), result: { homeGoals: 1, awayGoals: 1, isPenalty: true, penaltyWinner: 'home' as const, winner: 'ARG' } };
    const result = updateKnockoutScore(match, 'home', '2');
    expect(result.winner).toBe('ARG');
    expect(result.penaltyWinner).toBeUndefined();
    expect(result.isPenalty).toBeFalsy();
  });

  it('leaves a fresh draw without a winner until penalties are chosen', () => {
    const withPenalty = { ...baseMatch(), result: { homeGoals: 1, awayGoals: 1, isPenalty: true, penaltyWinner: 'home' as const } };
    const afterGoals = updateKnockoutScore(withPenalty, 'home', '2');
    const backToDraw = updateKnockoutScore({ ...baseMatch(), result: afterGoals }, 'away', '2');
    expect(backToDraw.winner).toBeUndefined();
    expect(backToDraw.penaltyWinner).toBeUndefined();
  });

  it('keeps the penalty winner while the draw stays the same', () => {
    const match = { ...baseMatch(), result: { homeGoals: 1, awayGoals: 1, isPenalty: true, penaltyWinner: 'home' as const, winner: 'ARG' } };
    const result = updateKnockoutScore(match, 'home', '1');
    expect(result.penaltyWinner).toBe('home');
    expect(result.winner).toBe('ARG');
  });

  it('clears the winner when a score is emptied', () => {
    const match = { ...baseMatch(), result: { homeGoals: 2, awayGoals: 1, winner: 'ARG' } };
    const result = updateKnockoutScore(match, 'home', '');
    expect(result.homeGoals).toBeUndefined();
    expect(result.winner).toBeUndefined();
  });

  it('clamps negative input to zero', () => {
    const result = updateKnockoutScore(baseMatch(), 'home', '-4');
    expect(result.homeGoals).toBe(0);
  });
});

describe('toggleKnockoutPenalty', () => {
  it('selects the penalty winner on a draw', () => {
    const match = { ...baseMatch(), result: { homeGoals: 0, awayGoals: 0 } };
    const result = toggleKnockoutPenalty(match, 'away');
    expect(result).toMatchObject({ isPenalty: true, penaltyWinner: 'away', winner: 'BRA' });
  });

  it('clears the penalty winner when toggled again', () => {
    const match = { ...baseMatch(), result: { homeGoals: 0, awayGoals: 0, isPenalty: true, penaltyWinner: 'away' as const, winner: 'BRA' } };
    const result = toggleKnockoutPenalty(match, 'away');
    expect(result.isPenalty).toBe(false);
    expect(result.penaltyWinner).toBeUndefined();
    expect(result.winner).toBeUndefined();
  });
});
