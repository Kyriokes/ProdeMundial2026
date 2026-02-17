import { MatchResult } from '../types';
import { countries } from '../data/countries';

export const generateMatchResult = (homeTeamCode: string, awayTeamCode: string, isKnockout: boolean = false): MatchResult & { winner?: string } => {
    const home = countries[homeTeamCode];
    const away = countries[awayTeamCode];
    
    // Safety check
    if (!home || !away) return { homeGoals: 0, awayGoals: 0 };

    // 1. Determine Winner Probabilities based on FIFA Ranking
    // Lower rank is better. Max rank ~210.
    // Let's invert rank to get "Strength"
    const maxRank = 215;
    const strengthHome = Math.max(1, maxRank - home.fifaRanking);
    const strengthAway = Math.max(1, maxRank - away.fifaRanking);
    
    const totalStrength = strengthHome + strengthAway;
    let probHomeWin = strengthHome / totalStrength;
    
    // Apply "Surprise Factor" / Flatten probabilities slightly so underdogs have a chance
    // This reduces the gap. If prob is 0.8, it becomes 0.8 * 0.8 + 0.1 = 0.74?
    // Let's just cap the max influence to 50% as requested, but "prevalence" means weight.
    // The user said: "ranking fifa tambien tendra un hasta 50% de prevalencia en inclinar la balanza"
    // This implies base 50/50, adjusted by up to 25%? Or 50% weight vs 50% random?
    
    // Let's mix: 50% purely based on strength, 50% coin flip.
    // AdjustedProb = 0.5 * (StrengthProb) + 0.5 * 0.5
    // Actually, let's keep it simple: Use the calculated probability but clamp it so it's never 100% or 0%.
    probHomeWin = 0.2 + (probHomeWin * 0.6); // Clamp between 20% and 80% approximately

    // Determine Winner of the "flow" of the match
    const rand = Math.random();
    let winner: 'home' | 'away' | 'draw' = 'draw';
    
    // Draw probability varies. In knockout, draws lead to penalties (so "draw" in 90 mins).
    // In groups, draws are common (~25%).
    const drawProb = 0.25;
    const remainingProb = 1 - drawProb;
    
    // Re-normalize win probs for the non-draw portion
    const normalizedHomeWin = probHomeWin; 
    // Wait, if probHomeWin is 0.6 (60% to win), away is 0.4.
    // If we insert draw:
    // P(Draw) = 0.25
    // P(Home) = 0.75 * probHomeWin
    // P(Away) = 0.75 * (1 - probHomeWin)
    
    if (rand < drawProb && !isKnockout) {
        winner = 'draw'; // Explicit draw in 90 mins
    } else {
        // If knockout, "draw" means penalties, but for goals generation we might still generate equal goals.
        // Let's decide if one team dominates.
        // Re-roll for winner vs loser
        const winRand = Math.random();
        if (winRand < probHomeWin) winner = 'home';
        else winner = 'away';
    }

    // 2. Generate Total Goals
    // Average 2.7. Predilection for 2-3.
    // Custom weighted distribution
    // 0, 1, 2, 3, 4, 5, 6+
    const goalProbabilities = [
        0.08, // 0 goals
        0.18, // 1 goal
        0.28, // 2 goals
        0.24, // 3 goals
        0.12, // 4 goals
        0.06, // 5 goals
        0.03, // 6 goals
        0.01  // 7+ goals
    ];
    
    let totalGoals = 0;
    const goalRand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < goalProbabilities.length; i++) {
        cumulative += goalProbabilities[i];
        if (goalRand < cumulative) {
            totalGoals = i;
            break;
        }
    }
    if (goalRand >= cumulative) totalGoals = 7 + Math.floor(Math.random() * 5); // 7 to 11
    
    // Cap at 12
    if (totalGoals > 12) totalGoals = 12;

    // 3. Distribute Goals
    let homeGoals = 0;
    let awayGoals = 0;

    if (winner === 'draw') {
        // Equal goals. If total is odd, round down or up?
        // Draw implies even goals usually (0-0, 1-1, 2-2).
        if (totalGoals % 2 !== 0) totalGoals -= 1; // Make it even
        homeGoals = totalGoals / 2;
        awayGoals = totalGoals / 2;
    } else {
        // Winner gets more.
        // If total is 0, impossible if there is a winner. Force 1 goal?
        if (totalGoals === 0) totalGoals = 1;
        
        // Ensure winner has at least +1
        const minWinnerGoals = Math.floor(totalGoals / 2) + 1;
        const extraGoals = totalGoals - minWinnerGoals;
        
        // Randomly distribute the rest, but bias towards winner slightly?
        // Actually, just giving minWinnerGoals guarantees win.
        // The rest (extraGoals) goes to loser.
        // Wait, if Total 3. MinWinner = 2. Loser = 1. Result 2-1. Perfect.
        // If Total 4. MinWinner = 3. Loser = 1. Result 3-1.
        // If Total 2. MinWinner = 2. Loser = 0. Result 2-0.
        // Seems consistent.
        
        // Randomize slightly? Maybe winner gets even more?
        // Let's stick to the "close match" logic: 2-1 is frequent.
        // So just giving "min necessary to win" is usually good for low scores.
        // For high scores (e.g. 5), split 3-2 is exciting. Split 4-1 is dominant.
        // Let's flip a coin for "domination".
        const domination = Math.random() < 0.3; // 30% chance of wider margin
        
        let winnerGoals = minWinnerGoals;
        let loserGoals = totalGoals - winnerGoals;
        
        if (domination && loserGoals > 0) {
            winnerGoals++;
            loserGoals--;
        }

        if (winner === 'home') {
            homeGoals = winnerGoals;
            awayGoals = loserGoals;
        } else {
            homeGoals = loserGoals;
            awayGoals = winnerGoals;
        }
    }

    // 4. Cards (Group Stage only)
    let homeYellow = 0, homeDoubleYellow = 0, homeDirectRed = 0;
    let awayYellow = 0, awayDoubleYellow = 0, awayDirectRed = 0;

    if (!isKnockout) {
        const generateCardsForTeam = () => {
            let y = 0, dy = 0, dr = 0;
            
            // Yellows
            const rY = Math.random();
            if (rY < 0.20) y = 1;
            else if (rY < 0.40) y = 2;
            else if (rY < 0.55) y = 3;
            else if (rY < 0.65) y = 4;
            
            // Double Yellow (5%)
            if (Math.random() < 0.05) dy = 1;
            
            // Direct Red (1%)
            if (Math.random() < 0.01) dr = 1;
            
            // Constraint check: max 4 expulsions
            // But we only generated 1 of each max in this simple logic (except Y which doesn't expel directly unless 2, but we track simple Y separately).
            // Double Yellow counts as expulsion. Red counts as expulsion.
            // Check totals.
            return { y, dy, dr };
        };

        const cH = generateCardsForTeam();
        homeYellow = cH.y; homeDoubleYellow = cH.dy; homeDirectRed = cH.dr;
        
        const cA = generateCardsForTeam();
        awayYellow = cA.y; awayDoubleYellow = cA.dy; awayDirectRed = cA.dr;
    }

    // 5. Penalties (Knockout only)
    let isPenalty = false;
    let penaltyWinner: 'home' | 'away' | undefined = undefined;
    let finalWinnerCode = undefined;

    if (isKnockout) {
        if (homeGoals === awayGoals) {
            isPenalty = true;
            // Weighted by FIFA Ranking
            // P(HomePenWin) = StrengthHome / TotalStrength
            // Using the raw strength calculated earlier
            const penRand = Math.random();
            penaltyWinner = penRand < (strengthHome / totalStrength) ? 'home' : 'away';
            finalWinnerCode = penaltyWinner === 'home' ? homeTeamCode : awayTeamCode;
        } else {
            finalWinnerCode = homeGoals > awayGoals ? homeTeamCode : awayTeamCode;
        }
    }

    return {
        homeGoals,
        awayGoals,
        homeYellow,
        homeDoubleYellow,
        homeDirectRed,
        awayYellow,
        awayDoubleYellow,
        awayDirectRed,
        isPenalty,
        penaltyWinner,
        winner: finalWinnerCode
    };
};
