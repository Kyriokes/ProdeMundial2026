import { Group, Match, GroupMember, Country, MatchResult } from '../types';
import { countries } from '../data/countries';

export const POINTS_WIN = 3;
export const POINTS_DRAW = 1;
export const POINTS_LOSS = 0;

type MiniStanding = {
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

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
      losses: 0,
      fairPlayPoints: 0
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

        // Fair Play Calculation
        // Yellow: -1, Double Yellow: -3, Direct Red: -4
        // Yellow + Direct Red: -5 (Handled by inputs if user enters both)
        home.fairPlayPoints += (result.homeYellow || 0) * -1;
        home.fairPlayPoints += (result.homeDoubleYellow || 0) * -3;
        home.fairPlayPoints += (result.homeDirectRed || 0) * -4;

        away.fairPlayPoints += (result.awayYellow || 0) * -1;
        away.fairPlayPoints += (result.awayDoubleYellow || 0) * -3;
        away.fairPlayPoints += (result.awayDirectRed || 0) * -4;

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
  const membersByCode = Object.fromEntries(
    members.map(member => [member.countryCode, member])
  ) as Record<string, GroupMember>;

  const sortedByPoints = [...members].sort((a, b) => b.points - a.points);
  const resolved: GroupMember[] = [];

  for (let i = 0; i < sortedByPoints.length;) {
    const currentPoints = sortedByPoints[i].points;
    const tiedGroup: GroupMember[] = [];

    while (i < sortedByPoints.length && sortedByPoints[i].points === currentPoints) {
      tiedGroup.push(sortedByPoints[i]);
      i++;
    }

    if (tiedGroup.length === 1) {
      resolved.push(tiedGroup[0]);
      continue;
    }

    const tiedCodes = tiedGroup.map(member => member.countryCode);
    const headToHeadTiers = resolveHeadToHeadTiers(tiedCodes, groupMatches, allMatches);
    const finalCodes = applyGlobalCriteria(headToHeadTiers, membersByCode);
    resolved.push(...finalCodes.map(code => membersByCode[code]));
  }

  return resolved;
}

function resolveHeadToHeadTiers(
  teamCodes: string[],
  groupMatches: Match[],
  allMatches: Record<string, MatchResult>
): string[][] {
  if (teamCodes.length <= 1) {
    return [teamCodes];
  }

  const miniStandings = buildMiniStandings(teamCodes, groupMatches, allMatches);
  const orderedCodes = [...teamCodes].sort((a, b) => {
    const standingA = miniStandings[a];
    const standingB = miniStandings[b];

    if (standingA.points !== standingB.points) return standingB.points - standingA.points;
    if (standingA.goalDifference !== standingB.goalDifference) return standingB.goalDifference - standingA.goalDifference;
    if (standingA.goalsFor !== standingB.goalsFor) return standingB.goalsFor - standingA.goalsFor;
    return a.localeCompare(b);
  });

  const tiers = splitByEquality(orderedCodes, code => {
    const standing = miniStandings[code];
    return `${standing.points}|${standing.goalDifference}|${standing.goalsFor}`;
  });

  if (tiers.length === 1) {
    return tiers;
  }

  return tiers.flatMap(tier => {
    if (tier.length <= 1) return [tier];
    return resolveHeadToHeadTiers(tier, groupMatches, allMatches);
  });
}

function buildMiniStandings(
  teamCodes: string[],
  groupMatches: Match[],
  allMatches: Record<string, MatchResult>
): Record<string, MiniStanding> {
  const codeSet = new Set(teamCodes);
  const standings: Record<string, MiniStanding> = Object.fromEntries(
    teamCodes.map(code => [code, { points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 }])
  ) as Record<string, MiniStanding>;

  groupMatches.forEach(match => {
    if (!codeSet.has(match.homeTeam) || !codeSet.has(match.awayTeam)) return;

    const result = allMatches[match.id];
    if (!result || result.homeGoals === undefined || result.awayGoals === undefined) return;

    const home = standings[match.homeTeam];
    const away = standings[match.awayTeam];

    home.goalsFor += result.homeGoals;
    home.goalsAgainst += result.awayGoals;
    home.goalDifference = home.goalsFor - home.goalsAgainst;

    away.goalsFor += result.awayGoals;
    away.goalsAgainst += result.homeGoals;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    if (result.homeGoals > result.awayGoals) {
      home.points += POINTS_WIN;
    } else if (result.homeGoals < result.awayGoals) {
      away.points += POINTS_WIN;
    } else {
      home.points += POINTS_DRAW;
      away.points += POINTS_DRAW;
    }
  });

  return standings;
}

function applyGlobalCriteria(tiers: string[][], membersByCode: Record<string, GroupMember>): string[] {
  const criteria: Array<{
    value: (code: string) => number;
    descending: boolean;
  }> = [
    {
      value: code => membersByCode[code].goalDifference,
      descending: true
    },
    {
      value: code => membersByCode[code].goalsFor,
      descending: true
    },
    {
      value: code => membersByCode[code].fairPlayPoints,
      descending: true
    },
    {
      value: code => getFifaRanking(code),
      descending: false
    }
  ];

  let currentTiers = tiers;

  criteria.forEach(({ value, descending }) => {
    currentTiers = currentTiers.flatMap(tier => {
      if (tier.length <= 1) return [tier];

      const sortedTier = [...tier].sort((a, b) => {
        const diff = value(a) - value(b);
        if (diff === 0) return a.localeCompare(b);
        return descending ? -diff : diff;
      });

      return splitByEquality(sortedTier, value);
    });
  });

  return currentTiers.flatMap(tier => tier);
}

function splitByEquality<T>(items: T[], getKey: (item: T) => string | number): T[][] {
  if (items.length === 0) return [];

  const groups: T[][] = [];
  let currentGroup: T[] = [items[0]];
  let currentKey = getKey(items[0]);

  for (let i = 1; i < items.length; i++) {
    const key = getKey(items[i]);
    if (key === currentKey) {
      currentGroup.push(items[i]);
      continue;
    }

    groups.push(currentGroup);
    currentGroup = [items[i]];
    currentKey = key;
  }

  groups.push(currentGroup);
  return groups;
}

function getFifaRanking(countryCode: string): number {
  const country = countries[countryCode];
  return country ? country.fifaRanking : Number.MAX_SAFE_INTEGER;
}

export function compareThirdPlace(a: GroupMember, b: GroupMember): number {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
    
    const countryA = countries[a.countryCode];
    const countryB = countries[b.countryCode];

    // Safety check for missing country data
    if (!countryA || !countryB) return 0;

    if (a.fairPlayPoints !== b.fairPlayPoints) return b.fairPlayPoints - a.fairPlayPoints;
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
