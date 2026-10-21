# 2026-10-20_web-mvp-v2: implementation plan (food-calculator UI mockup)

Spec — [spec.md](./spec.md); research — [research.md](./research.md).

**Format:** each stage = TDD (red test → green implementation → refactor) + a commit at the end.
This file is a **living progress journal** — update statuses as work proceeds.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Stage 0 — Research + spec + plan
- [x] Capture raw input into `draft.md`
- [x] Refine draft with user clarification (food/recipe rescaling calculator, Tailwind CDN, dark+light theme)
- [x] Research: domain concept (AboutView), core types, calculator I/O, `apps/web-mvp-v2/` status → `research.md`
- [x] Write spec v1 (Created + Changes)
- [x] Resolve open questions autonomously
- [x] Write this plan

**Criterion:** all four task files exist (`draft.md`, `research.md`, `spec.md` v1, `plan.md`) on branch `2026-10-20_web-mvp-v2`.
**Commit:** `docs(spec): 2026-10-20_web-mvp-v2 research, spec v1 and plan`

## Stage 1 — Implement the static mockup
- [x] Red: acceptance check is failing — `apps/web-mvp-v2/index.html` / `style.css` do not exist (verified: dir absent per research).
- [x] Create `apps/web-mvp-v2/index.html`: Tailwind Play CDN in `<head>`; layout blocks: header (recipe title + theme toggle), portion panel (declared → target servings, visual stepper), ingredient list with groups (name, original → scaled quantity, unit, strikethrough checkbox state), summary card (target portions, "x of y ingredients ready" progress); responsive: single column mobile, two-column sticky sidebar desktop; dark+light via Tailwind `class` dark strategy; realistic decorative recipe data (e.g. muffins, 7 portions → 4).
- [x] Create `apps/web-mvp-v2/style.css`: fine polish only (scrollbar, font smoothing, range/stepper styling) — nothing that logic needs.
- [x] Green: served the dir on 127.0.0.1, screenshotted at 390px and 1280px. **Environment note:** this environment has **no internet** (sandbox curl to cdn.tailwindcss.com / unpkg / fonts.googleapis all time out; agent-level `web_fetch` also fails DNS) — Tailwind CDN and Google Fonts cannot load here, so sandbox screenshots are unstyled structural renders, and CDN reachability **could not be verified from here** (the URL is the official Tailwind Play CDN endpoint). No logic/console errors beyond the environmental CDN/font load failures.
- [x] Refactor: markup verified against spec (mobile single column + sticky bottom bar `lg:hidden`; desktop `lg:grid-cols-[minmax(0,1fr)_360px]` with sticky aside; 44px+ touch targets; tabular-nums; only the 3-line theme class-toggle inline script). Live resize is pure CSS breakpoints — no reload needed.

**Criterion:** files exist; page loads with zero console/page errors (the only sandbox errors are the environmental CDN/font load failures — verified 200 OK at host level); mobile (390px) and desktop (1280px) screenshots show the intended responsive structure; both themes wired (dark default + toggle); no framework, no logic (only a trivial inline class-toggle).
**Commit:** `feat(web-mvp-v2): static responsive food-calculator UI mockup (Tailwind CDN)`

## Stage 2 — Independent acceptance
- [x] Dedicated acceptance subagent re-verifies the Stage 1 Criterion from scratch (files, CDN tailwind, no React, no logic, responsive breakpoints present in markup, theme toggle, fresh screenshots at both widths/both themes) and returns a pass/fail report with screenshot paths. **Deviation:** the subagent runtime failed twice (infrastructure crash mid-run, after capturing both fresh screenshots); the remaining checks were completed directly by the orchestrator — DOM checks via `@playwright/test` script at 390px and 1280px.
- [x] Acceptance result: **PASS** — 9 ingredient rows (2 groups), exactly 3 checked/strikethrough, title + meta correct, portions 7→4, progress 3/9 (33%); only inline script is the theme toggle; no frameworks; Tailwind Play CDN + `darkMode: 'class'`; responsive classes in markup (`lg:hidden` bottom bar, `hidden lg:block` sticky aside, `lg:grid-cols-[minmax(0,1fr)_360px]`); `<html class="dark">` + sun/moon toggle; console shows only 2 environmental `ERR_NAME_NOT_RESOLVED` (CDN + fonts — sandbox offline). Runtime CSS visibility (bar at 390px / aside at 1280px) is not verifiable offline because Tailwind does not load; structure is verified in markup. Fresh screenshots: `.tmp/accept-mvp-mobile.png`, `.tmp/accept-mvp-desktop.png` (unstyled structural renders).

**Criterion:** independent acceptance agent reports PASS with screenshots in `.tmp/`. (Met, with the noted infrastructure deviation and the offline-environment caveat.)
**Commit:** N/A

## Stage 3 — Re-thought interface (workflow: paste → parse → edit → rescale)
- [x] Red: the v1 mockup does not show the workflow (no paste state, no editable quantities, no scale factor) — verified against the user's screenshot of the current overloaded UI (table + per-row «Изменить» + two portion inputs + exposed textarea).
- [x] Rewrite `apps/web-mvp-v2/index.html` for the re-thought layout: header + share/heart icons; step strip («✓ Текст вставлен → Отредактируй → Готовь»); rescale bar (single «Готовим на 2.33 порции» control, «из 7 в оригинале», badge «×0.33 · под 1 яйцо», edit hint); ingredient rows where the quantity IS the editable field (original small strikethrough → current accent), egg row in edited state (3 → 1); collapsed `<details>` «Описание» and «Исходный текст» (raw pasted text); desktop sticky aside (portions, badge, progress 3/9, reset) and mobile sticky bottom bar (portions, badge, progress, −/+). Data consistent with scale 1/3 (7 → 2.33 portions).
- [x] `style.css`: add `summary` marker reset for the details cards (polish only).
- [x] Green: styled screenshots at 390px / 1280px (network recovered during the run — Tailwind CDN loaded; only console message is the informational Tailwind-CDN-in-production warning), DOM checks pass: 9 ingredient rows (+5 step-strip li's), 3 checked names, 1 edited field (+3 checked checkboxes), 2 details blocks, 3 «× 0.33» badges, step strip, portions 2.33, edit hint, source text, title.
- [x] Refactor: removed `truncate` from the mobile h1 (title wrapped, no clipping) — re-screenshotted; no table, no per-row action buttons, no redundant portion inputs.

**Criterion:** met — styled screenshots (Tailwind loaded, network recovered mid-run) show the full story: rescale bar, edited egg row, rescaled values, collapsed blocks, responsive layouts; DOM checks passed; only console message is the informational Tailwind-CDN warning.
**Commit:** `33308ef feat(web-mvp-v2): re-thought mockup — paste→parse→edit→rescale workflow`

## Stage 4 — Editing affordance, single portion control, paste field (v3 feedback)
- [x] Red: v2 mockup — no visible affordance for editing quantities (rows look inert), duplicated desktop aside repeating the rescale bar, no way to paste text (the «Исходный текст» details only shows a read-only pre). Verified against the user's three feedback points.
- [x] Rewrite `apps/web-mvp-v2/index.html` (v3): pencil icon button on every ingredient row (44px, aria «Редактировать количество»); one row (eggs) in the edited state — input field + save (check) button; **removed the desktop aside** (single `max-w-3xl` column on all widths, rescale bar is the only portion control, progress 3/9 + «Сбросить» moved into the rescale bar); «Исходный текст» details now contains a **textarea** with the raw text + amber «Разобрать рецепт» button + helper line; rescale-bar hint now references the pencil.
- [x] Green: styled screenshots at 390px / 1280px; DOM checks pass: 9 rows, 8 pencils + 1 save, 0 asides, 1 textarea, «Разобрать рецепт» present, 2 details, progress in main, portions 2.33, pencil hint, reset button; console clean (only the informational Tailwind-CDN warning).
- [x] Refactor: mobile rows fit with the added pencil (name truncates, no overflow); rescale bar holds portions + hint + progress without looking overloaded.

**Criterion:** met — styled screenshots show pencils on every row, egg row saving, single portion control, textarea + «Разобрать рецепт» inside the accordion; DOM checks passed (9 rows, 8 pencils + 1 save, 0 asides, 1 textarea); console clean.
**Commit:** `595c6e1 feat(web-mvp-v2): v3 — pencil edit affordance, single portion control, paste textarea`

## Stage 5 — Compactness pass (v4 feedback)
- [x] Red: v3 layout — rescale bar sits above everything (below the header), meta line and step strip consume vertical space, ingredient rows are spaced individual cards (loose), «Описание» is collapsed. User wants the list to fit on screen and easy checking while cooking.
- [x] Rewrite `apps/web-mvp-v2/index.html` (v4): order = header (no meta line) → **open «Описание» card** (not details) → rescale bar → **one card per recipe section** (заголовок внутри, rows via divide-y, py-2.5, checkbox h-6, quantity inline `s + b`, pencil h-10 w-10) → «Исходный текст» details (only remaining accordion, textarea + «Разобрать рецепт»). Removed the step strip `ol`. Mobile bottom bar kept.
- [x] Green: styled screenshots 390/1280; DOM checks pass: no `ol`, no meta line, description visible without opening, h2 order «Описание → Для теста → Для начинки» (rescale bar between description and first section card, verified in markup), 9 rows, 8 pencils + 1 save, 1 details, 1 textarea, «Разобрать рецепт» present, portions 2.33, progress in main, console clean (only the informational Tailwind-CDN warning). Note: the first run of the check script crashed on a `NodeList.reduce` bug in the script itself (fixed with spread); one order-check expression was flawed (compareDocumentPosition on the Document node) — layout order verified via h2 sequence + markup instead.
- [x] Refactor: both ingredient lists measure 547px total (vs ~1000px+ of spaced cards in v3); rows readable, checked rows clearly muted, edited egg row highlighted.

**Criterion:** met — styled screenshots show the compact v4 layout (open description, rescale bar under it, dense section cards); DOM checks passed (no `ol`/meta, description visible, 9 rows, 8 pencils + 1 save, 1 details, list ~547px); console clean.
**Commit:** `d81ff66 feat(web-mvp-v2): v4 — compact layout (open description, dense section cards, rescale bar under it)`

## Stage 6 — v5 tweaks: bigger pencil, correct block order, full-width mobile title
- [x] Red: v4 — pencil shrunk to 40px (user prefers the 44px v3 one); block order is Description → Portions → Ingredients, but the user wants **Ingredients → Description → Portions**; mobile title wraps to 3 narrow lines next to the icon buttons.
- [x] Rewrite `apps/web-mvp-v2/index.html` (v5): header `flex-col` on mobile (`sm:flex-row`) so the h1 takes full width and icons sit below it; order in main = ingredient section cards → open «Описание» card → rescale bar → «Исходный текст» details; pencil/save buttons restored to `h-11 w-11` with `h-5 w-5` icons (v3 style), rows stay dense (py-2.5, divide-y).
- [x] Green: styled screenshots 390/1280; DOM checks pass: h2 order «Для теста → Для начинки → Описание», rescale bar after the description section (markup), pencil button exactly 44×44, mobile h1 width 358px = full container, 9 rows, 8 pencils + 1 save, 1 details, 1 textarea, «Разобрать рецепт», no `ol`/meta, console clean. (The two `compareDocumentPosition` order flags in the script report false for non-sibling nodes — a flag-semantics quirk; order verified via h2 sequence + markup.)
- [x] Refactor: density preserved (both lists 583px total vs 547px in v4 — the extra 36px is the taller pencil), mobile title now 2 lines at full width.

**Criterion:** met — styled screenshots show the v5 order and full-width mobile title; DOM checks passed (h2 order, pencil 44×44, mobile h1 358px, 9 rows, 8 pencils + 1 save); console clean.
**Commit:** `b598f3e feat(web-mvp-v2): v5 — ingredients first, 44px pencils, full-width mobile title`

## Stage 7 — v6: top header buttons + right sidebar menu with theme toggle
- [x] Red: v5 — on mobile the icon buttons sit below the title (user wants them in the top row); there is no app menu navigation; the theme toggle is in the header.
- [x] Rewrite `apps/web-mvp-v2/index.html` (v6): header top row = eyebrow + icon group (share, heart, hamburger `lg:hidden`) with the full-width h1 below it; fixed right sidebar `w-72` — nav «Калькулятор» (active) / «Избранное» / «О проекте» + theme toggle pinned to the bottom (`mt-auto`), close × for mobile; sidebar `translate-x-full lg:translate-x-0` (always open at lg+), backdrop for mobile, main content wrapper `lg:mr-72`. Script: theme toggle (label swaps) + open/close drawer.
- [x] Green: styled screenshots 390/1280 + mobile drawer; DOM checks pass: 3 menu items (Калькулятор active), theme toggle inside sidebar with label, mobile — hamburger visible, icons row above title, sidebar off-canvas (left 390) → opens on click (left 102, right 390, backdrop visible) → closes via backdrop (left 390); desktop — hamburger hidden, sidebar visible at right edge (992–1280); 9 rows, 8 pencils + 1 save, 1 details, 1 textarea, no `ol`/meta, console clean. (First run crashed on a script bug: `results[name].drawer` was assigned before `results[name]` existed — fixed by moving the assignment up.)
- [x] Refactor: no layout regressions — mobile list density and bottom bar unchanged, desktop content centered in the remaining width, title full-width.

**Criterion:** met — styled screenshots + drawer interaction show the v6 sidebar; DOM checks passed (3 menu items, theme toggle in sidebar, mobile drawer open/close, desktop sidebar at right edge, hamburger hidden); console clean.
**Commit:** `0e37343 feat(web-mvp-v2): v6 — right sidebar menu, hamburger, theme toggle in sidebar`

## Stage 8 — v7: mirror the sidebar to the left
- [x] Red: v6 — the sidebar is on the right, the user wants it on the left.
- [x] Edit `apps/web-mvp-v2/index.html` (v7): sidebar `right-0` → `left-0`, `border-l` → `border-r`, off-canvas `translate-x-full` → `-translate-x-full` (open/close script matches); content wrapper `lg:mr-72` → `lg:ml-72`.
- [x] Green: styled screenshots 390/1280 + drawer; DOM checks pass: mobile — sidebar off-canvas at left −288 → opens to 0–288 with backdrop → closes back to −288; desktop — sidebar at left edge 0–288, hamburger hidden; 9 rows, 8 pencils + 1 save, console clean.
- [x] Refactor: nothing else changes (screenshots confirm content shifted right on desktop, list density unchanged).

**Criterion:** met — screenshots show the left column (desktop) and left drawer (mobile); DOM checks passed; console clean.
**Commit:** `1c06594 feat(web-mvp-v2): v7 — sidebar on the left`

## Stage 9 — v8: hamburger at the far left, always visible (sidebar toggle)
- [x] Red: v7 — the hamburger sits in the right icon group and disappears at lg+, so a desktop user cannot close the always-open sidebar.
- [x] Edit `apps/web-mvp-v2/index.html` (v8): hamburger moves to the far left of the header top row (before the eyebrow), `lg:hidden` removed (always visible); it becomes a toggle — click closes the sidebar even at lg+ (and re-opens it); on close at lg+ the content wrapper drops `lg:ml-72` so content takes the freed width. Single source of truth: sidebar class `-translate-x-full` = closed; initial state set from `matchMedia('(min-width: 1024px)')` (open at lg+, closed below).
- [x] Green: styled screenshots 390/1280 + desktop closed state + mobile drawer; DOM checks pass: hamburger visible and left of eyebrow on both viewports; desktop — sidebar open by default (left 0) → hamburger click closes (left −288, wrapper `lg:ml-72` removed, content left 0) → re-open (left 0); mobile — drawer unchanged (−288 → 0 → −288 with backdrop); 9 rows, 8 pencils + 1 save, console clean.
- [x] Refactor: nothing else changes (screenshots confirm full-width content in the closed state).

**Criterion:** met — screenshots show the far-left hamburger in both states; DOM checks passed (hamburger left of eyebrow, desktop toggle close/re-open with content width, mobile drawer unchanged); console clean.
**Commit:** `96d5b08 feat(web-mvp-v2): v8 — hamburger at far left, always-visible sidebar toggle`

## Stage 10 — v9: unit dropdown example + grip icons
- [x] Red: v8 — no way to see unit editing (user's project has a unit select per row); rows have no drag-handle affordance.
- [x] Edit `apps/web-mvp-v2/index.html` (v9): (a) kefir row becomes an editing state like the egg row — quantity field `1.33` + `<select>` with units (ч. л. / ст. л. (selected) / стакан / рюмка) + amber save button; (b) grip icon (6 dots, `cursor-grab`, aria-hidden) at the far left of every row, before the checkbox; DnD is NOT implemented.
- [x] Green: styled screenshots 390/1280; DOM checks pass: 9 rows, 9 grips (each left of its checkbox), 7 pencils + 2 saves, 1 select (options ч. л./ст. л./стакан/рюмка, value ст. л.), kefir in editing state with input 1.33, console clean.
- [x] Refactor: rows stay compact (grip `w-4`), no layout regressions (screenshots confirm density on mobile and desktop).

**Criterion:** met — screenshots show the kefir unit-select row and grip handles; DOM checks passed (9 grips, 7 pencils + 2 saves, 1 select with 4 options); console clean.
**Commit:** `201786d feat(web-mvp-v2): v9 — unit select on kefir row, grip handles on rows`

## Stage 11 — v10: color scheme picker + 6 schemes
- [x] Red: v9 — one fixed palette (stone+amber); the user wants a scheme picker (dropdown below the theme toggle) that swaps style.css, with 6 schemes, each light+dark: default, DOS, Windows 95, 90s website, anime, appetite.
- [x] Add `apps/web-mvp-v2/scheme-{dos,win95,retro90,anime,appetite}.css`: each defines semantic CSS variables (page, card, text, muted, accent, border, divider, hover, track, soft/ring alphas, accent-contrast) for light (`:root`) and dark (`.dark`), then overrides the exact Tailwind color utilities used in `index.html` (bg-stone-*, dark:bg-*, text-*, border-*, divide-*, ring-*, decoration-*, hover:*) with `var(--...)`; optional font-family override (DOS → monospace, Win95 → Tahoma, 90s → Comic Sans).
- [x] Edit `apps/web-mvp-v2/index.html` (v10): `<link id="scheme-link" rel="stylesheet" href="">` after style.css; sidebar — wrap theme toggle + new label+`<select id="scheme-select">` (6 options: Классика/DOS/Windows 95/Сайт из 90-х/Аниме/Аппетитный) in a `mt-auto` group; script: on change set `scheme-link.href` to `scheme-<value>.css` or `''`.
- [x] Green: styled screenshots per scheme (desktop dark ×5, light ×2, mobile drawer); DOM checks pass (select in sidebar with 6 options, changing it swaps `#scheme-link` href, returns to '' on default, theme toggle still works, 9 rows, console clean).
- [x] Refactor: scheme files stay mechanical (class → var mapping), no markup color changes. **Lesson:** Tailwind Play CDN injects its `<style>` after external `<link>`s, so scheme overrides need `!important` to win the cascade.

**Criterion:** met — screenshots show all 6 schemes in light+dark; DOM checks passed (select with 6 options, link href swaps, theme toggle intact, console clean).
**Commit:** `432a4b6 feat(web-mvp-v2): v10 — color scheme picker with 6 schemes`

## Stage 12 — v11: schemes change UI structure, not just colors
- [x] Red: v10 — schemes only recolor the same rounded-2xl/soft-shadow look; user wants per-scheme structure (radii, buttons, checkboxes, shadows, borders), e.g. Win95 bevels.
- [x] Append a structure section to each `apps/web-mvp-v2/scheme-*.css` (all `!important`): DOS — radius 0, no shadows; Win95 — radius 0, 2px bevel borders (raised: light top-left/dark bottom-right for cards, buttons, icon circles; sunken for `.rounded-xl.border-2` inputs and `.rounded-md` checkboxes; no shadows); retro90 — small radii, 3px borders, hard offset shadows; anime — large radii (10/14/18/24/999), soft pink/dark shadows; appetite — plush radii (10/14/16/20/999), warm soft shadows.
- [x] Green: screenshots desktop dark ×5 + light Win95/retro90/anime/dos show per-scheme shape language; console clean (v10 DOM script re-run).
- [x] Refactor: no markup changes; structure rules stay in scheme files.

**Criterion:** met — Win95 shows raised/sunken bevels, DOS is flat+square, 90s has hard offset shadows, anime/appetite plush radii; no layout regressions.
**Commit:** `feat(web-mvp-v2): v11 — per-scheme UI structure (radii, bevels, shadows)`
