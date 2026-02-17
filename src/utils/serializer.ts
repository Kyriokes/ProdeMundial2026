import LZString from 'lz-string';
import { TournamentState, QualifiersState, GroupsState, KnockoutState, MatchResult } from '../types';

export class StateSerializer {
  static serialize(state: any): string {
    const jsonString = JSON.stringify(state);
    return LZString.compressToEncodedURIComponent(jsonString);
  }

  static deserialize(compressed: string): any {
    try {
      const jsonString = LZString.decompressFromEncodedURIComponent(compressed);
      if (!jsonString) return null;
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to deserialize state:', e);
      return null;
    }
  }

  // --- Qualifiers Serialization ---
  // Format: PathA,PathB,PathC,PathD,KeyA,KeyB
  static serializeQualifiers(qualifiers: QualifiersState): string {
    const paths = ['pathA', 'pathB', 'pathC', 'pathD'];
    const keys = ['keyA', 'keyB'];
    
    const values: string[] = [];
    paths.forEach(p => values.push(qualifiers.uefaPaths[p] || ''));
    keys.forEach(k => values.push(qualifiers.intercontinentalKeys[k] || ''));
    
    // Check if empty
    if (values.every(v => v === '')) return '';

    const raw = values.join(',');
    return LZString.compressToEncodedURIComponent(raw);
  }

  static deserializeQualifiers(compressed: string): QualifiersState | null {
    if (!compressed) return null;
    try {
      const raw = LZString.decompressFromEncodedURIComponent(compressed);
      if (!raw) return null;
      
      const values = raw.split(',');
      // We expect 6 values, but handle shorter if user modified URL manually
      
      return {
        uefaPaths: {
          pathA: values[0] || '',
          pathB: values[1] || '',
          pathC: values[2] || '',
          pathD: values[3] || '',
        },
        intercontinentalKeys: {
          keyA: values[4] || '',
          keyB: values[5] || '',
        }
      };
    } catch (e) {
      console.error('Failed to deserialize qualifiers:', e);
      return null;
    }
  }

  // --- Groups Serialization ---
  // Order: A1..A6, B1..B6, ... L1..L6 (12 groups * 6 matches = 72 matches)
  // Format per match: HG:AG[:HY.HDY.HDR.AY.ADY.ADR] or _ if not played
  // Separator: ;
  static serializeGroups(groups: GroupsState): string {
    const groupIds = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    const matchResults: string[] = [];

    groupIds.forEach(groupId => {
      for (let i = 1; i <= 6; i++) {
        const matchId = `${groupId}-${i}`;
        const result = groups.matches[matchId];
        
        if (!result || result.homeGoals === undefined || result.awayGoals === undefined) {
          matchResults.push('_');
        } else {
          // Check for cards
          const hasCards = (result.homeYellow || 0) > 0 || 
                           (result.homeDoubleYellow || 0) > 0 || 
                           (result.homeDirectRed || 0) > 0 ||
                           (result.awayYellow || 0) > 0 || 
                           (result.awayDoubleYellow || 0) > 0 || 
                           (result.awayDirectRed || 0) > 0;
                           
          let matchStr = `${result.homeGoals}:${result.awayGoals}`;
          
          if (hasCards) {
            matchStr += `:${result.homeYellow||0}.${result.homeDoubleYellow||0}.${result.homeDirectRed||0}.${result.awayYellow||0}.${result.awayDoubleYellow||0}.${result.awayDirectRed||0}`;
          }
          
          matchResults.push(matchStr);
        }
      }
    });

    // Trim trailing underscores to save space
    let raw = matchResults.join(';');
    while (raw.endsWith(';_')) {
      raw = raw.substring(0, raw.length - 2);
    }
    if (raw === '_') return '';

    return LZString.compressToEncodedURIComponent(raw);
  }

  static deserializeGroups(compressed: string): GroupsState | null {
    if (!compressed) return null;
    try {
      const raw = LZString.decompressFromEncodedURIComponent(compressed);
      if (!raw) return null;
      
      const matchStrs = raw.split(';');
      const matches: Record<string, MatchResult> = {};
      const groupIds = ['A','B','C','D','E','F','G','H','I','J','K','L'];
      
      let matchIdx = 0;
      for (const groupId of groupIds) {
        for (let i = 1; i <= 6; i++) {
          if (matchIdx >= matchStrs.length) break;
          
          const str = matchStrs[matchIdx];
          matchIdx++;
          
          if (str === '_' || str === '') continue;
          
          const parts = str.split(':');
          const homeGoals = parseInt(parts[0]);
          const awayGoals = parseInt(parts[1]);
          
          if (isNaN(homeGoals) || isNaN(awayGoals)) continue;
          
          const result: MatchResult = { homeGoals, awayGoals };
          
          // Cards
          if (parts[2]) {
            const cardParts = parts[2].split('.').map(Number);
            if (cardParts.length === 6) {
              result.homeYellow = cardParts[0];
              result.homeDoubleYellow = cardParts[1];
              result.homeDirectRed = cardParts[2];
              result.awayYellow = cardParts[3];
              result.awayDoubleYellow = cardParts[4];
              result.awayDirectRed = cardParts[5];
            }
          }
          
          matches[`${groupId}-${i}`] = result;
        }
      }
      
      return { matches };
    } catch (e) {
       console.error('Failed to deserialize groups:', e);
       return null;
    }
  }

  // --- Knockout Serialization ---
  // IDs: R32-1..16, R16-1..8, QF-1..4, SF-1..2, FINAL
  static serializeKnockout(knockout: KnockoutState): string {
    const rounds = [
      { prefix: 'R32-', count: 16 },
      { prefix: 'R16-', count: 8 },
      { prefix: 'QF-', count: 4 },
      { prefix: 'SF-', count: 2 },
      { prefix: 'FINAL', count: 1 } // Special case
    ];
    
    const results: string[] = [];
    
    rounds.forEach(round => {
      for (let i = 1; i <= round.count; i++) {
        const matchId = round.prefix === 'FINAL' ? 'FINAL' : `${round.prefix}${i}`;
        const result = knockout.matches[matchId];
        
        if (!result || result.homeGoals === undefined || result.awayGoals === undefined) {
          results.push('_');
        } else {
          let str = `${result.homeGoals}:${result.awayGoals}`;
          if (result.isPenalty && result.penaltyWinner) {
            str += `:${result.penaltyWinner === 'home' ? 'pH' : 'pV'}`;
          }
          results.push(str);
        }
      }
    });
    
    // Trim trailing underscores
    let raw = results.join(';');
    while (raw.endsWith(';_')) {
      raw = raw.substring(0, raw.length - 2);
    }
    if (raw === '_') return '';

    return LZString.compressToEncodedURIComponent(raw);
  }

  static deserializeKnockout(compressed: string): KnockoutState | null {
    if (!compressed) return null;
    try {
      const raw = LZString.decompressFromEncodedURIComponent(compressed);
      if (!raw) return null;
      
      const parts = raw.split(';');
      const matches: Record<string, MatchResult & { winner?: string }> = {};
      
      const rounds = [
        { prefix: 'R32-', count: 16 },
        { prefix: 'R16-', count: 8 },
        { prefix: 'QF-', count: 4 },
        { prefix: 'SF-', count: 2 },
        { prefix: 'FINAL', count: 1 }
      ];
      
      let idx = 0;
      for (const round of rounds) {
        for (let i = 1; i <= round.count; i++) {
           if (idx >= parts.length) break;
           const str = parts[idx];
           idx++;
           
           if (str === '_' || str === '') continue;
           
           const matchId = round.prefix === 'FINAL' ? 'FINAL' : `${round.prefix}${i}`;
           
           const p = str.split(':');
           const homeGoals = parseInt(p[0]);
           const awayGoals = parseInt(p[1]);
           
           if (isNaN(homeGoals) || isNaN(awayGoals)) continue;
           
           const result: MatchResult & { winner?: string } = { homeGoals, awayGoals };
           
           if (p[2]) {
             result.isPenalty = true;
             result.penaltyWinner = p[2] === 'pH' ? 'home' : 'away';
             // We don't set winner code here, logic derives it
           }
           
           matches[matchId] = result;
        }
      }
      
      return { matches };
    } catch (e) {
      console.error('Failed to deserialize knockout:', e);
      return null;
    }
  }
}

export class RouteStateManager {
  static buildUrl(basePath: string, ...codes: string[]): string {
    const validCodes = codes.filter(c => c && c.length > 0);
    if (validCodes.length === 0) return `/${basePath}`;
    return `/${basePath}/${validCodes.join('&')}`;
  }

  static parseUrl(pathname: string): { stage: string; codes: string[] } {
    const parts = pathname.split('/').filter(Boolean);
    const stage = parts[0] || 'qualifiers';
    const codes = parts[1]?.split('&') || [];
    return { stage, codes };
  }

  static getStateFromUrl(url: string): Partial<TournamentState> {
    const { codes } = this.parseUrl(url);
    const state: Partial<TournamentState> = {};

    if (codes[0]) {
      const q = StateSerializer.deserializeQualifiers(codes[0]);
      if (q) state.qualifiers = q;
      // Fallback to old format if new fails?
      else if (codes[0].startsWith('ey')) { // JSON usually starts with { which base64 might look like...
         // Actually LZString compressed JSON usually doesn't look like specific pattern easily detectable vs compressed CSV
         // But we can try-catch.
         const old = StateSerializer.deserialize(codes[0]);
         if (old) state.qualifiers = old;
      }
    }
    
    if (codes[1]) {
      const g = StateSerializer.deserializeGroups(codes[1]);
      if (g) state.groups = g;
      else {
         const old = StateSerializer.deserialize(codes[1]);
         if (old) state.groups = old;
      }
    }
    
    if (codes[2]) {
      const k = StateSerializer.deserializeKnockout(codes[2]);
      if (k) state.knockout = k;
      else {
         const old = StateSerializer.deserialize(codes[2]);
         if (old) state.knockout = old;
      }
    }

    return state;
  }
}
