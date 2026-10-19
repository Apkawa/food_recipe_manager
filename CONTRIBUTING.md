# Вклад в проект

Монорепозиторий на pnpm workspaces (pnpm 11). Все команды — из корня репозитория.

## Установка

```
pnpm install
```

## Основные команды

- Сборка всех пакетов и приложений: `pnpm build`
- Тесты: `pnpm test`
- Линт: `pnpm lint`
- Форматирование: `pnpm format`
- Проверка типов: `pnpm check`
- Разработка: `pnpm dev`
- Коммит с conventional-сообщением: `pnpm commit`
- Релиз: `pnpm release:patch` / `pnpm release:minor` / `pnpm release:pre`

Для конкретного пакета используется флаг `--filter`, например:

```
pnpm --filter web-react dev
```

## Компоненты

- `apps/web-react` — интерфейс на React 19 (PWA)
- `packages/food-recipe-core` — общая логика рецептов (парсер, калькулятор, единицы)
- `packages/typescript-config` — общие пресеты tsconfig

## Хуки (Husky)

Хуки git активны (устанавливаются автоматически при `pnpm install`). Pre-commit хук выполняет
`format + check + build` — это может быть медленно; при мелких правках можно пропустить с `--no-verify`.

## Catalog

Версии зависимостей и настройки централизованы в `pnpm-workspace.yaml` (pnpm catalog) —
добавляйте новые версии туда, а не по отдельности в каждый `package.json`.
