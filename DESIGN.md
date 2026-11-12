---
name: Baran's Scoreboard
description: Clear scoreboards, standings and tournament brackets for live games.
colors:
  campaign: "#14251b"
  campaign-ink: "#f5f2e8"
  lime: "#ccf86b"
  campaign-soft: "#e4ecd7"
  campaign-muted: "#24392a"
  light-paper: "#f7f8f1"
  light-surface: "#fffefa"
  light-ink: "#202820"
  light-forest: "#285b35"
  light-action: "#367747"
  light-on-action: "#ffffff"
  dark-paper: "#151d17"
  dark-surface: "#202a22"
  dark-ink: "#eef2ec"
  dark-forest: "#9cc99f"
  dark-action: "#79bb83"
  dark-on-action: "#132116"
typography:
  display:
    fontFamily: '"Inter Tight", Arial, Helvetica, sans-serif'
    fontWeight: 700
  body:
    fontFamily: '"Inter", Arial, Helvetica, sans-serif'
    fontSize: "18px"
components:
  primary-button:
    backgroundColor: "{colors.light-action}"
    textColor: "{colors.light-on-action}"
    rounded: "8px"
    height: "44px"
    padding: "8px 16px"
  outline-button:
    backgroundColor: "transparent"
    textColor: "{colors.light-forest}"
    rounded: "8px"
    height: "44px"
    padding: "8px 16px"
---

# Design System: Baran's Scoreboard

## Overview

**Creative North Star: Modern Competition Editorial.**

The visual system pairs clear live-game graphics with an editorial presentation. Public pages use oversized Inter Tight headlines, a deep-forest campaign surface, warm ivory content, and a restrained lime accent. Real, switchable product demos lead into practical tool information. Keep the working editors familiar and preserve their existing data contracts.

Use open space and strong type for hierarchy. Product graphics should look ready to present, while controls remain plain and easy to scan. Avoid decorative metrics, floating glass cards, and marketing-only renderers.

## Colors

Use the green family for actions, progress, and focus. Keep score graphics' background, text, and row colours coordinated through the selected theme.

### Campaign

- **Campaign forest** (`#14251b`): Dark public hero and showcase surfaces.
- **Campaign ivory** (`#f5f2e8`): Headline and primary text on campaign forest.
- **Campaign lime** (`#ccf86b`): Selective emphasis and campaign calls to action.
- **Campaign soft** (`#e4ecd7`) and **campaign muted** (`#24392a`): Supporting tones for campaign surfaces.

### Light application

- **Paper** (`#f7f8f1`): Page background.
- **Surface** (`#fffefa`): Panels, menus, and inputs.
- **Ink** (`#202820`): Main text.
- **Forest** (`#285b35`): Secondary actions, borders, and focus.
- **Action** (`#367747`) with **on-action** (`#ffffff`): Primary action and selected states.

### Dark application

- **Paper** (`#151d17`): Page background.
- **Surface** (`#202a22`): Panels, menus, and inputs.
- **Ink** (`#eef2ec`): Main text.
- **Forest** (`#9cc99f`): Secondary actions, borders, and focus.
- **Action** (`#79bb83`) with **on-action** (`#132116`): Primary action and selected states.

## Typography

**Display font:** Inter Tight, Arial, Helvetica, sans-serif.

**Body and control font:** Inter, Arial, Helvetica, sans-serif.

Use Inter Tight for headlines, panel titles, and prominent scores. Use Inter for paragraphs, labels, and controls. Landing-page headlines scale fluidly from mobile to desktop and use tight leading; application headings are compact. Use tabular numerals for scores and timers.

## Layout

Use Tailwind's 4px spacing scale, favouring 8px steps for larger groups. Keep reading widths comfortable and leave enough space around presentation graphics. Landing pages pair a short editorial introduction with a real product preview; tool introductions give the graphic enough room to read without crowding its supporting controls.

On mobile, stack introductory copy and previews, wrap controls without clipping, and keep touch targets at least 44px tall. Do not shrink a complex graphic until its content becomes unreadable; let the preview fit or scroll within its own focused region.

Discovery navigation links to tool introductions. Application navigation opens the scoreboard, leaderboard, bracket, and saved tables directly. Show the current destination and keep language and theme controls available.

## Elevation & Depth

Prefer tonal layering and fine borders over floating or glass-like surfaces. Use subtle shadows for menus, dialogs, and active editor layers where they clarify overlap; keep ordinary panels visually quiet.

## Shapes

Use restrained, consistent rounding: roughly 6px for form controls, 8px for buttons, and 12px for editor panels. Use thin green-tinted borders to define real sections. Scoreboard graphics may use their selected theme's custom radius, including square corners when requested.

## Components

### Buttons and inputs

Primary buttons use the action colour and its accessible on-action text. Secondary buttons use a transparent background, a light border, and forest text. Inputs are labelled, full-width where appropriate, and use the current paper or surface colour. Preserve visible keyboard focus and disabled states.

### Editors and previews

Keep each product's familiar task visible. Place save and PNG export where people expect them, provide a clear path to the product introduction, and group appearance and graphic-format controls plainly. Use Content, Design, Settings, and Export tabs on desktop, with an Edit/Preview switch on narrow screens. Start previews centered at a compact scale; offer Fit, full-size, and fullscreen views alongside the aspect-ratio selector. Keep saving explicit, preserve browser-local drafts, and show storage and export errors. Examples belong only in landing-page demonstrations.

### Leaderboards

Start with three editable teams at zero points. Edit entries and values directly in the graphic or table; provide quick score controls, add or remove rows, and reordering by points. Let users place ranked entries in one, two, or three side-by-side groups. Support custom canvas dimensions and aspect ratios without cropping content. Keep spreadsheet scrolling inside its own region and controls comfortably touchable.

### Brackets

Start with numbered participant placeholders and undecided matches. Let users add, remove, rename, and reorder participants, edit a name or score from the preview, and advance the chosen winner. Show one round at a time on narrow screens. Support custom canvas dimensions and aspect ratios without cropping the bracket. Confirm only when a participant or winner change invalidates results, and retain unaffected match results.

### Scoreboards

Preserve score controls, periods, timers, customization, fullscreen, URL sharing, backups, and existing scoreboard storage and deep links. Improve the surrounding editor and navigation without changing the meaning of saved boards.

## Do's and Don'ts

- Build landing-page previews from real product components, with demos clearly separate from saved user data.
- Keep core actions usable by touch and keyboard. Do not hide essential controls behind hover or animation.
- Use short, purposeful transitions and honour `prefers-reduced-motion`; pause optional demos when offscreen or when the page is hidden.
- Use labelled inputs, visible focus, readable contrast, keyboard-operable menus and dialogs, and avoid horizontal overflow in ordinary editing screens.
- Keep saving explicit and preserve local drafts. Do not silently change existing board data or route semantics.
- Do not use decorative metrics, empty mock dashboards, or oversized controls that crowd the graphic.
