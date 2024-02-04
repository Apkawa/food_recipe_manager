Сборка базируется на [userscript-typescript-webpack](https://github.com/vannhi/userscript-typescript-webpack) плюс доработки

## Стек технологий

### Core

* typescript
* webpack
* eslint
* jest
* puppeteer

### UI

Будет реализована небольшая самописная библиотека по UI

Цель - изучить основные паттерны проектирования ui библиотек (state manager, router, dom, binding, etc), 
реализовать самый минимум необходимый для работы.

* https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf 
* https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p
* https://habr.com/ru/companies/ruvds/articles/416021/
* https://www.youtube.com/watch?v=Ii4VJbC0fgc

## Установка

1. git clone
2. `npm i`
3. `npm run build:watch`
4. Включить для Tampermonkey доступ к локальным урлам
5. Добавить в Tampermonkey содержимое `./debug.js` отредактиров @require на актуальный путь скрипта из `./dist`

## Именование коммитов

Подключен [commitlint](https://github.com/conventional-changelog/commitlint/#what-is-commitlint)

[Немного справки из хабра](https://habr.com/ru/company/yandex/blog/431432/)

- `build` 	Сборка проекта или изменения внешних зависимостей
- `ci` 	Настройка CI и работа со скриптами
- `docs` 	Обновление документации
- `feat` 	Добавление нового функционала
- `fix` 	Исправление ошибок
- `perf` 	Изменения направленные на улучшение производительности
- `refactor` 	Правки кода без исправления ошибок или добавления новых функций
- `revert` 	Откат на предыдущие коммиты
- `style` 	Правки по кодстайлу (табы, отступы, точки, запятые и т.д.)
- `test` 	Добавление тестов

Для корректного написания текста коммита, вызовите команду `git cz` или `npm run commit` и ответьте на вопросы


## Версии и changelog

Достаточно вызвать `npm run release`, и по содержанию коммитов поймет какую версию нужно проапдейтить

Или вручную `npm run release:[patch|minor|pre]`

https://docs.npmjs.com/about-semantic-versioning

- `patch` - багфиксы
- `minor` - добавляем новый сайт или фичу
- `major` - когда ломаем все или релиз.
- `pre` - пререлизная версия, тэги в гите не создаем 

Перед релизом желательно посмотреть что она обновит

```npm run release -- --dry-run```

В changelog попадают только `feat:` и `fix:`
