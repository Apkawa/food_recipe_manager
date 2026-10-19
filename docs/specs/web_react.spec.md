# Спека: React-приложение `apps/web-react`

Полнофункциональный порт веб-приложения [`apps/web`](../../apps/web) (Vue 3) на React.
Существующее Vue-приложение остаётся в репозитории до достижения паритета и решения о деплое
(см. [Открытые вопросы](#открытые-вопросы)).

Доменная логика в приложение не дублируется: весь парсинг, масштабирование, конвертация единиц и
сериализация — через `@repo/food-recipe-core`. Справочник API — [docs/api/food-recipe.md](../api/food-recipe.md),
примеры использования — [docs/api/food-recipe-usage.md](../api/food-recipe-usage.md).

## Стек технологий

| Слой                | Выбор                | Версия                                | Примечание                                                                                            |
| ------------------- | -------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Runtime             | Node.js              | >= 22 (LTS)                           | системная нода — 22 LTS; корневой `engines` уже `>=22`; CI поднять с 18 на 22                         |
| Язык                | TypeScript, `strict` | ^5.6                                  | пресет `@repo/typescript-config/vite-react` (новый, см. план)                                         |
| UI                  | React                | ^19.2                                 | только функциональные компоненты + hooks; без class-компонентов, без Redux                            |
| Сборка / dev-сервер | Vite                 | ^5.4 (пока)                           | тот же major, что в `apps/web`; Vite 8 уже актуален — апгрейд отложен: перенесём, если будут проблемы |
| Роутинг             | react-router-dom     | ^6                                    | `createHashRouter` — hash-режим (GitHub Pages), паритет с hash-историей vue-router                    |
| Состояние           | zustand              | ^5                                    | + middleware `persist`; селекторы возвращают примитивы или используют `useShallow`                    |
| PWA                 | vite-plugin-pwa      | та же семья, что в `apps/web` (^0.19) | манифест, иконки, `file_handlers`, `registerType: 'autoUpdate'`                                       |
| Тесты               | vitest               | актуальная стабильная                 | + `@testing-library/react ^16` (поддержка React 19), `jsdom`                                          |
| Lint / формат       | Biome + tsc          | biome ^2.x                            | корневой `biome.json`; ESLint постепенно вытесняем, в web-react его нет                               |

Версии — ориентир на момент создания; при установке брать актуальную стабильную в пределах
обозначенного major'а.

## React + TS: соглашения по коду

Полная шпаргалка заведена в [docs/react/README.md](../react/README.md) (React + TypeScript cheatsheet).
Краткая выжимка — только то, что реально применимо к этому проекту:

- **Компоненты** — обычные функции, `React.FC` не нужен; props типизируются отдельно:

  ```tsx
  interface Props {
    value: number;
    onChange: (value: number) => void;
  }

  function ScaleControls({value, onChange}: Props) {
    /* ... */
  }
  ```

- **Типы vs интерфейсы** — по TL;DR шпаргалки «Use Interface until You Need Type»:
  `interface` для props и форм объектов состояния; `type` — для union'ов, `ReturnType`,
  вычисляемых типов.
- **Refs** — в React 19 `ref` это обычный проп функционального компонента:
  `forwardRef` больше не нужен (в проекте таких случаев пока нет, но пишем с оглядкой на это).
- **События** — для обработчиков JSX типы синтетических событий из `react`
  (`React.ChangeEvent<HTMLInputElement>`, `React.FormEvent`), а не DOM-типы;
  DOM-типы — только для нативных слушателей.
- **Хуки** — явные дженерики там, где TS не угадает: `useState<number>(1)`,
  `useRef<HTMLInputElement | null>(null)`; `useMemo`/`useCallback` — только по необходимости
  (производительность или стабильность identity для дочерних компонентов).
- **Не используем** (нет потребности, KISS): class-компоненты, Context (заменяет zustand),
  Error Boundaries, Suspense.

## Функциональный охват (паритет с apps/web)

| #   | Фича                                                                                                                                                 | Источник в Vue-приложении                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Калькулятор рецептов: парсинг текста, таблица ингредиентов по группам, пересчёт порций (`parseTextRecipe`, `recipeScale`)                            | `components/RecipeCalculator/RecipeCalculator.vue`                    |
| 2   | Инлайн-редактирование ингредиента: значение, единица (`getAvailableConvertUnits` + `convertIngredientUnit`), концентрация (`calculateConcentration`) | `IngredientLine/Edit.vue`, `EditUnitSelect.vue`                       |
| 3   | Пересчёт общего масштаба при ручном изменении одного ингредиента (customScale → `newScale`)                                                          | `RecipeCalculator.vue → ingredientUpdateCb`                           |
| 4   | «Copy/Share»: выпечка пересчитанных значений в текст, clipboard + `navigator.share`                                                                  | `RecipeShare.vue`                                                     |
| 5   | Избранное (localStorage): добавление/обновление по имени, список, открытие в калькуляторе, удаление                                                  | `stores/recipe.ts`, `RecipeFavoriteButton.vue`, `RecipeFavoriteList/` |
| 6   | Валидация полей масштаба (`< 0.1` → модалка «Не балуйся» с GrandMother)                                                                              | `RecipeCalculator.vue`, `GrandMother.vue`                             |
| 7   | Общий доступ к состоянию через URL: query-параметры `rawRecipe` (base64), `scale`, `newScale`                                                        | `RecipeCalculator/state.ts`                                           |
| 8   | О проекте: build-info (версия, ветка, коммит, дата) из env, инжект в Vite-конфиге                                                                    | `BuildInfo.vue`, `vite.config.ts`                                     |
| 9   | Утилиты: заглушка страницы с заголовками (концентрация, конвертер единиц, таблица плотности)                                                         | `views/HelpersView.vue`                                               |
| 10  | PWA: манифест «Кухонный калькулятор», иконки, `file_handlers` для `.txt`, autoUpdate                                                                 | `vite.config.ts → PWAOptions`                                         |

**Не входит в v1:** Storybook, e2e (nightwatch), рабочие утилиты на странице Helpers,
переключение языка (`LANG = 'ru'` захардкожено, как и в Vue-версии).

## Архитектура

### Принципы

1. **Core — домен, приложение — тонкий UI.** Ни одна бизнес-логика не дублируется в приложении;
   все вызовы идут в `@repo/food-recipe-core` (deep-imports, как в [usage guide](../api/food-recipe-usage.md)).
2. **Единый источник истины — три примитива:** `rawRecipe`, `scale`, `newScale`. Всё остальное
   (`parsedRecipe`, пересчитанные значения) — производные: вычисляются в контейнере через `useMemo`,
   в state не хранятся.
3. **Core мутирует объекты на месте** (`recipeScale`, `convertIngredientUnit`). Перед любыми
   мутирующими вызовами объект клонируется (`structuredClone`); мутации применяются только к копии.
4. **Текст — источник истины для рецепта.** После каждого редактирования состояния
   (значения/единицы/концентрации) рецепт сериализуется обратно в `rawRecipe` через `recipeToText`
   и сохраняется — ровно как в Vue-версии.

### Компоненты: контейнер / презентационный

Разделяем компонент с логикой (контейнер) и компонент с чистым рендером (презентационный),
но без излишней избыточности:

- **Контейнер** — владеет state, подписками на store, обработчиками событий; визуальной разметки
  у него нет, кроме композиции детей.
- **Презентационный** — props → JSX; вся интерактивность через controlled-props и колбэки;
  тестируется изолированно без сторов.
- Компонент **не делится**, если у него ни доступа к store, ни нетривиальной логики
  (views, `BuildInfo`, `GrandMother`) — один файл на компонент.

### Дерево компонентов

| Компонент                                                     | Тип                                  | Ответственность                                                                                                                                              |
| ------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `App`                                                         | композиция                           | layout: header с навигацией (Калькулятор / Избранное / О проекте), `RouterView`, footer c `BuildInfo` — как в `apps/web/src/App.vue`                         |
| `views/HomeView`, `FavoritesView`, `AboutView`, `HelpersView` | тонкие обёртки                       | по одному компоненту на маршрут, без разделения                                                                                                              |
| `RecipeCalculator`                                            | контейнер                            | store; производные parsed/scaled; валидация масштаба (модалка); обработчики `onRawChange`, `onScaleChange`, `onIngredientUpdate` (логика customScale)        |
| `ParsedRecipeTable`                                           | презентационный                      | таблица групп/ингредиентов, заголовки групп через `colspan`                                                                                                  |
| `IngredientLine`                                              | презентационный + локальный UI-state | чекбокс (зачёркивание), значение (`valueDisplay`), единица (`getUnitDisplay`), кнопка Edit; локально: `editMode`, `checked`                                  |
| `IngredientLineEdit`                                          | контейнер                            | черновик = `structuredClone(ingredient)`; ввод значения; выбор единицы; пересчёт концентрации; Save → колбэк вверх                                           |
| `UnitSelect`                                                  | презентационный                      | опции из `getAvailableConvertUnits` + `getUnitDisplay`; emit выбранной единицы                                                                               |
| `ScaleControls`                                               | презентационный (controlled)         | два числовых поля: «Рецепт на N порций», «Пересчитать на M порций»                                                                                           |
| `RawRecipeEditor`                                             | презентационный (controlled)         | textarea исходного текста рецепта                                                                                                                            |
| `RecipeShare`                                                 | контейнер                            | при открытии: клон + выпечка `calculated_value` в `value` + `recipeToText`; clipboard; `navigator.share` при `canShare`; readonly-textarea с select-on-focus |
| `RecipeFavoriteButton`                                        | тонкий контейнер                     | наличие рецепта в избранном по имени; текст «Добавить/Обновить избранное»                                                                                    |
| `FavoritesList`                                               | контейнер                            | список из store; клик → навигация на `/` с query; удаление; пустое состояние                                                                                 |
| `Modal`                                                       | UI-примитив                          | overlay + контент; props: `open`, `onClose`, children                                                                                                        |
| `GrandMother`                                                 | презентационный                      | easter egg (img + «Не балуйся») для модалки валидации                                                                                                        |
| `BuildInfo`                                                   | презентационный                      | версия/ветка/коммит/дата из `import.meta.env.VITE_*`                                                                                                         |

### Состояние (zustand)

```ts
// stores/recipe.ts — единственное состояние калькулятора
interface RecipeState {
  rawRecipe: string; // исходный текст рецепта (источник истины)
  scale: number; // «исходное» число порций
  newScale: number; // целевое число порций
}
```

- **Производные данные не хранятся.** `parsed = parseTextRecipe(rawRecipe)` и масштабированная
  копия (`structuredClone` → `recipeScale(clone, newScale / scale)`) — в `useMemo` контейнера.
- **Персистентность:** zustand `persist` с кастомной записью **плоских ключей** в localStorage —
  `'rawRecipe'`, `'scale'`, `'newScale'` (простые строки, не JSON) — те же имена и формат, что у
  Vue-приложения (`state.ts → saveStateLocalStorage`). Данные пользователя сохраняются между приложениями.
- **Избранное:** отдельный store `useFavoritesStore` с `RecipeItem[]`
  (actions: `add`, `addOrUpdateByName`, `getIndexByName`, `removeByIndex`, `updateByName` — паритет
  с Pinia-store), персист в ключ `'recipe-favorite'` как JSON-массив (формат Pinia `useStorage`).

**Приоритет при загрузке:** URL query > localStorage > дефолты (`EXAMPLE_RECIPE`, `1`, `1`).

**Синхронизация с URL:**

- При изменении состояния — replace текущей hash-локации с новым query (`replace: true`,
  новых записей в истории не создаём). В hash-роутере query живёт во фрагменте: `/#/?rawRecipe=...`.
- `rawRecipe` кодируется Unicode-safe base64 (хелперы идентичны Vue-версии, см. `state.ts`);
  `scale`/`newScale` — строки чисел.

### Структура каталогов

```
apps/web-react/
  index.html
  package.json              # name: web-react
  tsconfig.json             # extends @repo/typescript-config/vite-react
  vite.config.ts            # plugin-react, PWA, инжект build-info, alias @ → src
  public/                   # PWA-ассеты (скопированы из apps/web/public)
  src/
    main.tsx
    App.tsx                 # layout + RouterProvider
    env.d.ts                # типы VITE_GIT_* переменных
    router/index.tsx        # createHashRouter: /, /favorite, /about, /helpers
    stores/
      recipe.ts             # useRecipeStore (zustand + persist)
      favorites.ts          # useFavoritesStore
    lib/
      state.ts              # base64-хелперы, load/save состояния в URL/localStorage
      utils.ts              # cloneDeep, isNumber (порт apps/web/src/utils)
    components/
      ui/Modal.tsx
      BuildInfo.tsx
      GrandMother.tsx
      RecipeCalculator/
        RecipeCalculator.tsx        # контейнер
        ParsedRecipeTable.tsx       # презентационный
        IngredientLine.tsx
        IngredientLineEdit.tsx
        UnitSelect.tsx
        ScaleControls.tsx
        RawRecipeEditor.tsx
        RecipeShare.tsx
        RecipeFavoriteButton.tsx
        constants.ts                # EXAMPLE_RECIPE
        utils.ts                    # VULGAR_UNITS, valueDisplay
      RecipeFavoriteList/FavoritesList.tsx
    views/
      HomeView.tsx
      FavoritesView.tsx
      AboutView.tsx
      HelpersView.tsx
```

## PWA

- Конфигурация `VitePWA` — перенос `PWAOptions` из `apps/web/vite.config.ts`: манифест
  «Кухонный калькулятор», иконки 192/512, скриншоты, `file_handlers: text/plain → .txt`,
  `registerType: 'autoUpdate'`.
- Ассеты копируются из `apps/web/public/`: `pwa-*.png`, `maskable-icon-512x512.png`,
  `apple-touch-icon-180x180.png`, `favicon.ico`, `img/grandmother.jpg`, скриншоты в `pwa/`.

## Тестирование

| Слой                 | Что покрываем                                                                                                                                                                                                          | Инструмент                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Юнит: `lib/state.ts` | base64 round-trip (кириллица), парсинг query, приоритет URL > LS > дефолты, имена/формат ключей localStorage                                                                                                           | vitest                        |
| Юнит: stores         | actions избранного (add/update по имени/remove); persist-ключи рецепта совпадают с Vue-версией                                                                                                                         | vitest (+ jsdom/localStorage) |
| Юнит: `utils.ts`     | `valueDisplay`: vulgar-дроби для cup/tsp/tbsp/shot, диапазоны `[1,2]`, пустые значения                                                                                                                                 | vitest                        |
| Компоненты           | калькулятор: рендер примера, масштаб 1→6 меняет отображаемые значения; edit-строка: конвертация единиц и пересчёт концентрации; изменение ингредиента пересчитывает `newScale`; избранное: add/remove/открытие с query | @testing-library/react        |

Не тестируем презентационные обёртки без логики (правило KISS из требований к компонентам).

## Интеграция с монорепо

- Workspaces: `apps/*` уже покрывает новый каталог — изменений не требуется.
- `turbo.json`: добавить `web-react#dev` и `web-react#build` c
  `dependsOn: ["@repo/food-recipe-core#build"]` (паттерн как у `web`).
- Lint/формат: **Biome + tsc вместо ESLint.** Корневой `biome.json` (v2.x, recommended-правила,
  organizeImports) покрывает весь репозиторий; `.eslintrc` у web-react нет. Отказ от ESLint —
  постепенный: остальные приложения пока остаются на нём.
- Скрипты приложения: `format` — `biome format --write src/ build/`,
  `format:check` — `biome check src/ --write`, `type` — `tsc --noEmit -p .`;
  `@biomejs/biome` доустанавливается в корневые devDependencies (конфигурация корневая).
- Конфликт с Prettier: корневой `format` (Prettier) и pre-commit пока покрывают весь репозиторий —
  добавляем `apps/web-react/**` в `.prettierignore`, чтобы web-react форматировал только Biome.
- Корневой ESLint игнорирует `apps/**`, поэтому существующие lint-задачи web-react не трогают;
  type-check выполняется как часть `build`, шаг `biome check` в CI добавляется в фазе 6 плана.
- `packages/typescript-config`: новый пресет `vite-react.json`
  (`module: ESNext`, `moduleResolution: Bundler`, `jsx: react-jsx`, `noEmit`) — существующие
  (base/nextjs/react-library) не подходят под Vite-SPA.
- CI: `build` / `test` / `lint` подхватывают новый workspace автоматически через turbo.
  **Деплой web-react на GitHub Pages в рамках этой спеки не выполняется** — см. открытые вопросы.

## Открытые вопросы

Закрыты в фазе 6 плана; детали и задачи — в `docs/specs/web_react.status.md` (§ «Задачи на будущее»):

1. **Деплой:** v1 — параллельный деплой web-react на отдельный путь GitHub Pages (новый CI-шаг
   рядом с существующим); переключение деплоя на `apps/web-react/dist` и удаление Vue-приложения —
   отдельные задачи после проверки web-react в продакшене (HTTPS, установка на телефон, офлайн).
2. **Storybook** для презентационных компонентов — закрыто: не входит в v1 (KISS).
   Примечание: storybook 6.x в `apps/web` вложен с react@18 при root react@19 и может быть
   runtime-сломан — починка отдельной задачей, если Storybook станет нужен.

Решено заранее: React — 19.2 (актуальный мажор), Node — минимум 22 LTS, Vite остаётся ^5.4
(перенос на Vite 8 — только если возникнут проблемы).
