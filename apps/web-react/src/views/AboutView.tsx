import { Card } from "@repo/ui";

import BuildInfo from "../components/BuildInfo";
import GrandMother from "../components/GrandMother";
import { PageHeader } from "../components/PageHeader";

/** Text of the recipe-structure <pre> block. */
const RECIPE_STRUCTURE = `
Название рецепта (опционально)
Группа продукта (опционально)
Ингредиент 1 кг
Ингредиент2 2л
Группа2 (опционально)
Ингредиент3 3кг

Рецепт на 7 порций
---
Разделитель - только "-=#~" символы
Описание рецепта в свободной форме
###
Остальные разделители игнорируются
`;

/** Text of the recipe-example <pre> block. */
const RECIPE_EXAMPLE = `Маффины с капустой и грудинкой

яйца - 3 штук
соли - 1 ч.л.
кефира - 4 ст.л.
растительного масла - 1 ст.л.
муки - 3 ст.л.
разрыхлителя - 1 ч.л.
молодой капусты - 300 г

7 порций

###
Ставим выпекаться в предварительно разогретую до 200 градусов духовку на 20 минут.
https://ovkuse.ru/recipes/13004041
`;

/** Heading classes shared by the in-card section titles. */
const SECTION_TITLE = "text-xs font-bold uppercase tracking-wider text-muted";

/**
 * "About the project" page.
 * Port of apps/web/src/views/AboutView.vue (plus BuildInfo, per plan).
 */
function AboutView() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="О проекте" />
      <Card>
        <div className="flex flex-col gap-3 px-4 pb-4 pt-2 text-sm leading-relaxed">
          <p>Цель проекта - упростить адаптацию рецептов под конкретные задачи</p>

          <p className="text-text2">
            Основной сценарий - когда есть рецепт с ютуба/других источников простым текстом, и очень
            часто бывает так что количество порций слишком много/мало или в холодильнике лежит
            только определенное количество основного продукта
          </p>
          <p className="text-text2">
            Так же актуально для различного рода заготовок, когда нужно рецептуру пересчитать под
            необходимый объем
          </p>

          <p>Основные функции калькулятора:</p>
          <ul className="list-disc pl-5 text-text2">
            <li>Разбор текстового рецепта</li>
            <li>Пересчет количества порций от заявленного в рецепте количества</li>
            <li>Пересчет по основному продукту</li>
            <li>Пересчет концентрации уксуса</li>
            <li>Конвертация единиц измерения</li>
            <li>При наличии возможности пересчет из объема в массу и обратно</li>
            <li>
              Отметка списка зачеркнутым (для того чтобы не запутаться в том положили ли какой то
              ингредиент или нет)
            </li>
          </ul>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE}>Формат текстового рецепта</h2>
            <b>Структура рецепта</b>
            <pre className="overflow-x-auto rounded-field bg-inputd p-3 text-xs text-text2">
              {RECIPE_STRUCTURE}
            </pre>
            <b>Пример:</b>
            <pre className="overflow-x-auto rounded-field bg-inputd p-3 text-xs text-text2">
              {RECIPE_EXAMPLE}
            </pre>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE}>Предупреждение</h2>
            <p className="text-text2">
              Автор не несет ответственности за любые ошибки связанные с калькулятором и рецептами.
              Используйте на свой страх и риск, перепроверяйте результаты вычислений и вот это все
            </p>
            <p className="text-text2">
              Данный интерфейс находится на стадии MVP и в дальнейшем может быть сильно изменен
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE}>Обратная связь</h2>
            <p>
              Сообщения о ошибках отправляйте в{" "}
              <a
                className="text-accent underline"
                href="https://github.com/Apkawa/food_recipe_manager/issues"
              >
                github issues
              </a>
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className={SECTION_TITLE}>Лицензия</h2>
            <p>Проект распространяется по лицензии MIT</p>
            <p>
              <a
                className="text-accent underline"
                href="https://github.com/Apkawa/food_recipe_manager"
              >
                Github
              </a>
            </p>
          </section>

          <div>
            <GrandMother />
          </div>
          <BuildInfo />
        </div>
      </Card>
    </div>
  );
}

export default AboutView;
