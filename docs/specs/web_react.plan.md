# План реализации: `apps/web-react`

- **Спека:** [web_react.spec.md](./web_react.spec.md) — что делаем и почему.
- **Поведенческий эталон:** текущее Vue-приложение `apps/web` + [docs/api/](../api/) (API core).
- **Ключевые решения по стеку:** React ^19.2, Node >= 22 LTS (системная нода), Vite ^5.4 пока
  (перенос на Vite 8 — только если возникнут проблемы).
- **Статус:** черновик → в работе → готово (обновлять по ходу).

## Общие правила

1. **Паритет первым делом.** Каждая фича — порт соответствующего Vue-компонента; отклонения в
   поведении только там, где явно отмечены в спеке.
2. **Core не трогаем.** Если в core напоролся баг — отдельная задача с тестами в `packages/food-recipe-core`.
3. **Зелёный гейт на конец каждой фазы:** из корня — `npm run build --filter=web-react`
   (включает tsc), `npm run test --filter=web-react`, `npm run format:check --filter=web-react` (Biome).
4. Коммит на задачу; формат commitlint: `feat(web-react): …`, `test(web-react): …`.
5. **Согласования React + TS** — по выжимке в [спеке](./web_react.spec.md#react--ts-соглашения-по-коду);
   полная шпаргалка — [docs/react/README.md](../react/README.md).

## Фаза 0 — Каркас и интеграция в монорепо (S)

- [x] Создать `apps/web-react` (scaffold react-ts через `npm create vite@latest`, затем вычистить бойлерплейт).
- [x] `package.json`: имя `web-react`; скрипты: `dev`, `build` (type-check + build-only),
      `preview`, `test` (vitest run), `format` (`biome format --write src/ dist/`),
      `format:check` (`biome check src/ --write`), `type` (`tsc --noEmit -p .`). Скрипта `lint` нет — ESLint не используем.
- [x] Зависимости: `react ^19.2`, `react-dom ^19.2`, `react-router-dom ^6`, `zustand ^5`,
      `@repo/food-recipe-core`; dev: `typescript`, `vite ^5.4`, `@vitejs/plugin-react`, `vitest`,
      `@testing-library/react ^16` (поддержка React 19), `jsdom`, `vite-plugin-pwa`,
      `@types/react ^19`, `@types/react-dom ^19`. ESLint не ставим.
- [x] Lint/формат — **Biome + tsc**: `@biomejs/biome` доустановить в корневые devDependencies
      (корневой `biome.json` уже есть); добавить `apps/web-react/**` в `.prettierignore`, чтобы
      Prettier (корневой `format` / pre-commit) не трогал файлы web-react.
- [x] Новый пресет `packages/typescript-config/vite-react.json`
      (`module: ESNext`, `moduleResolution: Bundler`, `jsx: react-jsx`, `noEmit`) и подключить его из
      `apps/web-react/tsconfig.json`.
- [x] `turbo.json`: добавить `web-react#dev` и `web-react#build` c
      `dependsOn: ["@repo/food-recipe-core#build"]` (паттерн как у `web`).
- [x] Скопировать PWA-ассеты из `apps/web/public/` (иконки, `pwa/`, `img/grandmother.jpg`).

**Критерий:** `npm run build --filter=web-react` собирается; dev-сервер поднимает заглушку;
turbo видит задачи `web-react#*`.

## Фаза 1 — Скелет: роутер, views, build-info (S)

- [x] `src/router/index.tsx`: `createHashRouter`, маршруты `/` (home), `/favorite`, `/about`, `/helpers`
      (ленивая загрузка для non-home — как в Vue-роутере).
- [x] Views: `HomeView` (заглушка калькулятора), `FavoritesView`, `AboutView` (`BuildInfo`),
      `HelpersView` (три заголовка-заглушки).
- [x] Layout `App.tsx`: header с навигацией (Калькулятор / Избранное / О проекте) + footer c `BuildInfo` —
      по образцу `apps/web/src/App.vue`.
- [x] Инжект build-info в `vite.config.ts` (`git show` → `VITE_GIT_COMMIT_HASH/DATE/BRANCH_NAME`,
      `VITE_PACKAGE_VERSION`) — паттерн из `apps/web/vite.config.ts`; типы переменных в `src/env.d.ts`.

**Критерий:** все 4 маршрута рендерятся; `BuildInfo` показывает версию/ветку/коммит/дату.
Тест: роутинг по каждому маршруту (testing-library + memory-роутер).

## Фаза 2 — Слой состояния (M)

- [x] `src/lib/utils.ts`: `cloneDeep`, `isNumber` (порт `apps/web/src/utils/index.ts`).
- [x] `src/lib/state.ts`: `base64ToBytes`/`bytesToBase64` (Unicode-safe, идентичны Vue-версии),
      `loadStateFromQuery`, загрузка с приоритетом **URL > localStorage > дефолты**,
      сохранение в URL через replace (без новых записей истории).
- [x] `src/stores/recipe.ts`: zustand-store `{rawRecipe, scale, newScale}` + `persist` с записью
      **плоских ключей** `'rawRecipe'`, `'scale'`, `'newScale'` (простые строки — формат Vue-версии).
- [x] `src/stores/favorites.ts`: `RecipeItem[]`; actions `add`, `addOrUpdateByName`, `getIndexByName`,
      `removeByIndex`, `updateByName` (паритет с Pinia-store); persist в `'recipe-favorite'` как JSON.
- [x] Тесты: base64 round-trip с кириллицей; парсинг query; приоритет загрузки; точные имена/форматы
      localStorage-ключей (сравнение с поведением `apps/web/src/components/RecipeCalculator/state.ts`);
      actions избранного.

**Критерий:** состояние восстанавливается из URL/localStorage при перезагрузке; формат ключей
совпадает с Vue-приложением (пользовательские данные и ссылки остаются рабочими).

## Фаза 3 — Калькулятор рецептов (L)

- [ ] `components/ui/Modal.tsx` (overlay, props `open`/`onClose`).
- [ ] `RecipeCalculator/constants.ts`: `EXAMPLE_RECIPE` (копия из Vue-версии).
- [ ] `RecipeCalculator/utils.ts`: `VULGAR_UNITS`, `valueDisplay` (порт) + юнит-тесты
      (vulgar-дроби, диапазоны `[1,2]`, пустые значения).
- [ ] Контейнер `RecipeCalculator/RecipeCalculator.tsx`:
  - производные данные в `useMemo`: `parsed = parseTextRecipe(rawRecipe)`; масштабированная копия —
    `structuredClone(parsed)` → `recipeScale(clone, newScale / scale)` (core мутирует на месте);
  - валидация `scale`/`newScale < 0.1` → сброс + модалка с `GrandMother`;
  - `onIngredientUpdate(ingredient, g_i, i)`: логика customScale (`round(calculated/value, 3)`),
    замена ингредиента, ре-сериализация `rawRecipe = recipeToText(...)`.
- [ ] `ParsedRecipeTable.tsx` (презентационный): таблица, заголовки групп через `colspan='4'`,
      пропуск пустых имён групп.
- [ ] `IngredientLine.tsx`: чекбокс + зачёркивание, значение через `valueDisplay(calculated_value ?? value)`,
      единица через `getUnitDisplay`, кнопка Edit (скрыта для `unit === 'taste'`); локально: `editMode`, `checked`.
- [ ] `IngredientLineEdit.tsx`: черновик = клон ингредиента; числовое поле значения; `UnitSelect`;
      поле концентрации + `calculateConcentration` (для ингредиентов с `type.concentration`);
      Save → колбэк вверх.
- [ ] `UnitSelect.tsx`: опции из `getAvailableConvertUnits` c подписями `getUnitDisplay`.
- [ ] `ScaleControls.tsx`, `RawRecipeEditor.tsx` — controlled-компоненты (controlled-props + onChange).
- [ ] `GrandMother.tsx` (img `public/img/grandmother.jpg` + «Не балуйся»).

**Критерий:** все сценарии калькулятора работают как в `apps/web`:
вставить текст → таблица; масштаб 1→6 пересчитывает значения; ручное изменение ингредиента
пересчитывает `newScale` и остальных ингредиентов; конвертация единиц (объём ↔ мера, вес, через density);
изменение концентрации. Тесты: рендер примера, смена масштаба, edit-строка (единицы + концентрация),
пересчёт `newScale` при ручном вводе.

## Фаза 4 — Share и избранное (M)

- [ ] `RecipeShare.tsx`: по открытию — клон рецепта, `portion = calculated_portion`,
      `value = calculated_value` у всех ингредиентов, `recipeToText`; `navigator.clipboard.writeText`;
      `navigator.share` при `canShare`; readonly-textarea (select-on-focus).
- [ ] `RecipeFavoriteButton.tsx`: `isFavorited` по имени; текст «Добавить в избранное» / «Обновить избранное».
- [ ] `FavoritesList.tsx` + подключение в `FavoritesView`: список, клик → навигация на `/` c query
      (`rawRecipe` base64 от `recipeToText(recipe)`, `scale`, `newScale`), кнопка удаления, пустое состояние.
- [ ] Тесты: share-текст содержит пересчитанные значения и не мутирует исходный объект;
      добавление/обновление по имени; удаление; клик по избранному заполняет query маршрута.

**Критерий:** полный цикл «расчёт → избранное → открыть из списка» и «расчёт → Copy/Share» работают,
ссылка с query воссоздаёт состояние в новом окне (паритет с Vue-версией).

## Фаза 5 — PWA и проверка паритета (M)

- [ ] `vite.config.ts`: `VitePWA` c манифестом «Кухонный калькулятор» (перенос `PWAOptions` из
      `apps/web/vite.config.ts`): иконки, скриншоты, `file_handlers: text/plain → .txt`,
      `registerType: 'autoUpdate'`.
- [ ] Ручная таблица паритета против запущенного `apps/web` (один и тот же сценарий в обоих):

  | #   | Сценарий                                                            | web (Vue) | web-react |
  | --- | ------------------------------------------------------------------- | --------- | --------- |
  | 1   | Вставить текст рецепта → таблица с группами                         | ☐         | ☐         |
  | 2   | Масштаб 1→6, диапазон `[1,2]`, vulgar-дроби (cup/tbsp)              | ☐         | ☐         |
  | 3   | Ручное изменение ингредиента → пересчёт `newScale`                  | ☐         | ☐         |
  | 4   | Конвертация единиц в edit-строке (ml↔tbsp, g↔кг, через density)   | ☐         | ☐         |
  | 5   | Изменение концентрации (уксус и т.п.)                               | ☐         | ☐         |
  | 6   | Copy/Share: clipboard + share-sheet, текст с выпеченными значениями | ☐         | ☐         |
  | 7   | Избранное: добавить → обновить → открыть → удалить                  | ☐         | ☐         |
  | 8   | Ссылка с query (base64) воссоздаёт рецепт в новом окне              | ☐         | ☐         |
  | 9   | `scale = 0` → модалка «Не балуйся»                                  | ☐         | ☐         |
  | 10  | PWA: установка, иконки, офлайн-загрузка, открытие `.txt`            | ☐         | ☐         |

- [ ] Проверить, что service worker не кэширует dev-сборку при частых перезапусках.

**Критерий:** таблица паритета заполнена 100%; PWA устанавливается в браузер/телефон.

## Фаза 6 — CI, документация, решение о деплое (S)

- [ ] Поднять Node в `.github/workflows/ci.yml` с 18 на 22 (оба джоба) — базовая версия рантайма
      репозитория, корневой `engines` уже требует `>=22`.
- [ ] Добавить в CI шаг `biome check` для web-react (или скрипт `lint` = `biome check src/`,
      чтобы его покрывало существующее turbo lint).
- [ ] Запустить CI на ветке: `build` / `test` / `lint` зелёные для `web-react`.
- [ ] Обновить `AGENTS.md`: список приложений (+ `apps/web-react`, стек React), Key paths.
- [ ] Обновить `README.md`: как запустить/собрать `web-react`.
- [ ] Закрыть открытые вопросы спеки: деплой на GitHub Pages (отдельный path / замена `apps/web`),
      срок удаления Vue-приложения → оформить отдельными задачами.

## Риски и меры

| Риск                                                                                   | Мера                                                                                                                                  |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Core мутирует объекты, React ожидает неизменяемость                                    | Только `structuredClone` перед `recipeScale`/`convertIngredientUnit`; тесты, что исходный объект не изменился                         |
| Совместимость localStorage с Vue-приложением (плоские строковые ключи vs JSON)         | Юнит-тесты точных имён и форматов ключей; ручная проверка: данные из `apps/web` открываются в `web-react`                             |
| Query живёт во фрагменте hash (`/#/?…`) — легко сломать через `window.location.search` | URL-синхронизация только через location react-router; покрыто тестами фазы 2                                                          |
| Vite остаётся ^5.4, хотя актуален Vite 8                                               | Апгрейд отложен решением; переносим только если возникнут проблемы (отдельная задача)                                                 |
| React 19 — свежий мажор: старые примеры/туториалы пишутся под 18 (forwardRef и т.п.)   | Писать по шпаргалке [docs/react/README.md](../react/README.md) и выжимке в спеке; `forwardRef` не используем — `ref` это обычный проп |
| У Biome нет готового аналога eslint-plugin-react-hooks (exhaustive-deps)               | Принимаем: хук-логика простая; deps проверяются вручную и тестами компонентов                                                         |

## Definition of Done

- [ ] Таблица паритета (фаза 5) — все сценарии зелёные.
- [ ] `npm run build` / `npm run test` из корня — зелёные для `web-react`; `format:check` (Biome) чистый.
- [ ] PWA: манифест валиден, приложение устанавливается, офлайн работает.
- [ ] Тесты покрывают: состояние/URL/localStorage, парсинг+масштабирование через core, edit-строку, избранное.
- [ ] Спека и план обновлены; открытые вопросы закрыты или явно отложены с задачами.
