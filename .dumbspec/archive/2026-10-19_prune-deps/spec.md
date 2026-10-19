# 2026-10-19_prune-deps: чистка неактуальных зависимостей

**Created:** 2026-10-19T19:26:13+03:00

## Scope

Всё в scope находится в `packages/food-recipe-core/package.json` (devDependencies) и в catalog `pnpm-workspace.yaml`. `apps/web-react` и root — в порядке, их не трогаем (кроме dead-конфигов root, см. ниже).

**Удалить (подтверждено исследованием — ноль ссылок в коде/конфах/скриптах):**

1. Именованные пользователем:
   - `puppeteer`, `puppeteer-extra`, `puppeteer-extra-plugin-adblocker`, `puppeteer-extra-plugin-stealth`
   - `rxjs`
   - `node-fetch`, `@types/node-fetch`
   - `user-agents`, `@types/user-agents`
   - `path-browserify`
2. Найденные при аудите (наследие шаблона, ноль ссылок):
   - `process`, `fromentries`, `chalk`, `glob`, `@types/glob`, `@types/lodash`, `type-fest`, `tsconfig-paths`, `@tsconfig/recommended`, `@testing-library/dom`, `@babel/plugin-proposal-pipeline-operator`
3. Редундантные дубликаты в core (инструмент живёт в root):
   - `husky`, `standard-version`, `ts-node`, `@commitlint/cli`, `@repo/typescript-config`
   - `@commitlint/config-conventional` — из core удаляется, **но добавляется в root devDependencies**: commitlint-конфиг root (`.config/.commitlintrc.json`) его extends, а в root-манифесте его не было (до сих пор резолвился «на авось» из install-дерева core).
4. Borderline — решение принято:
   - `typesync` — удалить вместе со скриптом `synctypes` (конфига typesync нет, скрипт no-op).
   - `ts-node` (core) — удалить вместе с блоком `"ts-node"` в core `tsconfig.json` (CLI используется только из root).
5. Каталог и конфиги:
   - Удалить все вышеперечисленные пакеты из `catalog:` в `pnpm-workspace.yaml` (оставить только потреблённые entry).
   - Убрать `puppeteer` из `onlyBuiltDependencies`, `sharp` из `ignoredBuiltDependencies` (остаются `@swc/core`, `core-js`, `esbuild`).
   - Убрать dead-конфиги: `babel`-блок и `browserslist` в root `package.json` (потребителей нет), пустой `packages/food-recipe-core/.parcelrc`.
   - Store pnpm фиксируем внутри проекта: `storeDir: ./.cache/pnpm/v11` в `pnpm-workspace.yaml` (без этого pre-commit hook не может синхронизировать lockfile — глобальный store недоступен в песочнице). Пустой `.npmrc` (root) — удалить: pnpm 11 не читает из него не-auth настройки, строка `store-dir` в нём инертна.
   - Core `package.json`: починить устаревшие engines (`npm >=7` / `node >=18` → `node >=22`, без npm).

Out of scope:
- смена версий используемых пакетов;
- изменения в `apps/web-react` и `packages/typescript-config`;
- рефакторинг кода.

## Approach

1. Вырезать зависимости из `packages/food-recipe-core/package.json` (и скрипт `synctypes`).
2. Почистить `catalog:` и `onlyBuiltDependencies`/`ignoredBuiltDependencies` в `pnpm-workspace.yaml`.
3. Убрать dead-конфиги (babel/browserslist в root, `.parcelrc`, `.npmrc`, блок `ts-node` в core tsconfig, engines core).
4. `pnpm install` — пересобрать `pnpm-lock.yaml` (в нём сейчас ~30 мёртвых пакетов с transitives).
5. Проверка: `pnpm build`, `pnpm test`, `pnpm lint` (pre-commit hook и так гоняет format+check+build).
6. Коммит.

## Constraints

- pnpm 11 workspaces, версии — только через `catalog:` (manifests ссылаются на `catalog:`).
- Node >= 22, pnpm 11.
- `food-recipe-core` — чистый TS, без UI-зависимостей (после чистки это станет ещё более очевидно).
- Pre-commit hook выполняет полный `format + check + build` — может быть медленно, но это проверка работоспособности.
- `apps/web-react` и `root` манифесты не трогаем (все их зависимости в использовании).

## Open questions

- none (borderline-пакеты `typesync` и `ts-node` в core решены в Scope п.4; всё остальное подтверждено аудитом).

## Changes

- 2026-10-19T19:26:13+03:00 -- v1, initial spec (draft + research): подтверждено, что все 5 именованных пакетов + 4 компаньона мёртвы; аудит добавил ещё 11 мёртвых devDeps, 6 дубликатов и dead-конфиги (babel/browserslist/.parcelrc/.npmrc/allowBuilds).
- 2026-10-19T20:24:33+03:00 -- `.npmrc` не удаляем, а фиксируем в нём `store-dir=./.cache/pnpm/v11`: без project-local store pre-commit hook падает с `ERR_SQLITE_ERROR` при автосинхронизации lockfile.
- 2026-10-19T20:31:00+03:00 -- pnpm 11 игнорирует не-auth настройки в `.npmrc` (проверено эмпирически): `storeDir: ./.cache/pnpm/v11` уходит в `pnpm-workspace.yaml`, пустой `.npmrc` всё-таки удаляется.
- 2026-10-19T21:05:00+03:00 -- `@commitlint/config-conventional` переезжает из core в root devDependencies: root-конфиг commitlint его extends, после удаления из install-дерева commit-msg hook падал с `MODULE_NOT_FOUND`.
- 2026-10-19T22:14:47+03:00 -- Критерий приёмки Stage 3 уточнён: из `pnpm-lock.yaml` исчезают все удалённые пакеты как *прямые* зависимости (importer-записи) и как сиротские entry; `rxjs` (@6.6.7, @7.8.2) остаётся легитимной транзитивной зависимостью `inquirer` через `cz-customizable`/`commitizen` (живые root devDeps) — это не «неактуальная зависимость». `puppeteer`, `node-fetch`, `user-agents`, `path-browserify` должны отсутствовать в lockfile полностью.
