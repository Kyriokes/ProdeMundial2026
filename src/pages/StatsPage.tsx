import React, { useMemo } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { initialGroups } from '../data/groups';
import { countries } from '../data/countries';
import { useBracketData } from '../hooks/useBracketData';
import { FlagIcon } from '../components/FlagIcon';
import { generateGroupMatches } from '../utils/calculations';

interface TeamStats {
  code: string;
  name: string;
  group: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  stageReached: number; // Higher is better (e.g., 6 = Champion, 0 = Group)
  stageName: string;
}

const STAGE_VALUES = {
  CHAMPION: 7,
  RUNNER_UP: 6,
  SEMI_FINAL: 5, // Losers of Semis
  QUARTER_FINAL: 4, // Losers of QF
  ROUND_OF_16: 3, // Losers of R16
  ROUND_OF_32: 2, // Losers of R32
  GROUP_STAGE: 1,
};

export const StatsPage: React.FC = () => {
  const { qualifiers, groups: groupState } = useTournamentStore();
  const bracketData = useBracketData();

  if (!qualifiers || !groupState) {
      console.error('Missing qualifiers or groupState in StatsPage');
      return (
          <div className="p-8 text-center text-red-500">Error: No se pudo cargar la información del torneo.</div>
      );
  }

  const stats = useMemo(() => {
    // 1. Initialize stats for ALL valid teams found in initialGroups
    const teamStats: Record<string, TeamStats> = {};

    initialGroups.forEach(group => {
      group.teams.forEach(teamCode => {
        let resolvedCode = teamCode;
        // Try to resolve placeholders if possible, otherwise keep as is (to be safe)
        if (qualifiers.uefaPaths && qualifiers.intercontinentalKeys) {
            if (teamCode === 'pathA') resolvedCode = qualifiers.uefaPaths.pathA;
            else if (teamCode === 'pathB') resolvedCode = qualifiers.uefaPaths.pathB;
            else if (teamCode === 'pathC') resolvedCode = qualifiers.uefaPaths.pathC;
            else if (teamCode === 'pathD') resolvedCode = qualifiers.uefaPaths.pathD;
            else if (teamCode === 'keyA') resolvedCode = qualifiers.intercontinentalKeys.keyA;
            else if (teamCode === 'keyB') resolvedCode = qualifiers.intercontinentalKeys.keyB;
        }

        // Only add if we have a valid country code (not undefined, not empty)
        if (resolvedCode && countries[resolvedCode]) {
            teamStats[resolvedCode] = {
                code: resolvedCode,
                name: countries[resolvedCode].name,
                group: group.id,
                pj: 0,
                pg: 0,
                pe: 0,
                pp: 0,
                gf: 0,
                gc: 0,
                dg: 0,
                pts: 0,
                stageReached: STAGE_VALUES.GROUP_STAGE,
                stageName: 'Fase de Grupos'
            };
        }
      });
    });

    // If we have no teams, return empty array
    if (Object.keys(teamStats).length === 0) return [];

    // 2. Process Group Matches
    // Use try-catch to prevent crash on data error
    try {
        initialGroups.forEach(group => {
            const resolvedTeams = group.teams.map(teamCode => {
                if (teamCode === 'pathA') return qualifiers.uefaPaths?.pathA;
                if (teamCode === 'pathB') return qualifiers.uefaPaths?.pathB;
                if (teamCode === 'pathC') return qualifiers.uefaPaths?.pathC;
                if (teamCode === 'pathD') return qualifiers.uefaPaths?.pathD;
                if (teamCode === 'keyA') return qualifiers.intercontinentalKeys?.keyA;
                if (teamCode === 'keyB') return qualifiers.intercontinentalKeys?.keyB;
                return teamCode;
            });

            // Only process matches if we have 4 valid teams
            if (resolvedTeams.some(t => !t)) return;

            const matches = generateGroupMatches(group.id, resolvedTeams as string[]);
            
            matches.forEach(match => {
                const result = groupState.matches[match.id];
                if (result && result.homeGoals !== undefined && result.awayGoals !== undefined) {
                    const home = teamStats[match.homeTeam];
                    const away = teamStats[match.awayTeam];
                    
                    if (home && away) {
                        home.pj++;
                        away.pj++;
                        home.gf += result.homeGoals;
                        away.gf += result.awayGoals;
                        home.gc += result.awayGoals;
                        away.gc += result.homeGoals;
                        home.dg = home.gf - home.gc;
                        away.dg = away.gf - away.gc;

                        if (result.homeGoals > result.awayGoals) {
                            home.pg++;
                            home.pts += 3;
                            away.pp++;
                        } else if (result.awayGoals > result.homeGoals) {
                            away.pg++;
                            away.pts += 3;
                            home.pp++;
                        } else {
                            home.pe++;
                            home.pts += 1;
                            away.pe++;
                            away.pts += 1;
                        }
                    }
                }
            });
        });
    } catch (e) {
        console.error('Error calculating group stats:', e);
    }

    // 3. Process Knockout Matches
    // Use bracketData only if available
    if (bracketData && bracketData.length > 0) {
        bracketData.forEach(match => {
            // ... (rest of logic) ...
            // Simplified for brevity, assume bracketData is safe if length > 0
            
            let roundValue = STAGE_VALUES.GROUP_STAGE;
            let roundName = 'Fase de Grupos';

            if (match.round === 'roundOf32') { roundValue = STAGE_VALUES.ROUND_OF_32; roundName = '16avos de Final'; }
            else if (match.round === 'roundOf16') { roundValue = STAGE_VALUES.ROUND_OF_16; roundName = 'Octavos de Final'; }
            else if (match.round === 'quarterFinals') { roundValue = STAGE_VALUES.QUARTER_FINAL; roundName = 'Cuartos de Final'; }
            else if (match.round === 'semiFinals') { roundValue = STAGE_VALUES.SEMI_FINAL; roundName = 'Semifinal'; }
            else if (match.round === 'final') { roundValue = STAGE_VALUES.RUNNER_UP; roundName = 'Subcampeón'; }

            if (match.homeTeam && teamStats[match.homeTeam]) {
                if (roundValue > teamStats[match.homeTeam].stageReached) {
                    teamStats[match.homeTeam].stageReached = roundValue;
                    teamStats[match.homeTeam].stageName = roundName;
                }
            }
            if (match.awayTeam && teamStats[match.awayTeam]) {
                if (roundValue > teamStats[match.awayTeam].stageReached) {
                    teamStats[match.awayTeam].stageReached = roundValue;
                    teamStats[match.awayTeam].stageName = roundName;
                }
            }

            if (match.result && match.homeTeam && match.awayTeam && match.result.homeGoals !== undefined && match.result.awayGoals !== undefined) {
                 const home = teamStats[match.homeTeam];
                 const away = teamStats[match.awayTeam];
                 
                 if (home && away) {
                     home.pj++;
                     away.pj++;
                     home.gf += match.result.homeGoals;
                     away.gf += match.result.awayGoals;
                     home.gc += match.result.awayGoals;
                     away.gc += match.result.homeGoals;
                     home.dg = home.gf - home.gc;
                     away.dg = away.gf - away.gc;

                     if (match.result.homeGoals > match.result.awayGoals) {
                         home.pg++;
                         home.pts += 3;
                         away.pp++;
                     } else if (match.result.awayGoals > match.result.homeGoals) {
                         away.pg++;
                         away.pts += 3;
                         home.pp++;
                     } else {
                         home.pe++;
                         home.pts += 1;
                         away.pe++;
                         away.pts += 1;
                     }
                 }
            }
        });

        // Champion logic
        const finalMatch = bracketData.find(m => m.round === 'final');
        if (finalMatch && finalMatch.winner && teamStats[finalMatch.winner]) {
            teamStats[finalMatch.winner].stageReached = STAGE_VALUES.CHAMPION;
            teamStats[finalMatch.winner].stageName = 'Campeón';
        }
    }

    return Object.values(teamStats).sort((a, b) => {
        if (a.stageReached !== b.stageReached) return b.stageReached - a.stageReached;
        if (a.pts !== b.pts) return b.pts - a.pts;
        if (a.dg !== b.dg) return b.dg - a.dg;
        return b.gf - a.gf;
    });

  }, [groupState, bracketData, qualifiers]);

  if (stats.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Tabla General</h1>
        <p className="text-gray-600 dark:text-gray-400">
            No hay datos disponibles. 
            (Equipos inicializados: {Object.keys(countries).length}, 
            Grupos: {initialGroups.length})
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Tabla General</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-center w-12">Pos</th>
                <th className="px-4 py-3">Equipo</th>
                <th className="px-4 py-3 text-center" title="Puntos">Pts</th>
                <th className="px-4 py-3 text-center" title="Partidos Jugados">PJ</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell" title="Partidos Ganados">PG</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell" title="Partidos Empatados">PE</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell" title="Partidos Perdidos">PP</th>
                <th className="px-4 py-3 text-center hidden md:table-cell" title="Goles a Favor">GF</th>
                <th className="px-4 py-3 text-center hidden md:table-cell" title="Goles en Contra">GC</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell" title="Diferencia de Gol">Dif</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell" title="Rendimiento">Rend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.map((team, index) => {
                const efficiency = team.pj > 0 ? ((team.pts / (team.pj * 3)) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={team.code} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FlagIcon code={countries[team.code]?.flag} className="w-5 h-4 shadow-sm" />
                      <span className="truncate">{team.name}</span>
                      <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1 hidden xl:inline">
                        ({team.stageName})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">
                      {team.pts}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {team.pj}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600 dark:text-gray-400">
                      {team.pg}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600 dark:text-gray-400">
                      {team.pe}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600 dark:text-gray-400">
                      {team.pp}
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600 dark:text-gray-400">
                      {team.gf}
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600 dark:text-gray-400">
                      {team.gc}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell font-medium text-gray-700 dark:text-gray-300">
                      {team.dg > 0 ? `+${team.dg}` : team.dg}
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-500 dark:text-gray-400">
                      {efficiency}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
          * La tabla se ordena por: Instancia alcanzada, Puntos, Diferencia de Gol y Goles a Favor. Los partidos definidos por penales se consideran empates.
        </div>
      </div>
    </div>
  );
};
