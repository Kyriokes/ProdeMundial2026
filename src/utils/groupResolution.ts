import { Group, QualifiersState } from '../types';
import { initialGroups } from '../data/groups';
import { defaultQualifiers, uefaPaths, intercontinentalKeys } from '../data/qualifiers';
import { generateGroupMatches } from './calculations';

const isUefaPlaceholder = (code: string) => uefaPaths.some(path => path.id === code);
const isKeyPlaceholder = (code: string) => intercontinentalKeys.some(key => key.id === code);

/** Turns a group-slot placeholder (pathA..pathD, keyA, keyB) into a country code, falling back to the defaults. */
export function resolveTeamCode(code: string, qualifiers: QualifiersState | undefined): string {
  if (isUefaPlaceholder(code)) {
    return qualifiers?.uefaPaths?.[code] || defaultQualifiers.uefaPaths[code];
  }
  if (isKeyPlaceholder(code)) {
    return qualifiers?.intercontinentalKeys?.[code] || defaultQualifiers.intercontinentalKeys[code];
  }
  return code;
}

/** The twelve groups with their placeholders resolved and their six matches generated. */
export function buildGroupsWithTeams(qualifiers: QualifiersState | undefined): Group[] {
  return initialGroups.map(group => {
    const teams = group.teams.map(code => resolveTeamCode(code, qualifiers));
    return { ...group, teams, matches: generateGroupMatches(group.id, teams), members: {} };
  });
}
