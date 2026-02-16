import { Group, Match, GroupMember, Country, MatchResult } from '../types';
import { countries } from '../data/countries';

export const POINTS_WIN = 3;
export const POINTS_DRAW = 1;
export const POINTS_LOSS = 0;

export function generateGroupMatches(groupId: string, teams: string[]): Match[] {
  // Standard Round Robin for 4 teams (A, B, C, D)
  // Match 1: A vs B
  // Match 2: C vs D
  // Match 3: A vs C
  // Match 4: D vs B
  // Match 5: D vs A
  // Match 6: B vs C
  
  // Or FIFA style: 1v2, 3v4, 1v3, 4v2, 4v1, 2v3
  // Let's stick to a consistent order.
  
  if (teams.length !== 4) return [];
  
  const [t1, t2, t3, t4] = teams;
  
  return [
    { id: `${groupId}-1`, groupId, homeTeam: t1, awayTeam: t2, matchday: 1 },
    { id: `${groupId}-2`, groupId, homeTeam: t3, awayTeam: t4, matchday: 1 },
    { id: `${groupId}-3`, groupId, homeTeam: t1, awayTeam: t3, matchday: 2 },
    { id: `${groupId}-4`, groupId, homeTeam: t4, awayTeam: t2, matchday: 2 },
    { id: `${groupId}-5`, groupId, homeTeam: t4, awayTeam: t1, matchday: 3 },
    { id: `${groupId}-6`, groupId, homeTeam: t2, awayTeam: t3, matchday: 3 },
  ];
}

export function calculateGroupStandings(group: Group, allMatches: Record<string, MatchResult>): GroupMember[] {
  // Initialize members
  const members: Record<string, GroupMember> = {};
  group.teams.forEach(teamCode => {
    members[teamCode] = {
      groupId: group.id,
      countryCode: teamCode,
      position: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  });

  // Process matches
  group.matches.forEach(match => {
    const result = allMatches[match.id];
    if (result && result.homeGoals !== undefined && result.awayGoals !== undefined) {
      const home = members[match.homeTeam];
      const away = members[match.awayTeam];

      if (home && away) {
        home.goalsFor += result.homeGoals;
        home.goalsAgainst += result.awayGoals;
        home.goalDifference = home.goalsFor - home.goalsAgainst;

        away.goalsFor += result.awayGoals;
        away.goalsAgainst += result.homeGoals;
        away.goalDifference = away.goalsFor - away.goalsAgainst;

        if (result.homeGoals > result.awayGoals) {
          home.wins++;
          home.points += POINTS_WIN;
          away.losses++;
          away.points += POINTS_LOSS;
        } else if (result.homeGoals < result.awayGoals) {
          away.wins++;
          away.points += POINTS_WIN;
          home.losses++;
          home.points += POINTS_LOSS;
        } else {
          home.draws++;
          home.points += POINTS_DRAW;
          away.draws++;
          away.points += POINTS_DRAW;
        }
      }
    }
  });

  // Convert to array and sort
  let standings = Object.values(members);
  
  // Sort by points first to group ties
  standings.sort((a, b) => b.points - a.points);

  // Apply tiebreakers
  standings = resolveTies(standings, group.matches, allMatches);

  // Assign positions
  standings.forEach((member, index) => {
    member.position = index + 1;
  });

  return standings;
}

function resolveTies(members: GroupMember[], groupMatches: Match[], allMatches: Record<string, MatchResult>): GroupMember[] {
  return members.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;

    // 2. Head-to-head points
    // Simplified version without mini-league
    const match = groupMatches.find(m => 
      (m.homeTeam === a.countryCode && m.awayTeam === b.countryCode) || 
      (m.homeTeam === b.countryCode && m.awayTeam === a.countryCode)
    );
    
    if (match) {
        const result = allMatches[match.id];
        if (result && result.homeGoals !== undefined && result.awayGoals !== undefined) {
             let pointsA = 0;
             let pointsB = 0;
             let gdA = 0;
             let gdB = 0;
             
             const aIsHome = match.homeTeam === a.countryCode;
             const goalsA = aIsHome ? result.homeGoals : result.awayGoals;
             const goalsB = aIsHome ? result.awayGoals : result.homeGoals;
             
             if (goalsA > goalsB) pointsA = 3;
             else if (goalsB > goalsA) pointsB = 3;
             else { pointsA = 1; pointsB = 1; }
             
             gdA = goalsA - goalsB;
             gdB = goalsB - goalsA;
             
             if (pointsA !== pointsB) return pointsB - pointsA;
             if (gdA !== gdB) return gdB - gdA;
             if (goalsA !== goalsB) return goalsB - goalsA;
        }
    }

    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;

    const countryA = countries[a.countryCode];
    const countryB = countries[b.countryCode];
    if (countryA.fairPlay !== countryB.fairPlay) return countryB.fairPlay - countryA.fairPlay;
    return countryA.fifaRanking - countryB.fifaRanking;
  });
}

export function compareThirdPlace(a: GroupMember, b: GroupMember): number {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
    
    const countryA = countries[a.countryCode];
    const countryB = countries[b.countryCode];
    if (countryA.fairPlay !== countryB.fairPlay) return countryB.fairPlay - countryA.fairPlay;
    return countryA.fifaRanking - countryB.fifaRanking;
}

export function getQualifiedTeams(groups: Group[], allMatches: Record<string, MatchResult>) {
  const groupWinners: Record<string, GroupMember> = {};
  const groupRunnersUp: Record<string, GroupMember> = {};
  const thirdPlaces: GroupMember[] = [];

  groups.forEach(group => {
    const standings = calculateGroupStandings(group, allMatches);
    if (standings.length >= 3) {
      groupWinners[group.id] = standings[0];
      groupRunnersUp[group.id] = standings[1];
      thirdPlaces.push(standings[2]);
    }
  });

  // Sort third places
  thirdPlaces.sort(compareThirdPlace);
  
  // Take top 8
  const bestThirds = thirdPlaces.slice(0, 8);
  
  return {
    groupWinners,
    groupRunnersUp,
    bestThirds
  };
}
