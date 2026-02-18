// This file contains the lookup table for the 495 possible combinations of 8 third-place teams.
// Since the full table is massive, we provide a structure and a fallback generator.
// Based on official regulations (Match 73-88), the winners playing 3rd place teams are:
// A, B, D, E, G, I, K, L

export type ThirdPlacePattern = {
  // Maps the Group Winner (key) to the Group of the 3rd place team (value)
  [key: string]: string; 
};

export const thirdCombinationMap: Record<string, ThirdPlacePattern> = {
  // Example entry: If 3rd place teams are from A, B, C, D, E, F, G, H
  // This needs to be updated to match the NEW winners set (A,B,D,E,G,I,K,L)
  // For now, we rely on the generator unless we have the full official table.
};

// Helper to generate a pattern on the fly if not in the map
// This ensures the app doesn't crash for missing combinations
export function getPatternForCombination(thirds: string[]): ThirdPlacePattern {
  const key = thirds.sort().join("");
  if (thirdCombinationMap[key]) {
    return thirdCombinationMap[key];
  }

  // Fallback: Greedy assignment
  // Winners that need a 3rd place opponent (Updated per official regulations)
  const winners = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L'];
  const availableThirds = [...thirds];
  const assignment: ThirdPlacePattern = {};
  
  // Sort availableThirds by proximity to the current winner to prioritize alphabetical closeness
  // This is a heuristic to mimic the official table's tendency.
  
  const solve = (wIdx: number): boolean => {
    if (wIdx >= winners.length) return true;
    
    const winner = winners[wIdx];
    
    // Sort candidates by distance to winner
    // e.g. if winner is A, order A, B, C... (closest first)
    // Distance is circular or linear? Linear is simpler and likely what "alphabetical" means.
    // abs(charCodeAt(winner) - charCodeAt(third))
    
    const candidates = [...availableThirds].sort((a, b) => {
      const distA = Math.abs(a.charCodeAt(0) - winner.charCodeAt(0));
      const distB = Math.abs(b.charCodeAt(0) - winner.charCodeAt(0));
      // If distances are equal, pick the one that comes first alphabetically to break tie
      if (distA === distB) return a.localeCompare(b);
      return distA - distB;
    });

    for (let i = 0; i < candidates.length; i++) {
      const third = candidates[i];
      
      // Constraint: Winner cannot play 3rd from same group
      if (winner === third) continue;
      
      // Assign
      assignment[winner] = third;
      
      // Remove from available (find index in original array)
      const indexInOriginal = availableThirds.indexOf(third);
      availableThirds.splice(indexInOriginal, 1);
      
      if (solve(wIdx + 1)) return true;
      
      // Backtrack
      availableThirds.splice(indexInOriginal, 0, third);
      delete assignment[winner];
    }
    return false;
  };

  if (solve(0)) {
    return assignment;
  }

  // If no valid assignment (rare/impossible?), just assign sequentially
  winners.forEach((w, i) => {
    assignment[w] = thirds[i];
  });
  
  return assignment;
}
