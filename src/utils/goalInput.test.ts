import { describe, it, expect } from 'vitest';
import { parseGoalInput, isValidGoals, MAX_GOALS } from './goalInput';

describe('parseGoalInput', () => {
  it('returns undefined for an empty string', () => {
    expect(parseGoalInput('')).toBeUndefined();
  });

  it('returns undefined for non-numeric text', () => {
    expect(parseGoalInput('abc')).toBeUndefined();
  });

  it('parses a plain integer', () => {
    expect(parseGoalInput('3')).toBe(3);
  });

  it('clamps negative numbers to zero', () => {
    expect(parseGoalInput('-1')).toBe(0);
  });

  it('clamps values above the maximum', () => {
    expect(parseGoalInput('150')).toBe(MAX_GOALS);
  });

  it('truncates decimals to an integer', () => {
    expect(parseGoalInput('2.7')).toBe(2);
  });
});

describe('isValidGoals', () => {
  it('accepts integers within range', () => {
    expect(isValidGoals(0)).toBe(true);
    expect(isValidGoals(MAX_GOALS)).toBe(true);
  });

  it('rejects negatives, decimals, NaN and out-of-range values', () => {
    expect(isValidGoals(-1)).toBe(false);
    expect(isValidGoals(1.5)).toBe(false);
    expect(isValidGoals(NaN)).toBe(false);
    expect(isValidGoals(MAX_GOALS + 1)).toBe(false);
    expect(isValidGoals(undefined)).toBe(false);
  });
});
