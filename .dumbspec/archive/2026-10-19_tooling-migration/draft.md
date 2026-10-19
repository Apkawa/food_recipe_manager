# Draft: 2026-10-19_tooling-migration

## Raw input

> 1. перенести сборку с webpack на vite для packages/food-recipe-core ( хотя я не очень помню зачем там нужна сборка, я её не использую вроде)
> 2. jest на vitest
> 3. кое где остался eslint, перенести на biome
> 4. актуализировать ci на использование apps/web-react
> 5. apps/web можно выпиливать
>
> В целом избавляемся от лишних зависимостей webpack, jest и eslint
