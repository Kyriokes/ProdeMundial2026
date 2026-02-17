import React, { useMemo } from 'react';
import { Group, MatchResult } from '../types';
import { generateGroupMatches, calculateGroupStandings } from '../utils/calculations';
import { MatchRow } from './MatchRow';
import { FlagIcon } from './FlagIcon';
import { countries } from '../data/countries';
import { useTournamentStore } from '../store/useTournamentStore';

interface GroupCardProps {
  id: string;
  name: string;
  teams: string[];
}

export const GroupCard: React.FC<GroupCardProps> = ({ id, name, teams }) => {
  const { groups, setGroupMatch } = useTournamentStore();

  const groupData = useMemo(() => {
    const matches = generateGroupMatches(id, teams);
    return { id, name, teams, matches, members: {} } as Group;
  }, [id, name, teams]);

  const standings = useMemo(() => {
    return calculateGroupStandings(groupData, groups.matches);
  }, [groupData, groups.matches]);

  const handleMatchUpdate = (matchId: string, updates: Partial<MatchResult>) => {
    const currentResult = groups.matches[matchId] || { homeGoals: undefined, awayGoals: undefined };
    setGroupMatch(matchId, {
      ...currentResult,
      ...updates
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full transition-colors duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 text-white">
        <h3 className="font-bold text-lg">{name}</h3>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-800 dark:text-gray-200">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
            <tr>
              <th className="px-3 py-2 text-center w-8">#</th>
              <th className="px-3 py-2">Equipo</th>
              <th className="px-2 py-2 text-center" title="Partidos Jugados">PJ</th>
              <th className="px-2 py-2 text-center" title="Diferencia de Gol">DG</th>
              <th className="px-3 py-2 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((member) => {
              const country = countries[member.countryCode];
              if (!country) return null;
              
              return (
                <tr key={member.countryCode} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className={`px-3 py-2 text-center font-medium ${member.position <= 2 ? 'text-green-600 dark:text-green-400' : (member.position <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-500')}`}>
                    {member.position}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <FlagIcon code={country.flag} size="sm" />
                      <span className="font-medium truncate max-w-[100px] sm:max-w-none">
                        {country.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">
                    {member.wins + member.draws + member.losses}
                  </td>
                  <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">
                    {member.goalDifference > 0 ? `+${member.goalDifference}` : member.goalDifference}
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-gray-900 dark:text-white">
                    {member.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matches */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex-1 transition-colors">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">Partidos</h4>
        <div className="space-y-2">
          {groupData.matches.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              result={groups.matches[match.id]}
              onUpdate={(updates) => handleMatchUpdate(match.id, updates)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
