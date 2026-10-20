import { TournamentState } from '../types';
import { defaultQualifiers } from '../data/qualifiers';
import { StateSerializer } from './serializer';

export const VALID_STAGES = ['groups', 'knockout', 'stats'] as const;
export type Stage = (typeof VALID_STAGES)[number];

export function isValidStage(stage: string): stage is Stage {
  return (VALID_STAGES as readonly string[]).includes(stage);
}

/** decodeURIComponent that never throws: a malformed sequence is returned verbatim. */
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getStageFromPathname(pathname: string): string {
  return pathname.split('/').filter(Boolean)[0] ?? '';
}

/** The `&`-separated codes after the stage segment: [qualifiers, groups, knockout]. */
export function getCodesFromPathname(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return [];
  return safeDecode(parts.slice(1).join('/')).split('&');
}

/** Hydrates whatever parts of the state the URL carries; null when it carries nothing usable. */
export function getStateFromPathname(pathname: string): Partial<TournamentState> | null {
  const codes = getCodesFromPathname(pathname);
  if (codes.length === 0) return null;

  const state: Partial<TournamentState> = {};
  const qualifiers = codes[0] ? StateSerializer.deserializeQualifiers(codes[0]) : null;
  const groups = codes[1] ? StateSerializer.deserializeGroups(codes[1]) : null;
  const knockout = codes[2] ? StateSerializer.deserializeKnockout(codes[2]) : null;

  if (qualifiers) state.qualifiers = qualifiers;
  if (groups) state.groups = groups;
  if (knockout) state.knockout = knockout;

  return Object.keys(state).length > 0 ? state : null;
}

const DEFAULT_QUALIFIERS_CODE = StateSerializer.serializeQualifiers(defaultQualifiers);

function serializeAll(state: TournamentState) {
  return {
    qualifiers: StateSerializer.serializeQualifiers(state.qualifiers),
    groups: StateSerializer.serializeGroups(state.groups),
    knockout: StateSerializer.serializeKnockout(state.knockout),
  };
}

/** True when the state holds anything worth putting in the URL. */
export function hasTournamentData(state: TournamentState): boolean {
  const codes = serializeAll(state);
  return codes.groups !== '' || codes.knockout !== '' || codes.qualifiers !== DEFAULT_QUALIFIERS_CODE;
}

/** Canonical URL for a stage and state: `/stage` when empty, else `/stage/q&g&k`. */
export function buildStatePath(stage: string, state: TournamentState): string {
  if (!hasTournamentData(state)) return `/${stage}`;
  const codes = serializeAll(state);
  return `/${stage}/${codes.qualifiers}&${codes.groups}&${codes.knockout}`;
}
