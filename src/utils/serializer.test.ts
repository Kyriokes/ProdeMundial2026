import { describe, it, expect } from 'vitest';
import LZString from 'lz-string';
import { StateSerializer } from './serializer';

const enc = (raw: string) => LZString.compressToEncodedURIComponent(raw);

describe('StateSerializer groups', () => {
  it('round-trips a result with cards', () => {
    const state = { matches: { 'A-1': { homeGoals: 2, awayGoals: 1, homeYellow: 1, awayDirectRed: 1 } } };
    const decoded = StateSerializer.deserializeGroups(StateSerializer.serializeGroups(state));
    expect(decoded?.matches['A-1']).toMatchObject({ homeGoals: 2, awayGoals: 1, homeYellow: 1, awayDirectRed: 1 });
  });

  it('rejects negative goals coming from the URL', () => {
    const decoded = StateSerializer.deserializeGroups(enc('-3:1'));
    expect(decoded?.matches['A-1']).toBeUndefined();
  });

  it('rejects absurdly large goals coming from the URL', () => {
    const decoded = StateSerializer.deserializeGroups(enc('1000:1'));
    expect(decoded?.matches['A-1']).toBeUndefined();
  });

  it('drops card data that is not numeric', () => {
    const decoded = StateSerializer.deserializeGroups(enc('2:1:a.b.c.d.e.f'));
    const result = decoded?.matches['A-1'];
    expect(result).toMatchObject({ homeGoals: 2, awayGoals: 1 });
    expect(result?.homeYellow).toBeUndefined();
    expect(result?.awayDirectRed).toBeUndefined();
  });

  it('drops negative card counts', () => {
    const decoded = StateSerializer.deserializeGroups(enc('2:1:-1.0.0.0.0.0'));
    expect(decoded?.matches['A-1']?.homeYellow).toBeUndefined();
  });
});

describe('StateSerializer knockout', () => {
  it('keeps the penalty marker and a known winner', () => {
    const decoded = StateSerializer.deserializeKnockout(enc('1:1:pH:ARG'));
    expect(decoded?.matches['M73']).toMatchObject({ homeGoals: 1, awayGoals: 1, isPenalty: true, penaltyWinner: 'home', winner: 'ARG' });
  });

  it('drops a winner that is not a known country code', () => {
    const decoded = StateSerializer.deserializeKnockout(enc('1:1:pH:XXX'));
    expect(decoded?.matches['M73']?.winner).toBeUndefined();
  });

  it('ignores a penalty marker when the score is not a draw', () => {
    const decoded = StateSerializer.deserializeKnockout(enc('2:1:pH'));
    expect(decoded?.matches['M73']?.isPenalty).toBeUndefined();
    expect(decoded?.matches['M73']?.penaltyWinner).toBeUndefined();
  });

  it('does not serialize a penalty marker when the score is not a draw', () => {
    const code = StateSerializer.serializeKnockout({
      matches: { M73: { homeGoals: 2, awayGoals: 1, isPenalty: true, penaltyWinner: 'home', winner: 'ARG' } },
    });
    expect(LZString.decompressFromEncodedURIComponent(code)).toBe('2:1:ARG');
  });

  it('rejects negative goals coming from the URL', () => {
    const decoded = StateSerializer.deserializeKnockout(enc('-1:0'));
    expect(decoded?.matches['M73']).toBeUndefined();
  });
});

describe('StateSerializer qualifiers', () => {
  it('accepts codes that belong to the corresponding path', () => {
    const decoded = StateSerializer.deserializeQualifiers(enc('ITA,UKR,SVK,DEN,JAM,BOL'));
    expect(decoded).toEqual({
      uefaPaths: { pathA: 'ITA', pathB: 'UKR', pathC: 'SVK', pathD: 'DEN' },
      intercontinentalKeys: { keyA: 'JAM', keyB: 'BOL' },
    });
  });

  it('rejects codes that do not belong to the path', () => {
    const decoded = StateSerializer.deserializeQualifiers(enc('ARG,SWE,TUR,CZE,COD,IRQ'));
    expect(decoded?.uefaPaths.pathA).toBe('');
    expect(decoded?.uefaPaths.pathB).toBe('SWE');
  });

  it('rejects a UEFA team placed in an intercontinental key', () => {
    const decoded = StateSerializer.deserializeQualifiers(enc('BIH,SWE,TUR,CZE,ITA,IRQ'));
    expect(decoded?.intercontinentalKeys.keyA).toBe('');
  });
});
