# Спека: доработки по итогам аудита (todo/fixes)

Результаты аудита монорепозитория (аудит 2025-08-19, ветка `issue_2_react_v2`).
Каждый крупный блок — самостоятельная задача; мелкие — чеклист в конце.
При переносе в issues: один раздел = один issue (ID из заголовка).

Контекст: `apps/web` (Vue) скоро удаляется, основным приложением становится `apps/web-react`.
Все ссылки на `apps/web` ниже означают «нужно убрать/заменить», а не «доработать Vue».

| ID     | Задача                                                | Приоритет | Зона                                             |
| ------ | ----------------------------------------------------- | --------- | ------------------------------------------------ |
| FIX-01 | CI: деплой web-react вместо apps/web                  | критично  | `.github/workflows/ci.yml`                       |
| FIX-02 | Персистентность: сброс состояния не сохраняется       | критично  | `web-react/src/stores`, `lib/state.ts`           |
| FIX-03 | Валидация входного состояния (NaN/битый base64)       | высоко    | `web-react/src/lib/state.ts`, `RecipeCalculator` |
| FIX-04 | Core: знак «воды» в разбавлении концентрации          | высоко    | `core/ingredient_type/calculate.ts`              |
| FIX-05 | Core: проценты с дробью («7.5%»)                      | высоко    | `core/ingredient_type/parse.ts`                  |
| FIX-06 | Core: классификация соли и regex уксуса               | высоко    | `core/ingredient_type/defined_types.ts`          |
| FIX-07 | Корневой package.json: чистка devDeps и конфигов      | высоко    | `package.json` (root)                            |
| FIX-08 | turbo.json: актуальный синтаксис, мёртвые outputs     | высоко    | `turbo.json`                                     |
| FIX-09 | food-recipe-core/package.json: чистка зависимостей    | средне    | `packages/food-recipe-core`                      |
| FIX-10 | Единый линтер/форматтер; lint без записи              | средне    | root, core, web-react                            |
| FIX-11 | Core: валидация конвертера и масштаба                 | средне    | `core/unit/convert.ts`, `calculator`             |
| FIX-12 | Core: пересборка regex типов при каждом вызове        | средне    | `core/ingredient_type/parse.ts`                  |
| FIX-13 | i18n в core/export: язык, запятые, плюрализация       | средне    | `core/export`, `core/i18n.ts`                    |
| FIX-14 | web-react: мелкие архитектурные доработки             | средне    | `apps/web-react`                                 |
| FIX-15 | Документация и мёртвые артефакты под новую реальность | средне    | docs, AGENTS.md, пакеты                          |
| FIX-16 | Косметика: чеклист мелких правок                      | низко     | разное                                           |

---

## FIX-01. CI: деплой web-react вместо apps/web

**Приоритет:** критично · **Зона:** `.github/workflows/ci.yml` (job `publish`)

### Проблема

Publish-джоб деплоит `folder: apps/web/dist` (Vue-приложение, которое будет удалено),
с комментарием «Потом когда сделаю версию на vue то поменяю на apps/web/dist/».
`apps/web-react` собрано с PWA (sw.js + manifest в dist), но в CI не деплоится вообще.
После удаления `apps/web` publish сломается, а React-версия так и не доживёт до прода.

### Что сделать

1. `folder: apps/web/dist` → `folder: apps/web-react/dist`.
2. Проверить стратегию target-folder для GitHub Pages (текущая логика `haya14busa/action-cond`:
   тег → `release`, иначе имя ветки) — она подходит и для web-react, но прогнать деплой
   на тестовой ветке до удаления apps/web.
3. В job `test` добавить явный билд web-react (сейчас покрывается общим `npm run build`).
4. Заодно: кэш `**/node_modules` через `actions/cache` — антипаттерн; заменить на
   встроенный кэш `actions/setup-node` (`cache: npm`) или убрать вовсе.

### Критерии приёмки

- Деплой ветки/тега кладёт артефакты `apps/web-react/dist` (sw.js, manifest) в Pages.
- CI зелёный после удаления `apps/web`.
- Локальный запуск PWA из деплоя: service worker регистрируется, precache работает.

---

## FIX-02. Персистентность: сброс состояния не сохраняется

**Приоритет:** критично · **Зона:** `apps/web-react/src/stores/recipe.ts`, `apps/web-react/src/lib/state.ts`

### Проблема

Паттерн `if (v)` (truthy-проверка) пропускает `0` и пустые строки сразу в трёх местах:

- `stores/recipe.ts` → `flatStorage.setItem` — при очистке рецепта/обнулении масштаба
  старые значения остаются в localStorage;
- `lib/state.ts` → `saveStateToUrl` (l.83) — старые query-параметры остаются в URL;
- `lib/state.ts` → `saveStateLocalStorage` (l.99) — то же для плоских ключей.

Пользовательский сценарий: очистить текст рецепта или обнулить масштаб → после перезагрузки
старое состояние «привозвращается» из localStorage/URL.

### Что сделать

1. Определить семантику пустого значения: запись `""`/`0` в ключ, либо удаление ключа
   (`localStorage.removeItem`, `searchParams.delete`) — и применить её единообразно во всех трёх местах.
2. В `loadState` уже корректно обрабатываются отсутствующие ключи (fallback на дефолты) — проверить парой тестов.
3. Добавить тесты: «очистил rawRecipe → после перезагрузки пустой/дефолтный рецепт»,
   «scale=0 не пишется как 0, если семантика = удаление».

### Критерии приёмки

- Сброс состояния в UI переживает перезагрузку страницы.
- Тесты покрывают все три точки записи (localStorage ×2 + URL).

---

## FIX-03. Валидация входного состояния (NaN / битый base64)

**Приоритет:** высоко · **Зона:** `apps/web-react/src/lib/state.ts`, `components/RecipeCalculator/RecipeCalculator.tsx`

### Проблема

1. `loadState → loadStateFromQuery`: `base64ToBytes` зовёт `atob()` без try/catch —
   битый `rawRecipe` в URL (ручная правка, обрыв) роняет приложение при загрузке
   (store создаётся синхронно в `create()`).
2. `scale/newScale`: `Number.parseFloat("abc")` → NaN; `round(NaN)` = NaN.
3. Guard в `RecipeCalculator.tsx` (l.46-57) проверяет только `scale < 0.1` — для NaN условие ложно:
   сломанный масштаб живёт в состоянии, `factor = newScale/scale` даёт NaN, таблица рендерится без пересчёта.

### Что сделать

1. Обернуть декодирование base64 в try/catch; при ошибке — fallback на дефолт (и console.warn).
2. В `loadState`: после parseFloat проверять `Number.isFinite`, иначе дефолт.
3. В guard-эффекте: условие `!Number.isFinite(scale) || scale < 0.1` (аналогично для newScale).
4. Тесты: битый base64, `scale=abc`, `scale=-5`, пустой query.

### Критерии приёмки

- Ни один мусорный URL не роняет приложение; состояние всегда валидно (числа finite, текст строка).
- Guard корректно сбрасывает NaN так же, как 0.05.

---

## FIX-04. Core: знак «воды» в разбавлении концентрации

**Приоритет:** высоко · **Зона:** `packages/food-recipe-core/src/food_recipe/core/ingredient_type/calculate.ts`

### Проблема

`calculateConcentrationDiluting`: `water = value - newValue`.
Для разбавления (20 мл 70% → 4%) результат **-330**: «добавить воду» выражается отрицательным числом,
для концентрирования — положительным. В коде уже висит `// TODO улучшить формулу`,
а тесты (`tests/unit/core/ingredient_type/calculateConcentration.test.ts` l.32, 36) закрепили отрицательные значения.

### Что сделать

1. Перевести результат в однозначную семантику: например `{value, waterAdded}`, где
   `waterAdded = newValue - value` (положительное — добавить, отрицательное — убрать).
2. Обновить TSDoc (`@returns`, примеры) и тесты; прогнать e2e-сценарий «разбавить уксус 70% до 9%».
3. Заодно: валидация аргументов (деление на `toConcentration=0` → Infinity сейчас не ловится).

### Критерии приёмки

- Для разбавления `waterAdded > 0`, для концентрирования `< 0`; ни одно «отрицательное добавление» в API не осталось.
- Тесты покрывают оба направления и нулевой/отрицательный вход.

---

## FIX-05. Core: проценты с дробью («7.5%»)

**Приоритет:** высоко · **Зона:** `packages/food-recipe-core/src/food_recipe/core/ingredient_type/parse.ts`

### Проблема

`CONCENTRATION_RE = /(\d+)\s*%/` — только целые числа. «уксус 7.5%» не распарсится:
процент останется в имени ингредиента, `type.concentration` не обновится.

### Что сделать

1. Паттерн → `\d+(?:[.,]\d+)?`; парсинг через `parseFloat` (запятая как разделитель).
2. Тесты: «уксус 7.5%», «vinegar 9%», «уксусная эссенция 80%», регрессия на целые значения.

### Критерии приёмки

- Дробные и целые проценты извлекаются одинаково; имя очищается от процента в обоих случаях.

---

## FIX-06. Core: классификация соли и regex уксуса

**Приоритет:** высоко · **Зона:** `packages/food-recipe-core/src/food_recipe/core/ingredient_type/defined_types.ts`

### Проблема

1. Regex `/сол[ьи]/gm` у `kosher salt` (density 1030) матчит просто «соль» → любая соль
   получает плотность кашерной, а не поваренной (table salt, 1300). Обычная «соль» должна мапиться в table salt.
2. `regexp: [/уксусa?/m]` у `vinegar` — `a?` (латинская a) явно не то, что задумывалось (`[ая]?`).

### Что сделать

1. Перестроить набор типов соли: `kosher salt` («кашерная соль») отдельно; общая «соль» → table salt.
2. Исправить regex уксуса; проверить порядок матчинга (vinegar acid перед vinegar — сохранить).
3. Тесты: «соль», «кашерная соль», «поваренная соль», «мелкая соль», «уксус», «уксусная эссенция».

### Критерии приёмки

- Плотность/концентрация по имени ингредиента соответствует ожидаемому типу; нет ложных срабатываний на подстроки.

---

## FIX-07. Корневой package.json: чистка devDeps и конфигов

**Приоритет:** высоко · **Зона:** `package.json` (root)

### Проблема

1. `react`/`react-dom` в root devDependencies — временный хак «решения блокера»
   (описан в `docs/specs/web_react.status.md`); у web-react эти зависимости уже есть.
2. `"turbo": "latest"` — недетерминированные обновления (любая установка может сменить мажор).
3. `babel.plugins: @babel/plugin-proposal-pipeline-operator` — плагин не установлен, конфиг мёртвый.

### Что сделать

1. Убрать react/react-dom из root devDependencies (после удаления apps/web; проверить, что vitest/tsc в web-react работают без них).
2. Зафиксировать конкретную версию turbo (или `^x.y.z`).
3. Удалить блок `babel`.

### Критерии приёмки

- `npm ci` воспроизводит идентичное дерево; build/test/lint зелёные после чистки.

---

## FIX-08. turbo.json: актуальный синтаксис, мёртвые outputs

**Приоритет:** высоко · **Зона:** `turbo.json`

### Проблема

1. Ключ `pipeline` — legacy (в Turbo ≥5 ожидается `tasks`; работает только благодаря бэксьюзу).
2. `outputs: [".next/**", ...]` — артефакт Next.js-шаблона; Next-приложений нет.
3. Блоки `web#dev`/`web#build`/`web-react#…` дублируют общее `dependsOn: ["^build"]`.

### Что сделать

1. Перевести на `tasks` (проверить версию turbo и её схему).
2. `outputs`: убрать `.next/**`; оставить `dist/**` (+ `!dist/.vite` если появится).
3. Убрать дублирующиеся per-app блоки; после удаления apps/web — и его зависимости.

### Критерии приёмки

- `turbo run build/test/lint` без warning'ов про deprecated; кэш работает (cache hit на повторном запуске).

---

## FIX-09. food-recipe-core/package.json: чистка зависимостей

**Приоритет:** средне · **Зона:** `packages/food-recipe-core/`

### Проблема

1. `jsdom-global` + `@types/jsdom-global` в **dependencies** — тестовые зависимости,
   уходящие к потребителям пакета (нарушение «core = чистый TS»).
2. ~30 лишних devDeps: puppeteer/jest-puppeteer, rxjs, node-fetch, user-agents,
   path-browserify, process, raw-loader… — наследие шаблона.
3. Свой `package-lock.json` внутри workspace (локи должны быть корневые).
4. `engines: node >=18` против корневых `>=22`.

### Что сделать

1. Перенести jsdom-global в devDependencies; удалить мёртвые devDeps (проверить импорты перед удалением).
2. Удалить вложенный `package-lock.json`; поднять engines на `>=22`.
3. Заодно: webpack-конфиг — убрать `mode: 'development'` хардкод и Terser с `beautify: true`
   (или заменить сборку библиотеки на tsc/bundle-подход без минификации).

### Критерии приёмки

- `npm i` у потребителя не тянет jsdom; build/test зелёные; дерево зависимостей core заметно тоньше.

---

## FIX-10. Единый линтер/форматтер; lint без записи

**Приоритет:** средне · **Зона:** root, `packages/food-recipe-core`, `apps/web-react`

### Проблема

1. core: `lint: eslint … --fix … && tsc --build` — `npm run lint` мутирует исходники
   (и это шаг внутри `build`).
2. web-react: `format:check: biome check src/ --write` — «чек» с записью.
3. Три системы форматирования одновременно: Prettier (root script + конфиг в package.json),
   Biome (`biome.json`, web-react), eslint-config-prettier внутри `@repo/eslint-config`.

### Что сделать

1. Выбрать один инструмент (фактически уже Biome для web-react) — или формализовать разделение:
   core → ESLint, web-react → Biome, и убрать Prettier из root-скриптов/конфига.
2. `lint` — только проверка (`--max-warnings=0`, без `--fix`); фиксы — отдельный скрипт `lint:fix`.
3. `format:check` — проверка без записи; запись — в `format`.

### Критерии приёмки

- `npm run lint` не меняет файлов (проверить через `git status` после запуска).
- Один форматтер на зону приложения; настройки не конфликтуют.

---

## FIX-11. Core: валидация конвертера и масштаба

**Приоритет:** средне · **Зона:** `packages/food-recipe-core/src/food_recipe/core/unit/convert.ts`, `calculator/index.ts`

### Проблема

1. `convertValueUnit` не проверяет пары единиц: для `pcs`/`portion` в `UnitConversions`
   нет коэффициента → тихий NaN; деление на 0 при `toConcentration=0`.
2. `recipeScale` не очищает устаревший `calculated_value` (если значение убрали)
   и не валидирует отрицательный/нулевой scale.
3. `calculateScale`: деление без проверки `value = 0` → Infinity.

### Что сделать

1. В `convertValueUnit`: бросать ошибку (или возвращать null) для несуществующих коэффициентов и невалидных пар.
2. В `recipeScale`: валидация scale (`Number.isFinite && > 0`), сброс `calculated_value` у ингредиентов без значения.
3. Тесты на граничные случаи: pcs→ml, scale=0, scale=-1, value=0.

### Критерии приёмки

- Ни один вызов не возвращает тихий NaN/Infinity; ошибки — явные.

---

## FIX-12. Core: пересборка regex типов при каждом вызове

**Приоритет:** средне · **Зона:** `packages/food-recipe-core/src/food_recipe/core/ingredient_type/parse.ts`

### Проблема

`parseIngredientType` зовёт `compileDefinedTypes()` на каждый вызов — все regexp
пересобираются заново, а парсер зовёт функцию для каждой строки рецепта.

### Что сделать

1. Скомпилировать список один раз на уровне модуля (лениво при первом обращении).
2. Заодно: заменить `t.name.startsWith('vinegar')` на явный флаг в `defined_types`
   (`concentrationFromName: true`), чтобы не зависеть от английского имени.

### Критерии приёмки

- Нет пересборки regexp после первого вызова; поведение без изменений (тесты зелёные).

---

## FIX-13. i18n в core/export: язык, запятые, плюрализация

**Приоритет:** средне · **Зона:** `packages/food-recipe-core/src/food_recipe/core/export/index.ts`, `core/i18n.ts`

### Проблема

1. `recipeToText` l.61: «Рецепт на N порций» хардкодом по-русски, игнорируя `lang`.
2. `valueToString`: `replace('.', ',')` — только первая точка; диапазон «1.5-2.5» → «1,5-2.5».
3. `getUnitDisplay`: параметр `value` не используется (плюрализация — TODO);
   `pinch: // TODO plural forms`.

### Что сделать

1. Вынести строки порций в таблицу переводов (`UNIT_TRANSLATIONS` или отдельная `TEXTS`).
2. Заменить на глобальный replace (или форматирование через `Number.toLocaleString(lang)`).
3. Решить судьбу плюрализации: реализовать (ru-формы для шт/ложек) или убрать параметр и TODO.

### Критерии приёмки

- `recipeToText(recipe, 'en')` без русских строк; дробные диапазоны корректны в обоих языках.

---

## FIX-14. web-react: мелкие архитектурные доработки

**Приоритет:** средне · **Зона:** `apps/web-react/`

### Проблема (сборная)

1. `tsconfig.json` extends `@repo/typescript-config/vite-react.json`, но package.json
   приложения не декларирует `@repo/typescript-config` — работает только за счёт хоистинга.
2. Роутер: нет catch-all `*`-маршрута (неизвестный путь = пустая страница).
3. В `App.tsx` ссылка «Утилиты» закомментирована, но маршрут `/helpers` жив и чанк собирается.
4. `RecipeShare`: открытие модалки сразу вызывает `navigator.share()` + запись в clipboard;
   в share URL уходит весь рецепт base64 (огромная ссылка).

### Что сделать

1. Добавить явную зависимость `@repo/typescript-config` (и проверить аналогично для eslint-пресетов).
2. Добавить 404-view (хоть заглушку) через `path: "*"`.
3. Решить по helpers: убрать маршрут или вернуть ссылку в навигацию.
4. RecipeShare: копирование/шаринг по явному действию (кнопка в модалке), а не при открытии.

### Критерии приёмки

- `npm ls` без phantom-зависимостей; 404 рендерится; share работает только по нажатию.

---

## FIX-15. Документация и мёртвые артефакты под новую реальность

**Приоритет:** средне · **Зона:** `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `packages/*`

### Проблема (сборная)

1. `AGENTS.md`: описывает `apps/mvp` как существующее и `apps/web` как актуальное;
   known issues про `.next/**` в turbo.json.
2. `README.md`: ссылка «MVP demo» на задеплоенный apps/mvp (приложения уже нет в дереве).
3. `CONTRIBUTING.md`: почти весь шаблон turborepo — `cd my-turborepo`, `pnpm build`
   (у проекта npm!), список mvp/web, упоминание eslint-config-next.
4. `packages/vite-config`: каталог без единого файла (нет даже package.json) — «incomplete» по AGENTS.md.
5. Мёртные пресеты: `typescript-config/nextjs.json`, `react-library.json` (потребителей нет),
   `eslint-config/react-internal.js`.
6. `docs/react/` — 18 файлов справочника React закоммичено в репо.

### Что сделать

1. Переписать AGENTS.md/README/CONTRIBUTING под реальность: web-react — основное приложение,
   apps/web и mvp удалены; команды через npm/turbo.
2. `vite-config`: дочинить (перенести общий vite-конфиг web-react) или удалить пакет + упоминания.
3. Удалить мёртные пресеты либо пометить в README пакета «not used yet».
4. `docs/react/` — решить: оставить (это рабочий справочник, ссылка из spec'и) или вынести из git.

### Критерии приёмки

- В docs нет ссылок на несуществующие пути; все упомянутые пакеты существуют и используются.

---

## FIX-16. Косметика: чеклист мелких правок

**Приоритет:** низко · Можно выполнять «между делом», отдельными коммитами.

- [ ] `RecipeCalculator.tsx` l.49,54 — убрать `console.log("Не балуй")` из продакшен-кода.
- [ ] `FavoritesList.tsx` l.55 — опечатка «каркурлятора» → «калькулятора».
- [ ] `RecipeCalculator/utils.ts` — `'cup'` два раза в `VULGAR_UNITS`.
- [ ] `lib/state.ts` — `saveStateLocalStorage`: мёртвый экспорт (никем не вызывается) — удалить или использовать.
- [ ] `IngredientLine.tsx` — checkbox `checked`: локальный state без функциональности — убрать или реализовать.
- [ ] `core/core/index.ts` — пустой файл (0 строк) — удалить.
- [ ] `BuildInfo.tsx` — при отсутствии env-переменных рендерит «undefined (undefined/undefined)» — скрыть строку целиком.
- [ ] `index.html` — добавить meta description / OG-теги для PWA.
- [ ] core webpack: убрать `mode: 'development'` хардкод, Terser с `beautify: true`.
- [ ] root `.eslintrc.js` — игнорирует всё (`apps/**`, `packages/**`) — конфиг фактически пустой; решить судьбу.
- [ ] `core/unit/constants.ts` — NO_VALUE_UNITS: комментарий «что то еще» — расширить список (на кончике ножа и т.п.).

---

## Порядок выполнения (рекомендация)

1. **FIX-01** (CI) — до удаления apps/web, чтобы деплой уже работал на web-react.
2. **FIX-02 + FIX-03** — пользовательские баги основного сценария.
3. **FIX-04…06** — корректность core (калькулятор/концентрации).
4. **FIX-07…10** — инфраструктурная чистка (можно параллельно с удалением apps/web).
5. **FIX-11…16** — по мере возможности.
