import React, { useMemo } from 'react';
import { GroupCard } from '../components/GroupCard';
import { ThirdPlaceTable } from '../components/ThirdPlaceTable';
import { useTournamentStore } from '../store/useTournamentStore';
import { buildGroupsWithTeams } from '../utils/groupResolution';
import { useNavigate } from 'react-router-dom';

export const GroupsPage: React.FC = () => {
  const { qualifiers, groups } = useTournamentStore();
  const navigate = useNavigate();

  const groupsWithTeams = useMemo(() => buildGroupsWithTeams(qualifiers), [qualifiers]);

  // "Continue" is enabled once every match of every group has a result.
  const allMatchesPlayed = groupsWithTeams.every(group =>
    group.matches.every(match => {
      const result = groups.matches[match.id];
      return result && result.homeGoals !== undefined && result.awayGoals !== undefined;
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">Fase de Grupos</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Ingresa los resultados de todos los partidos.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
        {groupsWithTeams.map(group => (
          <GroupCard
            key={group.id}
            id={group.id}
            name={group.name}
            teams={group.teams}
          />
        ))}
      </div>
      
      <ThirdPlaceTable />

      <div className="flex justify-center mt-8 pb-12">
        <button
          onClick={() => navigate('/knockout')} // RouteSync will handle the URL params
          disabled={!allMatchesPlayed}
          className={`
            px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform
            ${allMatchesPlayed 
              ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >Continuar a Fase Eliminatoria</button>
      </div>
    </div>
  );
};
