# Статус: портирование apps/web → apps/web-react (React)

> Финальный статус по завершении фазы 6.
> План: `docs/specs/web_react.plan.md` · Спека: `docs/specs/web_react.spec.md`

## Кратко: где мы

**Все фазы (0–6) выполнены**, ветка `issue_2_react_v2`:

| Фаза | Коммит | Содержание |
| ---- | ------ | ---------- |
| 0 — scaffold | `37f9ea1` | web-react app, turbo/npm-интеграция, TS strict, Biome, vitest |
| 1 — router/views/layout | `728e4f4` | hash-роутер, views, layout, build info |
| 2 — state-слой | `a0379a2` | zustand stores (recipe/favorites), URL/localStorage-синхронизация |
| 3 — калькулятор | `1ed2289` | RecipeCalculator + строки ингредиентов + модалки |
| 4 — share + favorites | `f2a7e7f` | RecipeShare, FavoriteButton, FavoritesView |
| 5 — PWA + паритет | `0b4631d` | vite-plugin-pwa (порт Vue-конфига), таблица паритета |
| 6 — CI/docs/финал | финальный коммит | Node 22 в CI, lint-скрипт, AGENTS/README/spec/status |

Гейты зелёные на каждом коммите: `npm run build/test --filter=web-react` + Biome;
в конце фазы 6 — root `npm run build`, `npm run test`, `npm run lint` (симуляция CI).

Тесты: **47/47** (`npm run test --filter=web-react`).

## Решённый блокер: два React в дереве

Решение применено и работает: **react@19 поднят в root devDependencies** (`"react": "^19.2.0"`, `"react-dom": "^19.2.0"`),
мёртвые react-devDeps удалены из `apps/web/package.json`. npm сам вложил react@18.3.1 в поддерево storybook 6.x
(у @storybook-пакетов non-peer зависимости на `^16||^17||^18`). Итог: ровно один react@19.2.8 для web-react и в
Vite-сборке, и в нативном require (vitest). npm overrides к peerDependencies НЕ применяются — проверено, блок убран.

**Замечание (принято):** часть @storybook-пакетов показывает `npm ls` "invalid deduped" против root 19;
Storybook в apps/web может быть runtime-сломан (ReactDOM.render удалён в React 19). Вне CI-гейта → задача T3.

## Фаза 2: что сделано

Файлы (все новые, `apps/web-react/src/`):
- `lib/utils.ts` — `cloneDeep`, `isArray`, `isNumber`, `isString` (порт `apps/web/src/utils/index.ts`).
- `lib/state.ts` — чистый (без роутера): `base64ToBytes`/`bytesToBase64` (Unicode-safe), `loadStateFromQuery`,
  `loadStateFromLocalStorage`, `loadState` (приоритет **URL > localStorage > дефолты**, scale/newScale через
  `round(Number.parseFloat(...), 2)`), `saveStateToUrl(url, state): URL` (чистая функция), `saveStateLocalStorage`
  (плоские строковые ключи `'rawRecipe'`/`'scale'`/`'newScale'`, только truthy), `readUrlQuery` (query в hash-фрагменте
  `#/?a=b` → fallback `window.location.search` — бэктворд-совместимость с Vue).
- `stores/recipe.ts` — zustand + persist. `flatStorage: StateStorage`: getItem → null (намеренно: rehydration ломал бы
  приоритет URL>LS, который резолвится один раз в loadState); setItem парсит `{state, version}` и пишет три плоских
  ключа; removeItem — все три. Обёрнут `createJSONStorage(() => flatStorage)`. Actions `setRawRecipe`/`setScale`/
  `setNewScale` = `set(...)` + `syncUrlToRouter(get())`: чистый `saveStateToUrl(new URL(href), state)`, очистка search
  до hash через `history.replaceState`, затем `router.navigate({pathname:"/", search}, {replace:true})`.
- `stores/favorites.ts` — `RecipeItem extends Recipe {created, updated: Date}`; actions `add`, `getIndexByName`,
  `addOrUpdateByName`, `removeByIndex`, `updateByName`; persist в `'recipe-favorite'` как **обычный JSON-массив**
  (формат Vue useStorage) через обёртку `favoritesStorage`.

Ключевые решения/баги:
- **Off-by-one Vue исправлен намеренно**: в Pinia-store `addOrUpdateByName` было `if (i > 0)` (пропускает индекс 0);
  в React — `i >= 0`. Задокументировано комментарием в коде.
- **zustand v5 persist**: `PersistOptions.storage` получает ОБЪЕКТ `{state, version}`, не строки → свои StateStorage
  шимы оборачивать `createJSONStorage(() => myStringStorage)`. Внешний `store.setState()` тоже триггерит persist-write.

Тесты (27: state 12 + recipe-store 4 + favorites 7 + router 4): base64 round-trip с кириллицей, парсинг query,
приоритет URL>LS>дефолты, округление 1.23456→1.23, точные имена плоских ключей, addOrUpdateByName на индексе 0,
формат persist избранного (обычный JSON-массив).

## Фазы 3–4: калькулятор, share, избранное

Компоненты (`apps/web-react/src/components/`): `RecipeCalculator` (контейнер), `ParsedRecipeTable` (+ inline edit row),
`IngredientLineEdit`, `ScaleControls`, `UnitSelect`, модалки концентрации и GrandMother, `RecipeShare`,
`RecipeFavoriteButton`; views: `CalculatorView`, `FavoritesView`.

Паритет с Vue (сверено по исходникам):
- display `<tr>` остаётся видимым вместе со строкой редактирования под ним;
- Share/FavoriteButton получают `parsedRecipe` (не масштабированную);
- двойное вложение `.modal-content` сохранено (UiModal + внутренний div в RecipeShare);
- core мутирует объекты in-place → всегда `structuredClone`/`cloneDeep` перед `recipeScale`/`convertIngredientUnit`.

## Фаза 5: PWA

- `vite.config.ts`: точный порт PWA-опций из `apps/web/vite.config.ts` (manifest, иконки, скриншоты,
  file_handlers для .txt), `registerType: "autoUpdate"`, workbox globPatterns/includeAssets.
- Проверено: сборка выдаёт `dist/sw.js`, `workbox-*.js`, `manifest.webmanifest` (23 precache entries);
  preview отдаёт `/sw.js` и `/manifest.webmanifest` со 200; артефакты идентичны Vue-приложению.
- **Dev-PWA включён** (`devOptions.enabled: true`) — осознанное отклонение от Vue-конфига (см. ниже).

### Почему dev-PWA безопасен по требованию «всегда свежие файлы»

Из исходников vite-plugin-pwa (0.19): в dev-режиме генерируется отдельный SW над `dev-dist/`, и его precache =
только статичные ассеты (`registerSW.js`, иконки, manifest с MD5-revision) — **код приложения в precache не
попадает вообще**. Модули всегда приходят из Vite dev-server (no-cache + HMR), workbox их не кэширует.
`registerType: autoUpdate` сохраняет поведение «моментальное обновление при новой версии» как в продакшене:
в production-сборке ассеты хэшированы → каждая сборка даёт новый `sw.js` → браузер сразу ставит новую версию,
старые precache-записи чистятся (`cleanupOutdatedCaches`). Установка проверена пользователем в браузере на дев-сервере.

## Отклонения от Vue (осознанные, задокументированы в коде)

1. **Off-by-one исправлен**: `addOrUpdateByName` — `i >= 0` вместо `i > 0` (коммент в `stores/favorites.ts`).
2. **Нет deep-watch сброса draft** при ре-рендере родителя: draft строки редактирования стабилен во время
   правки (комменты в `IngredientLineEdit.tsx`); concentration хранится числом.
3. **Явный `<tbody>`** в `ParsedRecipeTable` (Vue полагался на неявный).
4. **Index-keys и кликабельные `<a>`/`<div>` сохранены** с `biome-ignore`-комментами, цитирующими Vue-паритет
   (useValidAnchor/noStaticElementInteractions/useKeyWithClickEvents в FavoritesList, noArrayIndexKey в таблице,
   useExhaustiveDependencies в RecipeShare).
5. **`navigator.canShare?.()`** — optional chain для jsdom/тестов.
6. **Dev-PWA включён** (`devOptions.enabled`) — см. выше; Vue-конфиг его не имел.

## Задачи на будущее (из открытых вопросов спеки)

- **T1 — Деплой web-react на GitHub Pages:** новый CI-шаг, деплоящий `apps/web-react/dist` в отдельный
  target-folder (например `<branch>-react/`) параллельно с существующим; после проверки в продакшене
  (HTTPS, установка на телефон, офлайн) — решение о переключении основного деплоя на web-react.
- **T2 — Удаление Vue-приложения:** только после T1 и подтверждения паритета в проде: смена CI-deploy
  `apps/web/dist` → `apps/web-react/dist`, затем вынос `apps/web` из монорепозитория.
- **T3 — Storybook** (опционально): не входит в v1 (KISS). Если станет нужен: storybook 6.x в `apps/web`
  вложен с react@18 при root react@19 → вероятно runtime-сломан, понадобится апгрейд/замена.

## Критические факты окружения

- npm из этого окружения: `export npm_config_cache=/tmp/npm-cache-food-recipe`.
- Biome v2: `format:check` = `biome check src/ --write` (автофикс + ре-сортировка импортов — перечитывать файлы
  перед правками); один biome-ignore на правило, коммент над следующей строкой.
- Vitest без globals: явный `import {describe, it, ...} from "vitest"`, явный `cleanup()` в afterEach;
  локальный быстрый прогон: `cd apps/web-react && npx vitest run [file]`.
- Инвариант React: ровно один react@19.2.8 в корне для web-react (см. блокер выше).
- Core мутирует Recipe in-place → всегда клонировать перед масштабированием/конверцией.

## DoD (итоговый) — закрыт

- [x] Таблица паритета (фаза 5) — все сценарии зелёные (47 автотестов + сверка DOM/сценариев с Vue).
- [x] `npm run build` / `npm run test` из корня — зелёные для web-react; Biome чистый.
- [x] PWA: манифест валиден, установка проверена в браузере; офлайн по артефактам precache
      (ручная допроверка на телефоне/HTTPS — T1).
- [x] Тесты покрывают: состояние/URL/localStorage, парсинг+масштабирование через core, edit-строку, избранное.
- [x] Спека и план обновлены; открытые вопросы закрыты с задачами T1–T3.
