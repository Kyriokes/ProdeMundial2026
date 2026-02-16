import React, { useMemo } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { initialGroups } from '../data/groups';
import { generateGroupMatches, getQualifiedTeams } from '../utils/calculations';
import { getKnockoutMatchups, generateBracket } from '../utils/knockoutLogic';
import { KnockoutMatchCard } from '../components/KnockoutMatchCard';
import { MatchResult, KnockoutMatch } from '../types';
import { useNavigate } from 'react-router-dom';

export const KnockoutPage: React.FC = () => {
  const { qualifiers, groups, knockout, setKnockoutMatch } = useTournamentStore();
  const navigate = useNavigate();

  // 1. Reconstruct group stage state to determine qualifiers
  const bracketData = useMemo(() => {
    // Reconstruct groups with teams
    const groupsWithTeams = initialGroups.map(group => {
      const resolvedTeams = group.teams.map(teamCode => {
        if (teamCode === 'pathA') return qualifiers.uefaPaths.pathA;
        if (teamCode === 'pathB') return qualifiers.uefaPaths.pathB;
        if (teamCode === 'pathC') return qualifiers.uefaPaths.pathC;
        if (teamCode === 'pathD') return qualifiers.uefaPaths.pathD;
        if (teamCode === 'keyA') return qualifiers.intercontinentalKeys.keyA;
        if (teamCode === 'keyB') return qualifiers.intercontinentalKeys.keyB;
        return teamCode;
      });
      
      // Reconstruct matches
      const matches = generateGroupMatches(group.id, resolvedTeams as string[]);
      return { ...group, teams: resolvedTeams as string[], matches, members: {} };
    });

    // Check if we have enough data (just basic check)
    if (groupsWithTeams.some(g => g.teams.some(t => !t))) return [];

    // Get qualified teams
    const { groupWinners, groupRunnersUp, bestThirds } = getQualifiedTeams(groupsWithTeams, groups.matches);

    // Get R32 matchups
    const r32 = getKnockoutMatchups(groupWinners, groupRunnersUp, bestThirds);
    
    // Generate full bracket structure
    const fullBracket = generateBracket(r32);

    // Propagate winners
    // We iterate through the bracket (which is topologically sorted by round)
    // and update next matches.
    
    // Create a map for quick access
    const matchMap = new Map<string, KnockoutMatch>();
    fullBracket.forEach(m => matchMap.set(m.id, m));

    fullBracket.forEach(match => {
        // Apply stored result
        const storedResult = knockout.matches[match.id];
        if (storedResult) {
            match.result = storedResult;
            match.winner = storedResult.winner;
            
            // Propagate to next match
            if (match.winner && match.nextMatchId) {
                const nextMatch = matchMap.get(match.nextMatchId);
                if (nextMatch) {
                    if (match.nextMatchSlot === 'home') {
                        nextMatch.homeTeam = match.winner;
                    } else if (match.nextMatchSlot === 'away') {
                        nextMatch.awayTeam = match.winner;
                    }
                }
            }
        }
    });

    return fullBracket;
  }, [qualifiers, groups.matches, knockout.matches]);

  if (bracketData.length === 0) {
      return <div className="p-8 text-center">Cargando o faltan datos...</div>;
  }

  const handleUpdate = (matchId: string, result: MatchResult & { winner?: string }) => {
    setKnockoutMatch(matchId, result);
  };

  // Group matches by round for rendering
  const rounds = {
      roundOf32: bracketData.filter(m => m.round === 'roundOf32'),
      roundOf16: bracketData.filter(m => m.round === 'roundOf16'),
      quarterFinals: bracketData.filter(m => m.round === 'quarterFinals'),
      semiFinals: bracketData.filter(m => m.round === 'semiFinals'),
      final: bracketData.filter(m => m.round === 'final')
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-auto">
      <div className="container mx-auto px-4 py-8 min-w-[1200px]">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Fase Eliminatoria</h1>
        
        <div className="flex justify-between space-x-8">
            {/* Round of 32 */}
            <div className="flex flex-col justify-around">
                <h3 className="text-center font-bold mb-4">Dieciseisavos</h3>
                {rounds.roundOf32.map(m => (
                    <KnockoutMatchCard key={m.id} match={m} onUpdate={(r) => handleUpdate(m.id, r)} />
                ))}
            </div>

            {/* Round of 16 */}
            <div className="flex flex-col justify-around">
                <h3 className="text-center font-bold mb-4">Octavos</h3>
                {rounds.roundOf16.map(m => (
                    <KnockoutMatchCard key={m.id} match={m} onUpdate={(r) => handleUpdate(m.id, r)} />
                ))}
            </div>

            {/* Quarter Finals */}
            <div className="flex flex-col justify-around">
                <h3 className="text-center font-bold mb-4">Cuartos</h3>
                {rounds.quarterFinals.map(m => (
                    <KnockoutMatchCard key={m.id} match={m} onUpdate={(r) => handleUpdate(m.id, r)} />
                ))}
            </div>

            {/* Semi Finals */}
            <div className="flex flex-col justify-around">
                <h3 className="text-center font-bold mb-4">Semifinales</h3>
                {rounds.semiFinals.map(m => (
                    <KnockoutMatchCard key={m.id} match={m} onUpdate={(r) => handleUpdate(m.id, r)} />
                ))}
            </div>

            {/* Final */}
            <div className="flex flex-col justify-around">
                <h3 className="text-center font-bold mb-4">Final</h3>
                {rounds.final.map(m => (
                    <KnockoutMatchCard key={m.id} match={m} onUpdate={(r) => handleUpdate(m.id, r)} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
