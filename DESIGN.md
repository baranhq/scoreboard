# Scoreboard design

## Direction

Treat the product like a clear, modern game-night ledger: lively enough for a group to watch, precise enough for a host to run without stopping to learn the interface. Use restrained editorial typography, ruled tables, compact match labels, and real interactive product views. Avoid generic SaaS cards, stock imagery, decorative gradients, fake metrics, and ornamental UI that competes with scores.

The existing Baran's Scoreboard name and wordmark remain. Use a clear forest-green identity with warm paper and charcoal surfaces. Keep the wordmark's own colours intact.

## Tokens and type

- Light surfaces: paper `#f7f8f1`, surface `#fffefa`, ink `#202820`, forest `#285b35`, action `#367747`.
- Dark surfaces: paper `#151d17`, surface `#202a22`, ink `#eef2ec`, forest `#9cc99f`, action `#79bb83`.
- Use green for site actions and progress. Preserve clear success, warning, and error states.
- Use the locally bundled Inter Tight for display text and Inter for body and controls. Use tabular numerals for scores and times.
- Use a consistent 8px spacing rhythm, clear rules between data groups, restrained corner rounding, and one primary button treatment.

## Public pages

Discovery pages use Home, Scoreboard, Leaderboards and Brackets links to the matching product introductions, plus a contextual action that opens that tool. The home page pairs a direct promise with one switchable, interactive application view and a short progression from score to final. Product introductions use the matching working application demo. Render real product states instead of static mock dashboards.

## Application navigation

Application pages use Home, Scoreboard, Leaderboards, Brackets and My Tables links that open the applications directly. Show the current destination and retain language and theme controls. Keep this header compact and separate from the discovery navigation.

The homepage provides direct actions to all three applications. Product introductions remain available from discovery navigation and contextual links. Saved work stays available in My Tables.

### Shared editing pattern

Keep each product's familiar task visible. Place save and PNG export where users expect them, give every editor a clear path to its product introduction, and group appearance and graphic-format settings plainly. Keep saving explicit, preserve browser-local drafts, show storage and export errors, and mark examples so they cannot be mistaken for saved work.

### Leaderboard

Open a useful sample with participant and points data. Edit entries and values in the graphic preview or the table, use simple add/remove actions, and reorder by points when scores change. Let users place ranked entries in one, two or three side-by-side groups. Support preset and custom canvas dimensions and aspect ratios without cropping content. Keep table scrolling inside its own region and compact controls at least 36px tall.

### Bracket

Start with a small participant list and a generated bracket using numbered sample identifiers. Let users edit a name or score from the preview, keep match selection straightforward, and advance the chosen winner. Show one round at a time on narrow screens. Support custom canvas dimensions and aspect ratios without cropping the bracket. If changing a winner or participant count would clear entered results in later rounds, explain the consequence and ask before applying it.

### Scoreboard

Preserve score controls, periods, timers, customization, fullscreen, URL sharing, backups, and all existing Scoreboard storage and deep links. Improve the surrounding editor and navigation without changing the meaning of existing saved boards.

## Motion and accessibility

Animate only meaningful state changes: score feedback, a leaderboard row changing rank, a winner moving into the next round, and a compact public-page entrance. Use transforms and opacity for spatial changes, keep feedback brief, and pause any optional demo sequence when it is offscreen or the page is hidden. Under `prefers-reduced-motion`, remove spatial movement while keeping the changed score, rank, and winner states immediately clear.

Use labelled native inputs, visible keyboard focus, 44px ordinary touch targets, readable contrast, keyboard-operable menus and dialogs, and no horizontal overflow in ordinary editing screens. Never shrink the whole page to fit a large bracket; keep the graphic in a focused, scrollable preview.
