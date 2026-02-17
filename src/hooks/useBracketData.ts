import { useMemo } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { initialGroups } from '../data/groups';
import { generateGroupMatches, getQualifiedTeams } from '../utils/calculations';
import { getKnockoutMatchups, generateBracket } from '../utils/knockoutLogic';
import { KnockoutMatch } from '../types';

export const useBracketData = () => {
  const { qualifiers, groups, knockout } = useTournamentStore();

  const bracketData = useMemo(() => {
    // Reconstruct groups with teams
    const groupsWithTeams = initialGroups.map(group => {
      const resolvedTeams = group.teams.map(teamCode => {
        if (!qualifiers?.uefaPaths || !qualifiers?.intercontinentalKeys) return teamCode; // Safety check
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
    // If we have incomplete qualifiers, we can still generate bracket data if we have SOME groups.
    // But for consistency, we only process valid teams.
    if (!groupsWithTeams || groupsWithTeams.length === 0) return [];

    // Filter out groups with incomplete teams to avoid errors, or just return empty bracket
    if (groupsWithTeams.some(g => g.teams.some(t => !t))) {
        // If incomplete, we can't calculate standings correctly -> no bracket
        return [];
    }

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
            
            // Derive winner if not explicitly stored (hydration case)
            if (!storedResult.winner) {
                 if (storedResult.homeGoals !== undefined && storedResult.awayGoals !== undefined) {
                    if (storedResult.homeGoals > storedResult.awayGoals) {
                        match.winner = match.homeTeam || undefined;
                    } else if (storedResult.awayGoals > storedResult.homeGoals) {
                        match.winner = match.awayTeam || undefined;
                    } else if (storedResult.isPenalty && storedResult.penaltyWinner) {
                        match.winner = storedResult.penaltyWinner === 'home' ? (match.homeTeam || undefined) : (match.awayTeam || undefined);
                    }
                 }
            } else {
                match.winner = storedResult.winner;
            }
            
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

  return bracketData;
};
