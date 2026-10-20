import LZString from 'lz-string';
import { QualifiersState, GroupsState, KnockoutState, MatchResult, QualifierOption } from '../types';
import { uefaPaths, intercontinentalKeys } from '../data/qualifiers';
import { countries } from '../data/countries';
import { isValidGoals } from './goalInput';

const GROUP_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const MATCHES_PER_GROUP = 6;
const FIRST_KNOCKOUT_MATCH = 73;
const LAST_KNOCKOUT_MATCH = 104;

/** Parses a non-negative integer written in the URL; anything else is NaN. */
function parseStoredInt(value: string | undefined): number {
  return value !== undefined && /^\d+$/.test(value) ? Number(value) : NaN;
}

function parseStoredGoals(value: string | undefined): number | null {
  const goals = parseStoredInt(value);
  return isValidGoals(goals) ? goals : null;
}

/** Keeps the code only when it is one of the teams that can actually win that play-off slot. */
function allowedTeam(options: QualifierOption[], slotId: string, code: string | undefined): string {
  if (!code) return '';
  const option = options.find(o => o.id === slotId);
  return option && option.teams.includes(code) ? code : '';
}

function trimTrailingEmpty(entries: string[]): string {
  let raw = entries.join(';');
  while (raw.endsWith(';_')) {
    raw = raw.substring(0, raw.length - 2);
  }
  return raw === '_' ? '' : raw;
}

export class StateSerializer {
  // --- Qualifiers ---
  // Format: PathA,PathB,PathC,PathD,KeyA,KeyB
  static serializeQualifiers(qualifiers: QualifiersState): string {
    const values = [
      ...uefaPaths.map(path => qualifiers.uefaPaths[path.id] || ''),
      ...intercontinentalKeys.map(key => qualifiers.intercontinentalKeys[key.id] || ''),
    ];
    if (values.every(v => v === '')) return '';
    return LZString.compressToEncodedURIComponent(values.join(','));
  }

  static deserializeQualifiers(compressed: string): QualifiersState | null {
    if (!compressed) return null;
    try {
      const raw = LZString.decompressFromEncodedURIComponent(compressed);
      if (!raw) return null;

      const values = raw.split(',');
      const result: QualifiersState = { uefaPaths: {}, intercontinentalKeys: {} };
      uefaPaths.forEach((path, i) => {
        result.uefaPaths[path.id] = allowedTeam(uefaPaths, path.id, values[i]);
      });
      intercontinentalKeys.forEach((key, i) => {
        result.intercontinentalKeys[key.id] = allowedTeam(intercontinentalKeys, key.id, values[uefaPaths.length + i]);
      });

      const hasAny = [...Object.values(result.uefaPaths), ...Object.values(result.intercontinentalKeys)].some(Boolean);
      return hasAny ? result : null;
    } catch (e) {
      console.warn('Ignoring malformed qualifiers:', e);
      return null;
    }
  }

  // --- Groups ---
  // Order: A1..A6, B1..B6, ... L1..L6 (12 groups * 6 matches = 72 matches)
  // Format per match: HG:AG[:HY.HDY.HDR.AY.ADY.ADR] or _ if not played
  static serializeGroups(groups: GroupsState): string {
    const entries: string[] = [];

    GROUP_IDS.forEach(groupId => {
      for (let i = 1; i <= MATCHES_PER_GROUP; i++) {
        const result = groups.matches[`${groupId}-${i}`];
        if (!result || result.homeGoals === undefined || result.awayGoals === undefined) {
          entries.push('_');
          continue;
        }

        const cards = [
          result.homeYellow || 0,
          result.homeDoubleYellow || 0,
          result.homeDirectRed || 0,
          result.awayYellow || 0,
          result.awayDoubleYellow || 0,
          result.awayDirectRed || 0,
        ];
        let entry = `${result.homeGoals}:${result.awayGoals}`;
        if (cards.some(c => c > 0)) {
          entry += `:${cards.join('.')}`;
        }
        entries.push(entry);
      }
    });

    const raw = trimTrailingEmpty(entries);
    return raw ? LZString.compressToEncodedURIComponent(raw) : '';
  }

  static deserializeGroups(compressed: string): GroupsState | null {
    if (!compressed) return null;
    try {
      const raw = LZString.decompressFromEncodedURIComponent(compressed);
      if (!raw) return null;

      const entries = raw.split(';');
      const matches: Record<string, MatchResult> = {};

      let idx = 0;
      for (const groupId of GROUP_IDS) {
        for (let i = 1; i <= MATCHES_PER_GROUP; i++) {
          if (idx >= entries.length) break;
          const entry = entries[idx++];
          if (entry === '_' || entry === '') continue;

          const parts = entry.split(':');
          const homeGoals = parseStoredGoals(parts[0]);
          const awayGoals = parseStoredGoals(parts[1]);
          if (homeGoals === null || awayGoals === null) continue;

          const result: MatchResult = { homeGoals, awayGoals };

          if (parts[2]) {
            const cards = parts[2].split('.').map(parseStoredInt);
            if (cards.length === 6 && cards.every(Number.isInteger)) {
              [result.homeYellow, result.homeDoubleYellow, result.homeDirectRed,
               result.awayYellow, result.awayDoubleYellow, result.awayDirectRed] = cards;
            }
          }

          matches[`${groupId}-${i}`] = result;
        }
      }

      return Object.keys(matches).length > 0 ? { matches } : null;
    } catch (e) {
      console.warn('Ignoring malformed groups:', e);
      return null;
    }
  }

  // --- Knockout ---
  // IDs: M73 to M104 (32 matches). Format: HG:AG[:pH|pV][:WINNER]
  static serializeKnockout(knockout: KnockoutState): string {
    const entries: string[] = [];

    for (let i = FIRST_KNOCKOUT_MATCH; i <= LAST_KNOCKOUT_MATCH; i++) {
      const result = knockout.matches[`M${i}`];
      if (!result || result.homeGoals === undefined || result.awayGoals === undefined) {
        entries.push('_');
        continue;
      }

      let entry = `${result.homeGoals}:${result.awayGoals}`;
      const isDraw = result.homeGoals === result.awayGoals;
      if (isDraw && result.isPenalty && result.penaltyWinner) {
        entry += `:${result.penaltyWinner === 'home' ? 'pH' : 'pV'}`;
      }
      if (result.winner) {
        entry += `:${result.winner}`;
      }
      entries.push(entry);
    }

    const raw = trimTrailingEmpty(entries);
    return raw ? LZString.compressToEncodedURIComponent(raw) : '';
  }

  static deserializeKnockout(compressed: string): KnockoutState | null {
    if (!compressed) return null;
    try {
      const raw = LZString.decompressFromEncodedURIComponent(compressed);
      if (!raw) return null;

      const entries = raw.split(';');
      const matches: Record<string, MatchResult & { winner?: string }> = {};

      let idx = 0;
      for (let i = FIRST_KNOCKOUT_MATCH; i <= LAST_KNOCKOUT_MATCH; i++) {
        if (idx >= entries.length) break;
        const entry = entries[idx++];
        if (entry === '_' || entry === '') continue;

        const parts = entry.split(':');
        const homeGoals = parseStoredGoals(parts[0]);
        const awayGoals = parseStoredGoals(parts[1]);
        if (homeGoals === null || awayGoals === null) continue;

        const result: MatchResult & { winner?: string } = { homeGoals, awayGoals };

        let winnerIndex = 2;
        if (parts[2] === 'pH' || parts[2] === 'pV') {
          if (homeGoals === awayGoals) {
            result.isPenalty = true;
            result.penaltyWinner = parts[2] === 'pH' ? 'home' : 'away';
          }
          winnerIndex = 3;
        }

        const winner = parts[winnerIndex];
        if (winner && countries[winner]) {
          result.winner = winner;
        }

        matches[`M${i}`] = result;
      }

      return Object.keys(matches).length > 0 ? { matches } : null;
    } catch (e) {
      console.warn('Ignoring malformed knockout:', e);
      return null;
    }
  }
}
