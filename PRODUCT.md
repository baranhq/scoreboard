# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People hosting classroom activities and quizzes, casual group games, or small tournaments. These audiences have equal priority. Many are new to scorekeeping software and have little experience with spreadsheets or tournament tools.

## Product Purpose

Baran's Scoreboard provides browser tools to keep a live score, rank participants, and run a knockout tournament. Success means a host can start the right tool, use it during an activity, and share or reopen the result without needing instructions or an account.

## Positioning

Three free, open-source browser tools work without player accounts or cloud saves. Scoreboards save in the browser and can be shared with a URL. Leaderboards and brackets save in a separate browser store and can be exported as PNG graphics or editable JSON backups.

## Operating Context

One host usually sets up and edits a board while other people take part or watch. Activities include classrooms, quizzes, friendly games, and small tournaments. Boards need to remain legible on phones and on a shared display, and saved work needs to be easy to reopen.

## Capabilities and Constraints

- Scoreboards support teams, scores, periods, timers, appearance controls, fullscreen presentation, saved boards, URL sharing, and JSON backups.
- Leaderboards support 1–100 entries and 1–10 data columns, one to three ranked display columns, direct preview editing, sorting, highlighted rows, colour controls, canvas aspect ratios and custom PNG dimensions.
- Brackets support 2–64 participants, single or split layouts, automatic byes, match results, winner progression, direct preview editing, colour controls, canvas aspect ratios and custom PNG dimensions.
- Existing Scoreboard records, `/scoreboard/` URLs, share fragments, and backup formats remain compatible. Leaderboard and bracket documents use a separate versioned browser store.
- The site supports English, Bulgarian, and Turkish. Public introductions are indexable when enabled; editors and saved work are noindex.
- The site remains a static Next.js export with its existing optional PHP/MySQL backend. Board creation does not require a new account system, cloud storage, or remote service.
- Existing analytics consent, administrator authentication, privacy disclosures, and project licensing remain intact.
- Keep user-provided text as text, validate imported and stored data, preserve visible keyboard focus, and respect reduced-motion preferences. Target WCAG 2.2 AA.
- New graphic projects start blank; sample results and stress controls belong only to marketing demonstrations. Fifteen appearance presets and locally saved custom themes are shared across the tools.
- Built-in examples use only generic team and participant identifiers. Users can choose from in-app colour palettes or enter a custom colour; graphic typography uses the product's fixed typeface.

## Brand Commitments

The product name is Baran's Scoreboard. Preserve the existing wordmark and truthful product naming. Quality references named by the owner are inspiration only; do not copy their identity or signature layouts.

## Evidence on Hand

Working product code, browser storage, share/export paths, and sample data are in the repository. Existing wordmark assets are under `public/`. There are no verified customer counts, testimonials, or usage statistics; do not invent them.

## Product Principles

- Put a useful, beginner-friendly next action in front of the host.
- Keep direct editing simple and reveal advanced controls only when needed.
- Make each tool's state and the effect of an action easy to understand.
- Keep saved data local and preserve established formats and links.
- Show the actual capabilities of the product and make no unsupported claims.
