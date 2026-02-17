export interface Country {
  code: string;
  name: string;
  flag: string; // ISO 3166-1 alpha-2 code for flag-icons
  fifaRanking: number;
  fairPlay: number;
}

export interface GroupMember {
  groupId: string;
  countryCode: string;
  position: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  wins: number;
  draws: number;
  losses: number;
  fairPlayPoints: number;
}

export interface MatchResult {
  homeGoals: number | undefined;
  awayGoals: number | undefined;
  isPenalty?: boolean;
  penaltyWinner?: string; // 'home' | 'away'
  homeYellow?: number;
  homeDoubleYellow?: number;
  homeDirectRed?: number;
  awayYellow?: number;
  awayDoubleYellow?: number;
  awayDirectRed?: number;
}

export interface Match {
  id: string;
  groupId: string;
  homeTeam: string; // country code
  awayTeam: string; // country code
  matchday: number;
  result?: MatchResult;
}

export interface Group {
  id: string;
  name: string;
  teams: string[]; // country codes
  matches: Match[];
  members: Record<string, GroupMember>;
}

export interface KnockoutMatch {
  id: string;
  round: 'roundOf32' | 'roundOf16' | 'quarterFinals' | 'semiFinals' | 'final' | 'thirdPlace';
  homeTeam: string | null; // country code or null if not yet determined
  awayTeam: string | null; // country code or null if not yet determined
  nextMatchId?: string;
  nextMatchSlot?: 'home' | 'away';
  result?: MatchResult;
  winner?: string; // country code
}

export interface QualifiersState {
  uefaPaths: Record<string, string>; // pathId -> countryCode
  intercontinentalKeys: Record<string, string>; // keyId -> countryCode
}

export interface GroupsState {
  matches: Record<string, MatchResult>; // matchId -> result
}

export interface KnockoutState {
  matches: Record<string, MatchResult & { winner?: string }>; // matchId -> result
}

export interface TournamentState {
  qualifiers: QualifiersState;
  groups: GroupsState;
  knockout: KnockoutState;
}

export type QualifierOption = {
  id: string;
  name: string;
  teams: string[]; // country codes
}
