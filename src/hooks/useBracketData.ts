import { useMemo } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { getQualifiedTeams } from '../utils/calculations';
import { getKnockoutMatchups, generateBracket } from '../utils/knockoutLogic';
import { buildGroupsWithTeams } from '../utils/groupResolution';
import { KnockoutMatch } from '../types';

export const useBracketData = () => {
  const { qualifiers, groups, knockout } = useTournamentStore();

  const bracketData = useMemo(() => {
    const groupsWithTeams = buildGroupsWithTeams(qualifiers);

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
            
            // Derive winner based on current teams and stored scores
            if (storedResult.homeGoals !== undefined && storedResult.awayGoals !== undefined) {
                if (storedResult.homeGoals > storedResult.awayGoals) {
                    match.winner = match.homeTeam || undefined;
                } else if (storedResult.awayGoals > storedResult.homeGoals) {
                    match.winner = match.awayTeam || undefined;
                } else if (storedResult.isPenalty && storedResult.penaltyWinner) {
                    match.winner = storedResult.penaltyWinner === 'home' ? (match.homeTeam || undefined) : (match.awayTeam || undefined);
                }
            } else if (storedResult.winner) {
                if (storedResult.winner === match.homeTeam || storedResult.winner === match.awayTeam) {
                    match.winner = storedResult.winner;
                } else {
                    match.winner = undefined;
                }
            }
            
            const loser = match.winner === match.homeTeam ? (match.awayTeam || undefined) : match.winner === match.awayTeam ? (match.homeTeam || undefined) : undefined;

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

            // Propagate loser to the third-place match when applicable
            if (loser && match.loserNextMatchId) {
                const loserNextMatch = matchMap.get(match.loserNextMatchId);
                if (loserNextMatch) {
                    if (match.loserNextMatchSlot === 'home') {
                        loserNextMatch.homeTeam = loser;
                    } else if (match.loserNextMatchSlot === 'away') {
                        loserNextMatch.awayTeam = loser;
                    }
                }
            }
        }
    });

    return fullBracket;
  }, [qualifiers, groups.matches, knockout.matches]);

  return bracketData;
};
