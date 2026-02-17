# Plan: Implement Random Result Generator

The user wants to add a button with a dice icon that generates random results for matches, based on specific probability rules. This feature will be added to both `MatchRow` (Group Stage) and `KnockoutMatchCard` (Knockout Stage).

## Requirements

1.  **UI**:
    *   **Group Stage (`MatchRow`)**: A button with a dice icon on the **left margin**, opposite to the card toggle.
    *   **Knockout Stage (`KnockoutMatchCard`)**: A button with a dice icon on the **right side**, vertically centered between the two teams.
    *   **Icon**: A dice icon (SVG or emoji, SVG preferred for consistency).

2.  **Probability Logic**:
    *   **Goals**:
        *   Max 12 goals per match total.
        *   Average ~2.7 goals.
        *   Predilection for 2-3 goals total.
        *   "0-0" and "3-3" are rare.
        *   High goal counts (>6) are increasingly rare.
        *   Most frequent result for winner: 2-1.
    *   **Winner Determination**:
        *   FIFA Ranking influence: Up to 50% weight.
        *   Surprise factor: Still possible.
    *   **Cards (Group Stage only)**:
        *   Red (1): 1% chance.
        *   Double Yellow (1): 5% chance.
        *   Yellows:
            *   1: 20%
            *   2: 20%
            *   3: 15%
            *   4: 10%
    *   **Penalties (Knockout Stage only)**:
        *   If draw, winner determined by FIFA Ranking weight (Ranking A + Ranking B = 100%, probability distributed inversely to ranking - lower ranking number is better).

## Implementation Steps

### 1. Create `RandomGenerator` Utility
We'll create a new utility file `src/utils/randomizer.ts` to encapsulate the logic.

*   `generateMatchResult(homeTeamCode, awayTeamCode, isKnockout)`: Returns `MatchResult`.
*   **Logic**:
    *   Get FIFA rankings for both teams.
    *   Calculate win probability based on ranking difference (max impact 50%).
    *   Determine total goals (weighted random around 2-3).
    *   Distribute goals based on win probability.
    *   If Group Stage:
        *   Generate cards based on percentages.
    *   If Knockout Stage & Draw:
        *   Determine penalty winner based on ranking probability.

### 2. Update `MatchRow.tsx`
*   Import `generateMatchResult`.
*   Add the Dice button on the left.
*   `onClick`: Call generator and `onUpdate`.

### 3. Update `KnockoutMatchCard.tsx`
*   Import `generateMatchResult`.
*   Add the Dice button on the right (absolute positioned or flex).
*   `onClick`: Call generator and `onUpdate`.

## Detailed Probability Algorithm (Draft)

**Goals Distribution:**
*   Base distribution array for total goals: `[0, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7, 8, 9+]` (weighted).
*   **Winner Score**: If Total=3, Winner gets 2 or 3? Usually 2-1 or 3-0.
*   **FIFA Weight**:
    *   `P(HomeWin) = 0.5 + (AwayRank - HomeRank) * Factor`?
    *   Let's use a simplified model:
        *   Stronger team has higher lambda for Poisson distribution?
        *   Or simply: Decide winner first based on ranking, then decide score.
        *   **Step 1**: Who wins?
            *   `ChanceA = B_Rank / (A_Rank + B_Rank)` (Inverse proportion? No, lower rank is better).
            *   `StrengthA = 220 - A_Rank` (assuming max rank ~211).
            *   `ProbA = StrengthA / (StrengthA + StrengthB)`.
            *   Add "Surprise Factor" noise.
        *   **Step 2**: Total Goals.
            *   Weighted random from predefined curve centered at 2-3.
        *   **Step 3**: Score Split.
            *   If Draw (and draw allowed): Split evenly.
            *   If Winner determined: Assign majority of goals to winner. (e.g. if Total 3, Winner gets 2 or 3).
            *   Ensure "2-1" is common.

**Cards Logic:**
*   Independent probabilities for each type?
*   "1% chance for 1 red" -> `Math.random() < 0.01` -> `reds = 1`.
*   Use the specified distribution.

## Refinement on "Dice Button" Location
*   `MatchRow`: "Left margin, opposite to cards". Current cards are absolute right. So Dice absolute left? Or flex-start?
    *   The row has `homeTeam` flex-end, `inputs` center, `awayTeam` flex-start.
    *   We can put the button absolute left `left-0`.
*   `KnockoutMatchCard`: "Right side, media height".
    *   The card is small. Maybe absolute right `right-1` centered vertically.

## Code Changes
1.  `src/utils/randomizer.ts` (New)
2.  `src/components/MatchRow.tsx` (Update)
3.  `src/components/KnockoutMatchCard.tsx` (Update)
