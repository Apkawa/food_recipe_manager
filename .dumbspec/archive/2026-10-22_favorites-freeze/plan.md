# 2026-10-22_favorites-freeze: implementation plan (favorites freeze)

Spec — [spec.md](./spec.md); research — [research.md](./research.md).

**Format:** each stage = TDD (red test → green implementation → refactor) + a commit at the end.
This file is a **living progress journal** — update statuses as work proceeds.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Stage 0 — Research + spec + plan
- [x] `draft.md` (raw input)
- [x] initial `spec.md` + refinement gate (user approved)
- [x] Research (subagent): favorites store/flow, recipe view flow, core parser, dev-vs-prod (PWA SW), tests, TODOs
- [x] `research.md` written
- [x] `spec.md` v1 (Created + Changes)
- [x] `plan.md` (this file)

**Criterion:** all four task files exist; research contains paths/line refs for every suspect; spec v1 has no design gaps.
**Commit:** `docs(spec): add favorites-freeze task (draft, research, spec, plan)`

## Stage 1 — Reproduce & root-cause (deep investigation)
- [x] Build current master, serve `dist/`, Playwright: run the draft scenario → **FREEZE REPRODUCED on current code** (React #185 "Maximum update depth exceeded", 1049× render-loop; main thread unresponsive; CDP stack not capturable). Evidence: `.tmp/freeze-cdp.mjs`, `.tmp/freeze-cdp-result.txt`
- [x] Enumerate candidate historical commits: `e4f6199` (pre-`a2e429e`), `fe9d2df` (pre-`f7aabc4`), `e3e670c` (older)
- [x] Historical builds — **moot**: the freeze reproduces on the current code, so no historical version needs to be found
- [x] Locate the infinite loop: child/parent effect **phase-flip** — store `rawRecipe` flaps A→B→A→B (`RecipeCalculator.tsx:39-43` → `syncUrlToRouter` writes pre-apply store; `App.tsx:85-88` `applyFromQuery` reads render-time search). Proof: `.tmp/freeze-loop.harness.ts` (12/12 non-converging cycles, real modules)
- [x] Append the confirmed root cause to `research.md` (§7), incl. dev-vs-prod (dev converges; exact scheduling reason undetermined)

**Criterion:** a specific build freezes on the exact scenario; loop location (file:line) is recorded in `research.md`. (Criterion met: the CURRENT build freezes; loop located.)
**Commit:** `docs(spec): root cause for favorites freeze (effect phase-flip)`

## Stage 2 — Fix (per Stage 1 root cause)
- [x] Failing test capturing the regression (red first) — live code bug confirmed:
  - `stores/recipe-url-cycle.test.ts` (new): deterministic replay of the child→parent effect order with REAL `stores/recipe.ts` + `lib/state.ts`; red on old code (A/B flap), green after fix
  - `RecipeCalculator.test.tsx` (added): "does not re-call setScale when the parsed portion already equals the scale" — red on old code
- [x] Implement the fix — `RecipeCalculator.tsx:38-48`: guard `if (parsed.portion && scale !== Number(parsed.portion))` (+ `scale` in deps, comment why). Minimal; no SW/Workbox changes needed
- [x] Refactor — none: per KISS the one-line guard is the whole fix; `syncUrlToRouter` no-op-navigate hygiene deliberately left out (no failing test, no behavior change)

**Criterion:** failing test passes; scenario from the draft passes on a fresh production build.
**Commit:** `fix(web-react): guard setScale to break favorites phase-flip loop`

## Stage 3 — Verification
- [x] Playwright scenario on the local production build (fresh client, no stale SW) → **no freeze**, click→render 53 ms, 0 console errors, both directions work (`.tmp/favorites-freeze-verify.mjs`)
- [x] `pnpm build` + `pnpm test` (403/403) + `pnpm lint` green
- [ ] (post-deploy) check the real production URL `https://apkawa.github.io/food_recipe_manager/master/` with the scenario — **blocked on merge to master** (CI deploys master → `/master/`)

**Criterion:** all suites green; scenario passes on the production build. ✔
**Commit:** N/A

## Stage 4 — Close out
- [x] Move task dir to `.dumbspec/archive/2026-10-22_favorites-freeze/`
- [x] Final commit

**Criterion:** task archived; working tree clean.
**Commit:** `chore(spec): archive favorites-freeze task`
