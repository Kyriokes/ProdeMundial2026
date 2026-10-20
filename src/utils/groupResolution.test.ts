import { describe, it, expect } from 'vitest';
import { resolveTeamCode, buildGroupsWithTeams } from './groupResolution';
import { defaultQualifiers } from '../data/qualifiers';
import { countries } from '../data/countries';

describe('resolveTeamCode', () => {
  it('returns a concrete country code unchanged', () => {
    expect(resolveTeamCode('MEX', defaultQualifiers)).toBe('MEX');
  });

  it('resolves a UEFA path placeholder from the qualifiers state', () => {
    const qualifiers = { ...defaultQualifiers, uefaPaths: { ...defaultQualifiers.uefaPaths, pathA: 'ITA' } };
    expect(resolveTeamCode('pathA', qualifiers)).toBe('ITA');
  });

  it('resolves an intercontinental key placeholder from the qualifiers state', () => {
    const qualifiers = { ...defaultQualifiers, intercontinentalKeys: { ...defaultQualifiers.intercontinentalKeys, keyB: 'BOL' } };
    expect(resolveTeamCode('keyB', qualifiers)).toBe('BOL');
  });

  it('falls back to the default when the placeholder is empty', () => {
    const qualifiers = { ...defaultQualifiers, uefaPaths: { ...defaultQualifiers.uefaPaths, pathA: '' } };
    expect(resolveTeamCode('pathA', qualifiers)).toBe(defaultQualifiers.uefaPaths.pathA);
  });

  it('falls back to the default when qualifiers are missing', () => {
    expect(resolveTeamCode('keyB', undefined)).toBe(defaultQualifiers.intercontinentalKeys.keyB);
  });
});

describe('buildGroupsWithTeams', () => {
  it('returns 12 groups with 4 known teams and 6 matches each', () => {
    const groups = buildGroupsWithTeams(defaultQualifiers);
    expect(groups).toHaveLength(12);
    for (const group of groups) {
      expect(group.teams).toHaveLength(4);
      group.teams.forEach(code => expect(countries[code]).toBeDefined());
      expect(group.matches).toHaveLength(6);
    }
  });
});
