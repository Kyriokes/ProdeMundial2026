import React, { useMemo } from 'react';
import { initialGroups } from '../data/groups';
import { GroupCard } from '../components/GroupCard';
import { useTournamentStore } from '../store/useTournamentStore';
import { useNavigate } from 'react-router-dom';

export const GroupsPage: React.FC = () => {
  const { qualifiers, groups } = useTournamentStore();
  const navigate = useNavigate();

  const groupsWithTeams = useMemo(() => {
    return initialGroups.map(group => {
      const resolvedTeams = group.teams.map(teamCode => {
        if (teamCode === 'pathA') return qualifiers.uefaPaths.pathA;
        if (teamCode === 'pathB') return qualifiers.uefaPaths.pathB;
        if (teamCode === 'pathC') return qualifiers.uefaPaths.pathC;
        if (teamCode === 'pathD') return qualifiers.uefaPaths.pathD;
        if (teamCode === 'keyA') return qualifiers.intercontinentalKeys.keyA;
        if (teamCode === 'keyB') return qualifiers.intercontinentalKeys.keyB;
        return teamCode;
      });
      return { ...group, teams: resolvedTeams };
    });
  }, [qualifiers]);

  // Check if all qualifiers are selected
  // If not, we might have undefined teams.
  // We should redirect to qualifiers if data is missing?
  // Or just show loading/placeholder?
  // The route sync should handle this, but if user direct links to /groups without qualifiers param, state is empty.
  // And if state is empty, teams will be undefined.
  
  const isMissingQualifiers = groupsWithTeams.some(g => g.teams.some(t => !t));

  if (isMissingQualifiers) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Faltan datos de clasificación</h2>
        <p className="mb-4">Por favor completa la fase de clasificación primero.</p>
        <button 
          onClick={() => navigate('/qualifiers')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Ir a Clasificación
        </button>
      </div>
    );
  }

  // Check if all matches are played to enable "Continue"
  // We need to generate all matches for all groups and check if they have results.
  // This is a bit heavy, but we can do it.
  
  const allMatchesPlayed = groupsWithTeams.every(group => {
     // We need to know the number of matches. 4 teams -> 6 matches.
     // We can just check if we have 6 results per group in the store?
     // No, the store keys are globally unique "GROUPID-MATCHNUM".
     // We can iterate 1..6 for each group.
     for (let i = 1; i <= 6; i++) {
       const matchId = `${group.id}-${i}`;
       const result = groups.matches[matchId];
       if (!result || result.homeGoals === undefined || result.awayGoals === undefined) {
         return false;
       }
     }
     return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Fase de Grupos</h1>
      <p className="text-center text-gray-600 mb-8">Ingresa los resultados de todos los partidos.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
        {groupsWithTeams.map(group => (
          <GroupCard
            key={group.id}
            id={group.id}
            name={group.name}
            teams={group.teams as string[]}
          />
        ))}
      </div>
      
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
        >
          Continuar a Fase Eliminatoria
        </button>
      </div>
    </div>
  );
};
