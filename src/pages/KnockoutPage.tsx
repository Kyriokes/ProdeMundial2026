import React, { useMemo } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { initialGroups } from '../data/groups';
import { countries } from '../data/countries';
import { generateGroupMatches, getQualifiedTeams } from '../utils/calculations';
import { getKnockoutMatchups, generateBracket } from '../utils/knockoutLogic';
import { KnockoutMatchCard } from '../components/KnockoutMatchCard';
import { MatchResult, KnockoutMatch } from '../types';
import { useNavigate } from 'react-router-dom';
import { FlagIcon } from '../components/FlagIcon';

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

  // Group matches by round
  const rounds = {
      roundOf32: bracketData.filter(m => m.round === 'roundOf32'),
      roundOf16: bracketData.filter(m => m.round === 'roundOf16'),
      quarterFinals: bracketData.filter(m => m.round === 'quarterFinals'),
      semiFinals: bracketData.filter(m => m.round === 'semiFinals'),
      final: bracketData.filter(m => m.round === 'final')
  };

  // Split into Left and Right
  const leftSide = {
      r32: rounds.roundOf32.slice(0, 8),
      r16: rounds.roundOf16.slice(0, 4),
      qf: rounds.quarterFinals.slice(0, 2),
      sf: rounds.semiFinals[0]
  };

  const rightSide = {
      r32: rounds.roundOf32.slice(8, 16),
      r16: rounds.roundOf16.slice(4, 8),
      qf: rounds.quarterFinals.slice(2, 4),
      sf: rounds.semiFinals[1]
  };

  const finalMatch = rounds.final[0];
  const championCode = finalMatch?.winner;
  const champion = championCode ? countries[championCode] : null;

  const renderColumn = (matches: KnockoutMatch[], title: string) => (
      <div className="flex flex-col h-full px-1 items-center">
          <div className="h-10 flex items-center justify-center w-full">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">{title}</h3>
          </div>
          <div className="flex-1 flex flex-col justify-around py-2">
              {matches.map(m => (
                  <KnockoutMatchCard key={m.id} match={m} onUpdate={(r) => handleUpdate(m.id, r)} />
              ))}
          </div>
      </div>
  );

  return (
    <div className="h-screen bg-gray-50 overflow-x-auto overflow-y-hidden flex flex-col">
      <div className="flex-none p-4">
          <h1 className="text-2xl font-bold text-center text-gray-800">Fase Eliminatoria</h1>
      </div>
      
      <div className="flex-1 min-w-max px-4 pb-4 flex justify-center items-stretch">
            {/* LEFT SIDE */}
            <div className="flex">
                {renderColumn(leftSide.r32, '16avos')}
                {renderColumn(leftSide.r16, '8avos')}
                {renderColumn(leftSide.qf, 'Cuartos')}
                
                {/* Left Semi */}
                <div className="flex flex-col h-full px-1 items-center">
                     <div className="h-10 flex items-center justify-center w-full">
                        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Semifinal</h3>
                     </div>
                     <div className="flex-1 flex flex-col justify-around py-2">
                         {leftSide.sf && (
                             <KnockoutMatchCard match={leftSide.sf} onUpdate={(r) => handleUpdate(leftSide.sf.id, r)} />
                         )}
                     </div>
                </div>
            </div>

            {/* CENTER - FINAL & CHAMPION */}
            <div className="flex flex-col h-full px-4 mx-2 border-l border-r border-gray-200 bg-white/50 rounded-xl min-w-[300px]">
                <div className="h-10 flex items-center justify-center w-full">
                    <h3 className="font-bold text-blue-900 text-lg uppercase tracking-wider">Gran Final</h3>
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center">
                    {finalMatch && (
                        <div className="transform scale-110 mb-8 shadow-xl rounded-lg">
                             <KnockoutMatchCard match={finalMatch} onUpdate={(r) => handleUpdate(finalMatch.id, r)} />
                        </div>
                    )}
                    
                    {champion ? (
                        <div className="text-center animate-fade-in-up">
                            <div className="text-4xl mb-2 drop-shadow-lg">🏆</div>
                            <h2 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-1">Campeón</h2>
                            <div className="flex flex-col items-center">
                                 <div className="text-6xl mb-2 filter drop-shadow-md">
                                    <FlagIcon code={champion.flag} />
                                 </div>
                                 <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                                    {champion.name}
                                 </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center opacity-30">
                            <div className="text-4xl mb-2">🏆</div>
                            <h2 className="text-lg font-bold">Por definir</h2>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-row-reverse">
                {renderColumn(rightSide.r32, '16avos')}
                {renderColumn(rightSide.r16, '8avos')}
                {renderColumn(rightSide.qf, 'Cuartos')}
                
                {/* Right Semi */}
                <div className="flex flex-col h-full px-1 items-center">
                     <div className="h-10 flex items-center justify-center w-full">
                        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-tight">Semifinal</h3>
                     </div>
                     <div className="flex-1 flex flex-col justify-around py-2">
                         {rightSide.sf && (
                             <KnockoutMatchCard match={rightSide.sf} onUpdate={(r) => handleUpdate(rightSide.sf.id, r)} />
                         )}
                     </div>
                </div>
            </div>
      </div>
    </div>
  );
};
