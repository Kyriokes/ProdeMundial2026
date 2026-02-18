import { GroupMember, KnockoutMatch } from '../types';
import { getPatternForCombination } from './thirdCombinationMap';

export function getKnockoutMatchups(
  groupWinners: Record<string, GroupMember>,
  groupRunnersUp: Record<string, GroupMember>,
  bestThirds: GroupMember[]
): KnockoutMatch[] {
  // 1. Get the 8 qualified 3rd place teams and sort their group IDs
  const thirds = [...bestThirds];
  const thirdMap = new Map<string, GroupMember>();
  thirds.forEach(t => thirdMap.set(t.groupId, t));
  
  // 2. Get the pattern from the map
  const pattern = getPatternForCombination(thirds.map(t => t.groupId));
  
  // 3. Construct the 16 matches based on Official Match Schedule (Matches 73-88)
  const matches: KnockoutMatch[] = [];

  // Helper to add match with specific ID
  const addMatch = (matchNum: number, home: GroupMember | undefined, away: GroupMember | undefined) => {
    matches.push({
      id: `M${matchNum}`,
      round: 'roundOf32',
      homeTeam: home?.countryCode || null,
      awayTeam: away?.countryCode || null,
    });
  };

  // Match 73: Runner-up Group A vs Runner-up Group B
  addMatch(73, groupRunnersUp['A'], groupRunnersUp['B']);

  // Match 74: Winner Group E vs Best 3rd place Group A/B/C/D/F
  addMatch(74, groupWinners['E'], thirdMap.get(pattern['E']));

  // Match 75: Winner Group F vs Runner-up Group C
  addMatch(75, groupWinners['F'], groupRunnersUp['C']);

  // Match 76: Winner Group C vs Runner-up Group F
  addMatch(76, groupWinners['C'], groupRunnersUp['F']);

  // Match 77: Winner Group I vs Best 3rd place Group C/D/F/G/H
  addMatch(77, groupWinners['I'], thirdMap.get(pattern['I']));

  // Match 78: Runner-up Group E vs Runner-up Group I
  addMatch(78, groupRunnersUp['E'], groupRunnersUp['I']);

  // Match 79: Winner Group A vs Best 3rd place Group C/E/F/H/I
  addMatch(79, groupWinners['A'], thirdMap.get(pattern['A']));

  // Match 80: Winner Group L vs Best 3rd place Group E/H/I/J/K
  addMatch(80, groupWinners['L'], thirdMap.get(pattern['L']));

  // Match 81: Winner Group D vs Best 3rd place Group B/E/F/I/J
  addMatch(81, groupWinners['D'], thirdMap.get(pattern['D']));

  // Match 82: Winner Group G vs Best 3rd place Group A/E/H/I/J
  addMatch(82, groupWinners['G'], thirdMap.get(pattern['G']));

  // Match 83: Runner-up Group K vs Runner-up Group L
  addMatch(83, groupRunnersUp['K'], groupRunnersUp['L']);

  // Match 84: Winner Group H vs Runner-up Group J
  addMatch(84, groupWinners['H'], groupRunnersUp['J']);

  // Match 85: Winner Group B vs Best 3rd place Group E/F/G/I/J
  addMatch(85, groupWinners['B'], thirdMap.get(pattern['B']));

  // Match 86: Winner Group J vs Runner-up Group H
  addMatch(86, groupWinners['J'], groupRunnersUp['H']);

  // Match 87: Winner Group K vs Best 3rd place Group D/E/I/J/L
  addMatch(87, groupWinners['K'], thirdMap.get(pattern['K']));

  // Match 88: Runner-up Group D vs Runner-up Group G
  addMatch(88, groupRunnersUp['D'], groupRunnersUp['G']);

  return matches;
}

export function generateBracket(roundOf32Matches: KnockoutMatch[]): KnockoutMatch[] {
    const allMatches = [...roundOf32Matches];
    
    // We need to map the R32 matches to R16 matches according to the official bracket.
    // Official Bracket (Round of 16):
    // Match 89: Winner M73 vs Winner M74
    // Match 90: Winner M75 vs Winner M76
    // ...
    // Match 96: Winner M87 vs Winner M88
    
    // Since our matches array is ordered M73...M88, we can just pair them sequentially.
    // i=0 (M73) vs i=1 (M74) -> M89
    
    // Round of 16 (8 matches: M89 to M96)
    for (let i = 0; i < 8; i++) {
        const m1 = roundOf32Matches[2*i];     // e.g. M73
        const m2 = roundOf32Matches[2*i + 1]; // e.g. M74
        
        const nextId = `M${89 + i}`;
        if (m1) { m1.nextMatchId = nextId; m1.nextMatchSlot = 'home'; }
        if (m2) { m2.nextMatchId = nextId; m2.nextMatchSlot = 'away'; }
        
        allMatches.push({
            id: nextId,
            round: 'roundOf16',
            homeTeam: null,
            awayTeam: null
        });
    }
    
    // Quarter Finals (4 matches: M97 to M100)
    // M97: Winner M89 vs Winner M90
    for (let i = 0; i < 4; i++) {
        const prev1Id = `M${89 + 2*i}`;     // e.g. M89
        const prev2Id = `M${89 + 2*i + 1}`; // e.g. M90
        const nextId = `M${97 + i}`;
        
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
    
    // Semi Finals (2 matches: M101, M102)
    // M101: Winner M97 vs Winner M98
    for (let i = 0; i < 2; i++) {
        const prev1Id = `M${97 + 2*i}`;
        const prev2Id = `M${97 + 2*i + 1}`;
        const nextId = `M${101 + i}`;
        
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
    
    // Final (Match 104) and Third Place (Match 103) - Note: Official usually has 3rd place match
    // Standard: Winner M101 vs Winner M102 -> Final (M104)
    // Loser M101 vs Loser M102 -> 3rd Place (M103)
    
    const sf1 = allMatches.find(m => m.id === 'M101');
    const sf2 = allMatches.find(m => m.id === 'M102');
    
    // Final
    const fId = 'M104';
    if (sf1) { sf1.nextMatchId = fId; sf1.nextMatchSlot = 'home'; }
    if (sf2) { sf2.nextMatchId = fId; sf2.nextMatchSlot = 'away'; }
    
    allMatches.push({
        id: fId,
        round: 'final',
        homeTeam: null,
        awayTeam: null
    });

    // Third Place Match
    const tpId = 'M103';
    // Logic for populating losers would go here during state updates, 
    // but structure-wise we just define the match.
    allMatches.push({
        id: tpId,
        round: 'thirdPlace',
        homeTeam: null,
        awayTeam: null
    });
    
    return allMatches;
}
