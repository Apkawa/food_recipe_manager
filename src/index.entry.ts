import {parseTextRecipe} from '@app/core/parser/text';
import {ready} from './ui/core/events';
import {Recipe} from '@app/core/types/recipe';
import {recipeScale} from '@app/core/calculator';
import {getUnitDisplay} from '@app/core/i18n';

const LANG = 'ru';

function renderRecipeTable(recipe: Recipe): string {
  let html = '';
  if (recipe.name) {
    html += `<h2>${recipe.name}</h2>`;
  }

  html += `<table>
  <colgroup>
  <col span="3" style="width: auto">
  <col span="3" style="width: 100px">
  <col span="3" style="width: 100px">
  </colgroup>
  <thead>
  <tr>
  <th></th>
  <th>Оригинал</th>
  <th>Пересчет</th>
  </tr>
</thead>
`;
  for (const g of recipe.ingredient_groups) {
    if (g.name) {
      html += `<tr><th colspan='2'>${g.name}</th></tr>`;
    }
    for (const i of g.ingredients) {
      let value = '';
      if (i.value) {
        value = i.value.toString();
        if (Array.isArray(i.value)) {
          value = i.value.join(' - ');
        }
      }
      let calcValue = '';
      if (i.calculated_value) {
        calcValue = i.calculated_value.toString();
        if (Array.isArray(i.calculated_value)) {
          calcValue = i.calculated_value.join(' - ');
        }
        calcValue += ` ${getUnitDisplay(i.unit, LANG, i.calculated_value)}`;
      }
      html += `<tr><td>${i.name}</td> 
      <td>${value} ${getUnitDisplay(i.unit, LANG, i.value)}</td>
      <td>${calcValue}</td></tr>`;
    }
  }
  html += '</table>';
  return html;
}

function setupSyncLocalStorageValue(el: HTMLInputElement | HTMLTextAreaElement, key: string): void {
  if (localStorage.getItem(key)) {
    el.value = localStorage.getItem(key);
  }
  el.addEventListener('change', () => {
    localStorage.setItem(key, el.value);
  });
}

const RAW_RECIPE_KEY = 'raw_recipe';
const SCALE_KEY = 'scale';
const NEW_SCALE_KEY = 'new_scale';
const EXAMPLE_RECIPE = `
Традиционный кимчи  
Кимчи выход 3,6 кг
Капуста пекинская 2,7 кг
Загуститель  
Вода 2 cup
Рисовая мука 2 ст.л.
Сахар 2 ст.л.
Соус  
Чеснок 0,5 cup
Имбирь 2 ч.л.
Лук репчатый 1 шт
Рыбный соус 0,5 cup
Перец кочукари 2 cup
Креветки ферментированые (saeujeot) 0,25 cup
Яблоки (опционально) 1 шт
Овощи  
Морковь 1 cup
Редис  2 cup
Зеленый лук 8 шт
`;

ready(() => {
  const rawRecipeTextArea = document.getElementById('raw_recipe') as HTMLTextAreaElement;
  const parsedRecipe = document.getElementById('parsed_recipe') as HTMLDivElement;
  const scaleWrap = document.getElementById('scale_wrap') as HTMLDivElement;
  const scale = document.getElementById('scale') as HTMLInputElement;
  setupSyncLocalStorageValue(scale, SCALE_KEY);
  const newScale = document.getElementById('new_scale') as HTMLInputElement;
  setupSyncLocalStorageValue(newScale, NEW_SCALE_KEY);

  const updateScaleCb = () => {
    const calculatedScale = Number.parseInt(newScale.value) / Number.parseInt(scale.value);
    if (!recipe) {
      return;
    }
    recipe = recipeScale(recipe, calculatedScale);
    parsedRecipe.innerHTML = renderRecipeTable(recipe);
  };
  const rawRecipeUpdateCb = () => {
    const value = rawRecipeTextArea.value;
    localStorage.setItem(RAW_RECIPE_KEY, value);
    recipe = parseTextRecipe(value);
    console.log(recipe);
    updateScaleCb();
    scaleWrap.style.display = 'block';
  };

  scale.addEventListener('change', updateScaleCb);
  newScale.addEventListener('change', updateScaleCb);
  let recipe: Recipe;

  if (localStorage.getItem(RAW_RECIPE_KEY)) {
    rawRecipeTextArea.value = localStorage.getItem(RAW_RECIPE_KEY);
    rawRecipeUpdateCb();
  } else {
    rawRecipeTextArea.value = EXAMPLE_RECIPE;
    rawRecipeUpdateCb();
  }

  rawRecipeTextArea.addEventListener('change', rawRecipeUpdateCb);
});
