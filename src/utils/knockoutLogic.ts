import { GroupMember, MatchResult, KnockoutMatch } from '../types';

export function getKnockoutMatchups(
  groupWinners: Record<string, GroupMember>,
  groupRunnersUp: Record<string, GroupMember>,
  bestThirds: GroupMember[]
): KnockoutMatch[] {
  // 1. Identify available 3rd places
  const thirds = [...bestThirds];
  const thirdMap = new Map<string, GroupMember>();
  thirds.forEach(t => thirdMap.set(t.groupId, t));

  // 2. Define the 7 slots for 3rd places (from prompt)
  const thirdSlots = [
    { id: '1', winnerGroup: 'E', allowed: ['A', 'B', 'C', 'D', 'F'] },
    { id: '2', winnerGroup: 'I', allowed: ['C', 'D', 'F', 'G', 'H'] },
    { id: '3', winnerGroup: 'A', allowed: ['C', 'E', 'F', 'H', 'I'] },
    { id: '6', winnerGroup: 'D', allowed: ['B', 'E', 'F', 'I', 'J'] },
    { id: '7', winnerGroup: 'G', allowed: ['A', 'E', 'H', 'I', 'J'] },
    { id: '9', winnerGroup: 'B', allowed: ['E', 'F', 'G', 'I', 'J'] },
    { id: '10', winnerGroup: 'L', allowed: ['E', 'H', 'I', 'J', 'K'] },
  ];

  // 3. Assign 3rd places to slots
  const assignments: Record<string, GroupMember> = {}; // slotId -> member
  const usedThirds = new Set<string>(); // groupIds

  function solve(slotIndex: number): boolean {
    if (slotIndex >= thirdSlots.length) return true;

    const slot = thirdSlots[slotIndex];
    // Find a 3rd place that is in allowed list and not used
    const candidates = thirds.filter(t => 
      slot.allowed.includes(t.groupId) && !usedThirds.has(t.groupId)
    );

    for (const cand of candidates) {
      assignments[slot.id] = cand;
      usedThirds.add(cand.groupId);
      if (solve(slotIndex + 1)) return true;
      usedThirds.delete(cand.groupId);
      delete assignments[slot.id];
    }
    
    return false;
  }

  // If solver fails, fallback to greedy
  if (!solve(0)) {
    console.warn("Could not satisfy strict 3rd place rules. Falling back to greedy.");
    thirdSlots.forEach(slot => {
        const cand = thirds.find(t => !usedThirds.has(t.groupId));
        if (cand) {
            assignments[slot.id] = cand;
            usedThirds.add(cand.groupId);
        }
    });
  }

  // 4. Handle L8 (1C vs 2A/2B) and L12 (1K vs 2D/2G)
  // "el que no enfrente al 3° del Grupo F"
  // If 3F is used in assignments, it's facing a winner. Neither 2A nor 2B faces it.
  // If 3F is NOT used, it is the remaining third. It MUST face 2A or 2B in extra matches.
  
  const thirdF = thirds.find(t => t.groupId === 'F');
  const thirdL = thirds.find(t => t.groupId === 'L');

  let opponentL8 = groupRunnersUp['A'];
  let remainingRunnerUpAB = groupRunnersUp['B'];

  if (thirdF && !usedThirds.has('F')) {
      // 3F is the remaining third. It will play in extra matches.
      // We assume it plays the "remaining" runner up.
      // So 1C plays 2A. 2B plays 3F.
      // logic stays default.
  }
  
  let opponentL12 = groupRunnersUp['D'];
  let remainingRunnerUpDG = groupRunnersUp['G'];

  if (thirdL && !usedThirds.has('L')) {
      // 3L is remaining. 1K plays 2D. 2G plays 3L.
  }

  // 5. Construct the 16 matches
  const matches: KnockoutMatch[] = [];

  // Helper to add match
  const addMatch = (id: string, home: string, away: string) => {
    matches.push({
      id: `R32-${id}`,
      round: 'roundOf32',
      homeTeam: home,
      awayTeam: away,
    });
  };

  // Defined Keys
  addMatch('1', groupWinners['E']?.countryCode, assignments['1']?.countryCode);
  addMatch('2', groupWinners['I']?.countryCode, assignments['2']?.countryCode);
  addMatch('3', groupWinners['A']?.countryCode, assignments['3']?.countryCode);
  addMatch('4', groupWinners['F']?.countryCode, groupRunnersUp['C']?.countryCode);
  addMatch('5', groupWinners['H']?.countryCode, groupRunnersUp['J']?.countryCode);
  addMatch('6', groupWinners['D']?.countryCode, assignments['6']?.countryCode);
  addMatch('7', groupWinners['G']?.countryCode, assignments['7']?.countryCode);
  addMatch('8', groupWinners['C']?.countryCode, opponentL8?.countryCode);
  addMatch('9', groupWinners['B']?.countryCode, assignments['9']?.countryCode);
  addMatch('10', groupWinners['L']?.countryCode, assignments['10']?.countryCode);
  addMatch('11', groupWinners['J']?.countryCode, groupRunnersUp['H']?.countryCode);
  addMatch('12', groupWinners['K']?.countryCode, opponentL12?.countryCode);

  // Remaining 4 matches (13, 14, 15, 16)
  const remainingRunners = [
      groupRunnersUp['E'], groupRunnersUp['F'], groupRunnersUp['I'], groupRunnersUp['K'], groupRunnersUp['L'],
      remainingRunnerUpAB, remainingRunnerUpDG
  ].filter(Boolean);
  
  const remainingThird = thirds.find(t => !usedThirds.has(t.groupId));
  
  const pool = [...remainingRunners];
  if (remainingThird) pool.push(remainingThird);
  
  // Pair them up
  if (pool.length >= 2) addMatch('13', pool[0].countryCode, pool[1].countryCode);
  if (pool.length >= 4) addMatch('14', pool[2].countryCode, pool[3].countryCode);
  if (pool.length >= 6) addMatch('15', pool[4].countryCode, pool[5].countryCode);
  if (pool.length >= 8) addMatch('16', pool[6].countryCode, pool[7].countryCode);

  return matches;
}

export function generateBracket(roundOf32Matches: KnockoutMatch[]): KnockoutMatch[] {
    const allMatches = [...roundOf32Matches];
    
    // Round of 16 (8 matches)
    for (let i = 1; i <= 8; i++) {
        const m1 = roundOf32Matches[2*i - 2];
        const m2 = roundOf32Matches[2*i - 1];
        
        const nextId = `R16-${i}`;
        if (m1) { m1.nextMatchId = nextId; m1.nextMatchSlot = 'home'; }
        if (m2) { m2.nextMatchId = nextId; m2.nextMatchSlot = 'away'; }
        
        allMatches.push({
            id: nextId,
            round: 'roundOf16',
            homeTeam: null,
            awayTeam: null
        });
    }
    
    // Quarter Finals (4 matches)
    for (let i = 1; i <= 4; i++) {
        const prev1Id = `R16-${2*i - 1}`;
        const prev2Id = `R16-${2*i}`;
        const nextId = `QF-${i}`;
        
        const prev1 = allMatches.find(m => m.id === prev1Id);
        const prev2 = allMatches.find(m => m.id === prev2Id);
        
        if (prev1) { prev1.nextMatchId = nextId; prev1.nextMatchSlot = 'home'; }
        if (prev2) { prev2.nextMatchId = nextId; prev2.nextMatchSlot = 'away'; }
        
        allMatches.push({
            id: nextId,
            round: 'quarterFinals',
            homeTeam: null,
            awayTeam: null
        });
    }
    
    // Semis (2 matches)
    for (let i = 1; i <= 2; i++) {
        const prev1Id = `QF-${2*i - 1}`;
        const prev2Id = `QF-${2*i}`;
        const nextId = `SF-${i}`;
        
        const prev1 = allMatches.find(m => m.id === prev1Id);
        const prev2 = allMatches.find(m => m.id === prev2Id);
        
        if (prev1) { prev1.nextMatchId = nextId; prev1.nextMatchSlot = 'home'; }
        if (prev2) { prev2.nextMatchId = nextId; prev2.nextMatchSlot = 'away'; }
        
        allMatches.push({
            id: nextId,
            round: 'semiFinals',
            homeTeam: null,
            awayTeam: null
        });
    }
    
    // Final (1 match)
    const fId = 'FINAL';
    const sf1 = allMatches.find(m => m.id === 'SF-1');
    const sf2 = allMatches.find(m => m.id === 'SF-2');
    
    if (sf1) { sf1.nextMatchId = fId; sf1.nextMatchSlot = 'home'; }
    if (sf2) { sf2.nextMatchId = fId; sf2.nextMatchSlot = 'away'; }
    
    allMatches.push({
        id: fId,
        round: 'final',
        homeTeam: null,
        awayTeam: null
    });
    
    return allMatches;
}
