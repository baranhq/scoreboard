# Scoreboard design

## Direction

Public landing pages follow Modern Competition Editorial: oversized Inter Tight, deep forest `#14251b`, warm ivory `#f5f2e8`, and selective lime `#ccf86b`. The homepage pairs a headline with a coordinated, switchable real product stage, an editorial tool index, a shared theme lab, a compact workflow, and an open-source close. Product pages have individual broadcast, ranking and panoramic tournament compositions. Useful interactive layout comparisons and real timer controls replace text-only capability sections. No decorative metrics, floating glass cards or marketing-only renderers. Builders retain their existing interface and data contracts.

## Tokens and type

- Light surfaces: paper `#f7f8f1`, surface `#fffefa`, ink `#202820`, forest `#285b35`, action `#367747`.
- Dark surfaces: paper `#151d17`, surface `#202a22`, ink `#eef2ec`, forest `#9cc99f`, action `#79bb83`.
- Use green for site actions and progress. Preserve clear success, warning, and error states.
- Use the locally bundled Inter Tight for display text and Inter for body and controls. Use tabular numerals for scores and times.
- Use a consistent 8px spacing rhythm, clear rules between data groups, restrained corner rounding, and one primary button treatment.

## Public pages

Discovery pages use Home, Scoreboard, Leaderboards and Brackets links to the matching product introductions, plus a contextual action that opens that tool. The homepage leads with a forest broadcast stage and oversized type, followed by a plain tool index and an ivory theme laboratory. The hero initially shows Scoreboard; the theme lab initially shows Leaderboards. Product introductions use individually arranged real demonstrations, with advanced controls collapsed and large readable outputs. Render real product states instead of static mock dashboards.

Product introductions pair distinct heroes with capability stories, actual editor preset/layout comparisons, localized captures of real controls, workflows, product-specific FAQs and a closing application action. Scoreboard demonstrations reuse TeamPanel; graphics reuse the editor SVG renderer. Marketing examples remain separate from project storage.

## Application navigation

Application pages use Home, Scoreboard, Leaderboards, Brackets and My Tables links that open the applications directly. Show the current destination and retain language and theme controls. Keep this header compact and separate from the discovery navigation.

The homepage provides direct actions to all three applications. Product introductions remain available from discovery navigation and contextual links. Saved work stays available in My Tables.

### Shared editing pattern

Keep each product's familiar task visible. Place save and PNG export where users expect them, give every editor a clear path to its product introduction, and group appearance and graphic-format settings plainly. Use Content, Design, Settings, and Export tabs; keep saving explicit, preserve browser-local drafts, and show storage and export errors. Examples belong only in landing-page demonstrations.

### Leaderboard

Start with an empty, editable ranking and an obvious Add participant action. Edit entries and values directly in the graphic or table; reorder by points when requested. Let users place ranked entries in one, two or three side-by-side groups. Support custom canvas dimensions and aspect ratios without cropping content. Keep table scrolling inside its own region and controls comfortably touchable.

### Bracket

Start with numbered participant placeholders and undecided matches. Let users edit a name or score from the preview, keep match selection straightforward, and advance the chosen winner. Show one round at a time on narrow screens. Support custom canvas dimensions and aspect ratios without cropping the bracket. If changing a winner or participant count would clear entered results in later rounds, explain the consequence and ask before applying it.

### Scoreboard

Preserve score controls, periods, timers, customization, fullscreen, URL sharing, backups, and all existing Scoreboard storage and deep links. Improve the surrounding editor and navigation without changing the meaning of existing saved boards.

## Motion and accessibility

Animate only meaningful state changes: score feedback, a leaderboard row changing rank, a winner moving into the next round, and a compact public-page entrance. Use transforms and opacity for spatial changes, keep feedback brief, and pause any optional demo sequence when it is offscreen or the page is hidden. Under `prefers-reduced-motion`, remove spatial movement while keeping the changed score, rank, and winner states immediately clear.

Use labelled native inputs, visible keyboard focus, 44px ordinary touch targets, readable contrast, keyboard-operable menus and dialogs, and no horizontal overflow in ordinary editing screens. Never shrink the whole page to fit a large bracket; keep the graphic in a focused, scrollable preview.
