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

  const handleMatchUpdate = (matchId: string, homeGoals: number | undefined, awayGoals: number | undefined) => {
    setGroupMatch(matchId, {
      homeGoals,
      awayGoals
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 text-white">
        <h3 className="font-bold text-lg">{name}</h3>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
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
                <tr key={member.countryCode} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className={`px-3 py-2 text-center font-medium ${member.position <= 2 ? 'text-green-600' : (member.position <= 3 ? 'text-yellow-600' : 'text-gray-500')}`}>
                    {member.position}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <FlagIcon code={country.flag} size="sm" />
                      <span className="font-medium text-gray-800 truncate max-w-[100px] sm:max-w-none">
                        {country.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-gray-600">
                    {member.wins + member.draws + member.losses}
                  </td>
                  <td className="px-2 py-2 text-center text-gray-600">
                    {member.goalDifference > 0 ? `+${member.goalDifference}` : member.goalDifference}
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-gray-900">
                    {member.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matches */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex-1">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Partidos</h4>
        <div className="space-y-2">
          {groupData.matches.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              result={groups.matches[match.id]}
              onUpdate={(h, a) => handleMatchUpdate(match.id, h, a)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
