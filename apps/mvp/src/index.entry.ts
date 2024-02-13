import {ready} from './ui/core/events';
import {parseTextRecipe} from '@repo/food-recipe-core/src/food_recipe/core/parser/text';
import {Recipe} from '@repo/food-recipe-core/src/food_recipe/core/types/recipe';
import {recipeScale} from '@repo/food-recipe-core/src/food_recipe/core/calculator';
import {getUnitDisplay} from '@repo/food-recipe-core/src/food_recipe/core/i18n';

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
  <th>Единица измерения</th>
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
      }
      let concentration = '';
      if (i.type?.concentration) {
        concentration = `<input type="number" 
            value="${i.type.concentration}" style='width: 30px'/>%`;
      }
      html += `<tr><td>${i.name} ${concentration}</td> 
      <td>${value}</td>
      <td>${calcValue}</td>
      <td>${getUnitDisplay(i.unit, LANG, i.value)}</td>
      </tr>`;
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

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
function base64ToBytes(base64: string): string {
  const binString = atob(base64);
  return new TextDecoder().decode(Uint8Array.from(binString, (m) => m.codePointAt(0)));
}

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
function bytesToBase64(bytes: string): string {
  const binString = String.fromCodePoint(...new TextEncoder().encode(bytes));
  return btoa(binString);
}

ready(() => {
  const rawRecipeTextArea = document.getElementById('raw_recipe') as HTMLTextAreaElement;
  const parsedRecipe = document.getElementById('parsed_recipe') as HTMLDivElement;
  const scaleWrap = document.getElementById('scale_wrap') as HTMLDivElement;
  const scale = document.getElementById('scale') as HTMLInputElement;
  const newScale = document.getElementById('new_scale') as HTMLInputElement;

  setupSyncLocalStorageValue(scale, SCALE_KEY);
  setupSyncLocalStorageValue(newScale, NEW_SCALE_KEY);

  const params = Object.fromEntries(new URL(window.location.toString()).searchParams.entries());
  if (params[SCALE_KEY]) {
    scale.value = params[SCALE_KEY];
  }
  if (params[NEW_SCALE_KEY]) {
    newScale.value = params[NEW_SCALE_KEY];
  }

  const storeStateCb = () => {
    const url = new URL(window.location.toString());
    url.searchParams.set(SCALE_KEY, scale.value);
    url.searchParams.set(NEW_SCALE_KEY, newScale.value);
    url.searchParams.set(RAW_RECIPE_KEY, bytesToBase64(rawRecipeTextArea.value));
    window.history.replaceState('', '', url.toString());
  };

  scale.addEventListener('change', storeStateCb);
  newScale.addEventListener('change', storeStateCb);
  rawRecipeTextArea.addEventListener('change', storeStateCb);

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
    if (!value) {
      return;
    }
    localStorage.setItem(RAW_RECIPE_KEY, value);
    recipe = parseTextRecipe(value);
    console.log(recipe);
    updateScaleCb();
    scaleWrap.style.display = 'block';
  };

  scale.addEventListener('change', updateScaleCb);
  newScale.addEventListener('change', updateScaleCb);
  let recipe: Recipe;

  if (params[RAW_RECIPE_KEY]) {
    rawRecipeTextArea.value = base64ToBytes(params[RAW_RECIPE_KEY]);
  } else {
    if (localStorage.getItem(RAW_RECIPE_KEY)) {
      rawRecipeTextArea.value = localStorage.getItem(RAW_RECIPE_KEY);
    } else {
      rawRecipeTextArea.value = EXAMPLE_RECIPE;
    }
  }
  rawRecipeUpdateCb();

  rawRecipeTextArea.addEventListener('change', rawRecipeUpdateCb);
});
