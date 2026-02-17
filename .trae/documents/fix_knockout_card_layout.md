# Plan: Integrate Penalty Selection into Match Rows

The user reported that the current penalty UI (a new row appearing at the bottom) breaks the visual harmony of the knockout cards. To fix this, we will move the penalty selection *inside* the team rows, appearing only when there is a draw. This ensures the card height remains constant.

## Changes

### `src/components/KnockoutMatchCard.tsx`

1.  **Remove the bottom Penalty UI section**: Delete the conditional block that renders the "Pen: L V" buttons at the bottom of the card.
2.  **Add inline Penalty buttons**:
    *   Inside the Home Team row, after the score input, add a conditional button if `isDraw` is true.
    *   Inside the Away Team row, after the score input, add a conditional button if `isDraw` is true.
3.  **Styling**:
    *   The button will be a small circular indicator (or a small "P" badge).
    *   **State**:
        *   **Selected**: Green background, white text/border.
        *   **Unselected**: Gray outline, transparent/white background.
    *   **Action**: Clicking the button sets that team as the penalty winner.
4.  **Layout Adjustment**: Ensure the team name truncates correctly to accommodate the new button without breaking the row layout.

## Visual Interaction
- When scores are equal (e.g., 1-1):
    - A small "P" button appears to the right of each score input.
    - User clicks the "P" next to the winning team.
    - The card height does not change.
