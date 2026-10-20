import { describe, it, expect } from 'vitest';
import { getCodesFromPathname, getStateFromPathname, buildStatePath, hasTournamentData, isValidStage } from './urlState';
import { StateSerializer } from './serializer';
import { defaultQualifiers } from '../data/qualifiers';
import { TournamentState } from '../types';

const emptyState: TournamentState = {
  qualifiers: defaultQualifiers,
  groups: { matches: {} },
  knockout: { matches: {} },
};

describe('getCodesFromPathname', () => {
  it('returns no codes for a bare stage', () => {
    expect(getCodesFromPathname('/groups')).toEqual([]);
  });

  it('splits codes on &', () => {
    expect(getCodesFromPathname('/groups/aaa&bbb&ccc')).toEqual(['aaa', 'bbb', 'ccc']);
  });

  it('decodes %26 back into separators', () => {
    expect(getCodesFromPathname('/knockout/aaa%26bbb%26ccc')).toEqual(['aaa', 'bbb', 'ccc']);
  });

  it('does not throw on a malformed percent sequence', () => {
    expect(() => getCodesFromPathname('/groups/abc%E0%A4%A')).not.toThrow();
    expect(getCodesFromPathname('/groups/abc%E0%A4%A')).toEqual(['abc%E0%A4%A']);
  });
});

describe('getStateFromPathname', () => {
  it('returns null when the URL carries no codes', () => {
    expect(getStateFromPathname('/stats')).toBeNull();
  });

  it('returns null when the codes are garbage', () => {
    expect(getStateFromPathname('/groups/zzz&yyy&xxx')).toBeNull();
  });

  it('hydrates the groups state from a serialized URL', () => {
    const groups = { matches: { 'B-3': { homeGoals: 0, awayGoals: 4 } } };
    const path = `/groups/${StateSerializer.serializeQualifiers(defaultQualifiers)}&${StateSerializer.serializeGroups(groups)}&`;
    expect(getStateFromPathname(path)?.groups?.matches['B-3']).toEqual({ homeGoals: 0, awayGoals: 4 });
  });
});

describe('buildStatePath', () => {
  it('returns the bare stage when there is no data', () => {
    expect(buildStatePath('groups', emptyState)).toBe('/groups');
  });

  it('round-trips state through the URL', () => {
    const state: TournamentState = {
      qualifiers: { ...defaultQualifiers, uefaPaths: { ...defaultQualifiers.uefaPaths, pathA: 'ITA' } },
      groups: { matches: { 'A-1': { homeGoals: 2, awayGoals: 2, homeYellow: 2 } } },
      knockout: { matches: { M80: { homeGoals: 1, awayGoals: 1, isPenalty: true, penaltyWinner: 'away', winner: 'ENG' } } },
    };
    const path = buildStatePath('knockout', state);
    expect(path.startsWith('/knockout/')).toBe(true);
    const parsed = getStateFromPathname(path);
    expect(parsed?.qualifiers?.uefaPaths.pathA).toBe('ITA');
    expect(parsed?.groups?.matches['A-1']).toMatchObject({ homeGoals: 2, awayGoals: 2, homeYellow: 2 });
    expect(parsed?.knockout?.matches['M80']).toMatchObject({ homeGoals: 1, awayGoals: 1, isPenalty: true, penaltyWinner: 'away', winner: 'ENG' });
  });

  it('is stable: rebuilding from a parsed path yields the same path', () => {
    const state: TournamentState = {
      ...emptyState,
      groups: { matches: { 'L-6': { homeGoals: 3, awayGoals: 1 } } },
    };
    const path = buildStatePath('groups', state);
    const parsed = getStateFromPathname(path)!;
    expect(buildStatePath('groups', { ...emptyState, ...parsed })).toBe(path);
  });
});

describe('hasTournamentData', () => {
  it('is false for the initial state', () => {
    expect(hasTournamentData(emptyState)).toBe(false);
  });

  it('is true once a match has a result', () => {
    expect(hasTournamentData({ ...emptyState, groups: { matches: { 'A-1': { homeGoals: 1, awayGoals: 0 } } } })).toBe(true);
  });

  it('is true when a qualifier differs from the default', () => {
    expect(hasTournamentData({ ...emptyState, qualifiers: { ...defaultQualifiers, uefaPaths: { ...defaultQualifiers.uefaPaths, pathC: 'ROU' } } })).toBe(true);
  });
});

describe('isValidStage', () => {
  it('accepts the three app stages and rejects others', () => {
    expect(isValidStage('groups')).toBe(true);
    expect(isValidStage('knockout')).toBe(true);
    expect(isValidStage('stats')).toBe(true);
    expect(isValidStage('qualifiers')).toBe(false);
    expect(isValidStage('')).toBe(false);
  });
});
