import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGroupStandings, generateGroupMatches } from './calculations';
import type { Group, MatchResult } from '../types';

// Orden de los partidos según generateGroupMatches (teams = [t1, t2, t3, t4]):
//   1: t1-t2   2: t3-t4   3: t1-t3   4: t4-t2   5: t4-t1   6: t2-t3
type Score = [home: number, away: number, extra?: Partial<MatchResult>];

function standingsOrder(teams: string[], scores: Score[]): string[] {
  const groupId = 'X';
  const group: Group = {
    id: groupId,
    name: 'Grupo X',
    teams,
    matches: generateGroupMatches(groupId, teams),
    members: {},
  };
  const results: Record<string, MatchResult> = {};
  scores.forEach(([homeGoals, awayGoals, extra], i) => {
    results[`${groupId}-${i + 1}`] = { homeGoals, awayGoals, ...extra };
  });
  return calculateGroupStandings(group, results).map(member => member.countryCode);
}

// Ranking FIFA en src/data/countries.ts: ESP 1, ARG 2, FRA 3, ENG 4, POR 6, GER 10.
// Reglamento: Art. 13 (public/wc-2026-regulations.pdf).

test('el enfrentamiento directo desempata antes que la diferencia de gol general', () => {
  // POR y ESP terminan con 4 puntos. POR le ganó 1-0 a ESP, pero ESP tiene mejor
  // diferencia de gol general (+2 contra 0) y mejor ranking FIFA.
  const order = standingsOrder(['POR', 'ESP', 'ARG', 'GER'], [
    [1, 0], // POR-ESP
    [0, 0], // ARG-GER
    [0, 1], // POR-ARG
    [0, 3], // GER-ESP
    [0, 0], // GER-POR
    [1, 1], // ESP-ARG
  ]);
  assert.deepEqual(order, ['ARG', 'POR', 'ESP', 'GER']);
});

test('si el enfrentamiento directo queda igualado, desempata la diferencia de gol general', () => {
  // ESP y POR empatan 1-1 entre sí y terminan con 4 puntos. POR tiene mejor
  // diferencia de gol (+3 contra 0); ESP tiene mejor ranking FIFA.
  const order = standingsOrder(['ESP', 'POR', 'ARG', 'GER'], [
    [1, 1], // ESP-POR
    [2, 0], // ARG-GER
    [1, 0], // ESP-ARG
    [0, 4], // GER-POR
    [1, 0], // GER-ESP
    [0, 1], // POR-ARG
  ]);
  assert.deepEqual(order, ['ARG', 'POR', 'ESP', 'GER']);
});

test('tras agotar el enfrentamiento directo, los criterios generales no lo vuelven a aplicar', () => {
  // POR, ARG y FRA ganan 2 partidos y pierden 1 en un ciclo (FRA>POR, POR>ARG,
  // ARG>FRA): el mini-torneo entre ellos queda igualado. FRA se separa por
  // diferencia de gol general. POR y ARG quedan iguales en diferencia de gol y
  // goles a favor; POR le ganó a ARG, pero no se reaplica el enfrentamiento
  // directo y define el ranking FIFA (ARG 2, POR 6).
  const order = standingsOrder(['FRA', 'POR', 'ARG', 'GER'], [
    [1, 0], // FRA-POR
    [1, 0], // ARG-GER
    [0, 1], // FRA-ARG
    [0, 1], // GER-POR
    [0, 5], // GER-FRA
    [1, 0], // POR-ARG
  ]);
  assert.deepEqual(order, ['FRA', 'ARG', 'POR', 'GER']);
});

test('el fair play desempata antes que el ranking FIFA', () => {
  // Todos empatan 0-0 en todo. ESP (ranking 1) recibe una amarilla y queda último.
  const order = standingsOrder(['ENG', 'FRA', 'ARG', 'ESP'], [
    [0, 0],
    [0, 0, { awayYellow: 1 }], // ARG-ESP
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);
  assert.deepEqual(order, ['ARG', 'FRA', 'ENG', 'ESP']);
});

test('el ranking FIFA es el último recurso', () => {
  const order = standingsOrder(['ENG', 'FRA', 'ARG', 'ESP'], [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);
  assert.deepEqual(order, ['ESP', 'ARG', 'FRA', 'ENG']);
});
