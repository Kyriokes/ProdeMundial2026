import React, { useMemo } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { initialGroups } from '../data/groups';
import { calculateGroupStandings, compareThirdPlace, generateGroupMatches } from '../utils/calculations';
import { countries } from '../data/countries';
import { FlagIcon } from './FlagIcon';
import { GroupMember } from '../types';

export const ThirdPlaceTable: React.FC = () => {
    const { groups, qualifiers } = useTournamentStore();

    const thirdPlaces = useMemo(() => {
        const thirds: Array<GroupMember & { groupName: string }> = [];

        initialGroups.forEach(group => {
             // Resolve teams (handling placeholders if any, similar to GroupsPage)
             const resolvedTeams = group.teams.map(teamCode => {
                if (teamCode === 'pathA') return qualifiers.uefaPaths.pathA;
                if (teamCode === 'pathB') return qualifiers.uefaPaths.pathB;
                if (teamCode === 'pathC') return qualifiers.uefaPaths.pathC;
                if (teamCode === 'pathD') return qualifiers.uefaPaths.pathD;
                if (teamCode === 'keyA') return qualifiers.intercontinentalKeys.keyA;
                if (teamCode === 'keyB') return qualifiers.intercontinentalKeys.keyB;
                return teamCode;
            });

            // Skip if any team is undefined
            if (resolvedTeams.some(t => !t)) return;

            const teams = resolvedTeams as string[];
            const matches = generateGroupMatches(group.id, teams);
            
            // Construct a Group object that satisfies the interface required by calculateGroupStandings
            const groupWithMatches = { 
                ...group, 
                teams,
                matches,
                members: {} // Placeholder, not used by calculateGroupStandings for input
            };
            
            const standings = calculateGroupStandings(groupWithMatches, groups.matches);
            
            if (standings.length >= 3) {
                thirds.push({
                    ...standings[2],
                    groupName: group.name
                });
            }
        });

        return thirds.sort(compareThirdPlace);
    }, [groups.matches, qualifiers]);

    if (thirdPlaces.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Tabla de Terceros</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ordenado por: Puntos {'>'} Diferencia de Gol {'>'} Goles a Favor {'>'} Fair Play {'>'} Ranking FIFA
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3 text-center w-10">#</th>
                            <th className="px-4 py-3">Equipo</th>
                            <th className="px-4 py-3 text-center">Grp</th>
                            <th className="px-4 py-3 text-center font-bold">Pts</th>
                            <th className="px-4 py-3 text-center">DG</th>
                            <th className="px-4 py-3 text-center">GF</th>
                            <th className="px-4 py-3 text-center">FP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {thirdPlaces.map((team, index) => {
                            const country = countries[team.countryCode];
                            if (!country) return null; // Safety check
                            
                            const isQualified = index < 8; // Top 8 advance
                            return (
                                <tr 
                                    key={team.countryCode} 
                                    className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${isQualified ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                                >
                                    <td className="px-4 py-3 text-center text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <FlagIcon code={country.flag} size="sm" />
                                        <span className="hidden sm:inline">{country.name}</span>
                                        <span className="sm:hidden">{country.code}</span>
                                        {isQualified && <span className="text-xs text-green-600 ml-1 font-bold">✓</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-500">{team.groupName.replace('Grupo ', '')}</td>
                                    <td className="px-4 py-3 text-center font-bold">{team.points}</td>
                                    <td className="px-4 py-3 text-center">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                                    <td className="px-4 py-3 text-center">{team.goalsFor}</td>
                                    <td className="px-4 py-3 text-center text-xs">{team.fairPlayPoints}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
