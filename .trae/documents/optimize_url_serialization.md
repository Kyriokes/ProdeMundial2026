# Plan: Optimize URL State Serialization

The user has pointed out that the current URL structure is too long. Currently, we are using `JSON.stringify` followed by `LZString.compressToEncodedURIComponent`. While LZString is efficient, JSON adds a lot of overhead (keys, quotes, brackets).

To shorten the URL, we will implement a custom, dense binary-like packing scheme before compression.

## Strategy

1.  **Qualifiers**:
    *   Instead of `{"uefaPaths":{"pathA":"WAL",...}}`, we can just store the values in a fixed order.
    *   Since the structure is static (Path A, B, C, D, Key A, B), we can just join the country codes.
    *   Format: `WAL,UKR,SVK,CZE,COD,IRQ` (comma separated).
    *   Or even better, map each country code to a short ID (index in the `countries` array) if we want extreme compression, but comma-separated codes is a good balance of readability/debuggability and length. Let's stick to standard country codes for now as they are 3 chars.
    *   Structure: `[PathA, PathB, PathC, PathD, KeyA, KeyB]`.

2.  **Groups**:
    *   Instead of `{"matches":{"A-1":{"homeGoals":1,"awayGoals":0},...}}`, we can rely on the deterministic order of matches.
    *   There are 12 groups * 6 matches = 72 matches.
    *   We can represent each match result as a compact string: `H-A`.
    *   If a match is not played, we can use `_`.
    *   If there are cards, we can append them.
    *   **Proposed Compact Format**:
        *   String of results separated by `|` (group separator) and `.` (match separator).
        *   Each match: `H:A` (goals).
        *   Cards? The user added card inputs. We need to persist them.
        *   Cards format: `Yh,Dmh,Drh,Ya,Dma,Dra` (Yellow home, DoubleYellow home, etc).
        *   Full match string: `HG:AG:HY:HDY:HDR:AY:ADY:ADR`.
        *   This might still be long if we include all 0s.
        *   Optimization: `HG:AG` is mandatory if played. Cards can be optional suffixes.
        *   Let's try a custom format: `2:1` (Home 2, Away 1).
        *   With cards: `2:1,100010` (Home: 1Y, 0DY, 0DR; Away: 0Y, 1DY, 0DR).
        *   We can use a fixed order of matches: A1..A6, B1..B6...
        *   Join all matches with `;`.

3.  **Knockout**:
    *   Knockout matches also have a fixed structure (bracket).
    *   We can order them by ID (R32-1 to Final).
    *   Format: `HG:AG` (plus optional penalty winner `pL` or `pV`).
    *   Since the bracket structure is dynamic based on group results, we only need to store the *scores* and *penalties* for the match IDs. The actual teams are derived.
    *   We need to ensure we map the results to the correct match ID.
    *   We can serialize as `MatchID=HG:AG:Pen`. But Match IDs are long.
    *   Better: Define a canonical order for knockout matches (R32_1, R32_2... Final).
    *   Store results in that order.

## Implementation Details

We will modify `src/utils/serializer.ts`.

### `StateSerializer` Class Updates

1.  **`serializeQualifiers`**:
    *   Order: Path A, B, C, D, Key A, B.
    *   Return: `CodeA,CodeB,CodeC,CodeD,KeyA,KeyB`.
    *   Example: `WAL,UKR,SVK,CZE,COD,IRQ`.

2.  **`serializeGroups`**:
    *   Iterate groups A-L.
    *   Iterate matches 1-6.
    *   For each match:
        *   If no result: `_`
        *   If result: `HG:AG`
        *   If cards exist: `HG:AG:HY.HDY.HDR.AY.ADY.ADR` (base 36 or just numbers).
        *   Actually, let's keep it simple first: `HG:AG`.
        *   The user *did* add cards. We must persist them.
        *   Let's use a dense format.
        *   `HG.AG.HY.HDY.HDR.AY.ADY.ADR`
        *   Trailing zeros can be omitted? No, simple fixed position is easier.
        *   Optimization: If all cards are 0 (common case), just `HG.AG`.
        *   If any card > 0, write full `HG.AG.HY.HDY.HDR.AY.ADY.ADR`.
    *   Join matches with `;`.
    *   Compress the resulting string with LZString.

3.  **`serializeKnockout`**:
    *   Canonical order:
        *   R32 (1-16)
        *   R16 (1-8)
        *   QF (1-4)
        *   SF (1-2)
        *   ThirdPlace
        *   Final
    *   Format: `HG.AG`
    *   If penalty: `HG.AG.p1` (Home wins pen) or `HG.AG.p2` (Away wins pen).
    *   Join with `;`.

4.  **Deserializers**:
    *   Implement corresponding parsing logic to reconstruct the objects.

## Example of Worst Case Scenario (Longest URL)

Let's assume the user has filled out EVERYTHING, including maximum cards and penalties.

**1. Qualifiers (6 items):**
`WAL,UKR,SVK,CZE,COD,IRQ` (Approx 23 chars)

**2. Groups (12 groups * 6 matches = 72 matches):**
Worst case: Every match played, high scores (e.g., 10-10), and lots of cards (e.g., 2 yellow, 1 double yellow, 1 red for both teams).
Format per match: `10.10.2.1.1.2.1.1` (Approx 15 chars).
Total raw string: 72 * 16 chars (including separator) ≈ 1152 chars.
Compressed with LZString: ~300-400 chars.

**3. Knockout (16 + 8 + 4 + 2 + 1 + 1 = 32 matches):**
Worst case: Every match goes to penalties.
Format per match: `10.10p1` (Approx 7 chars).
Total raw string: 32 * 8 chars ≈ 256 chars.
Compressed with LZString: ~80-100 chars.

**Total URL Length:**
Base URL + `/qualifiers/` + Qualifiers (~30) + `&` + Groups (~400) + `&` + Knockout (~100).
**Total Estimated: ~550-600 characters.**

**Comparison with current JSON approach:**
- JSON Groups: `{"matches":{"A-1":{"homeGoals":10,"awayGoals":10,"homeYellow":2...}}}`
- Each match object is ~150 chars.
- 72 matches * 150 chars ≈ 10,800 chars raw JSON!
- Compressed JSON: ~2500-3000 chars.

**Conclusion:**
The new approach reduces the URL length from **~3000 chars** to **~600 chars** in the worst case scenario. This is a massive improvement (5x reduction).

## Refined Group Match Format
To handle cards efficiently:
- Default: `_` (not played)
- Simple Result: `2-1` (separator `-` avoids confusion with decimal)
- With Cards: `2-1(1.0.0.2.0.0)` (Parentheses indicate cards: HY.HDY.HDR.AY.ADY.ADR)
- This is unambiguous.

## Refined Knockout Format
- `2-1`
- `1-1p1` (1-1, Home wins pens)
- `1-1p2` (1-1, Away wins pens)
