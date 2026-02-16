import LZString from 'lz-string';
import { TournamentState, QualifiersState, GroupsState, KnockoutState } from '../types';

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

  static serializeQualifiers(qualifiers: QualifiersState): string {
    return this.serialize(qualifiers);
  }

  static serializeGroups(groups: GroupsState): string {
    return this.serialize(groups);
  }

  static serializeKnockout(knockout: KnockoutState): string {
    return this.serialize(knockout);
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
      state.qualifiers = StateSerializer.deserialize(codes[0]);
    }
    if (codes[1]) {
      state.groups = StateSerializer.deserialize(codes[1]);
    }
    if (codes[2]) {
      state.knockout = StateSerializer.deserialize(codes[2]);
    }

    return state;
  }
}
