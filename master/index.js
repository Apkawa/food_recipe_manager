
(() => {
    "use strict";
    function round(n, parts = 2) {
        const i = Math.pow(10, parts);
        return Math.round(n * i) / i;
    }
    Object.keys;
    Object.entries;
    Object.values;
    function stripLine(t) {
        t = t.trim();
        t = t.replace(/^(?:[^\p{L}\p{N}()]+)?(.+?)(?:[^\p{L}\p{N}()]+)?$/gmu, "$1");
        t = t.replace(/\p{Zs}+/gmu, " ");
        return t;
    }
    const VOLUME_UNITS = [ "l", "ml" ];
    const WEIGHT_UNITS = [ "kg", "g" ];
    const MEASURE_UNITS = [ "tsp", "tbsp", "cup", "pinch", "pcs" ];
    const VALUE_UNITS = [ ...VOLUME_UNITS, ...WEIGHT_UNITS, ...MEASURE_UNITS ];
    const NO_VALUE_UNITS = [ "taste" ];
    const UNITS = [ ...VALUE_UNITS, ...NO_VALUE_UNITS ];
    const UNIT_MAP = {
        pcs: [ "шт", "pcs", "ps", "зубчик(?:а|ов)?", "штук(?:а|и)?" ],
        l: [ "л", "литр", "litre", "l" ],
        ml: [ "мл", "миллилитр", "ml", "millilitre" ],
        kg: [ "кг", "килограмм", "kg", "kilogram" ],
        g: [ "г", "гр", "грамм", "g", "gram" ],
        tsp: [ "(?:ч\\.|чайн(?:ая|ые))\\s*?(?:л\\.|ложк[аи])", "tea\\s*spoons?", "tsp" ],
        tbsp: [ "(?:ст?\\.|столов(?:ая|ые))\\s*?(?:л\\.|ложк[аи])", "table\\s*spoons?", "tbsp" ],
        cup: [ "стакан(?:а|ов)?", "ст", "cup" ],
        pinch: [ "щепотка", "pinch" ],
        taste: [ "по вкусу", "to taste" ]
    };
    const VULGAR_MAP = {
        "¼": .25,
        "½": .5,
        "¾": .75,
        "⅐": 1 / 7,
        "⅑": 1 / 9,
        "⅒": .1,
        "⅓": 1 / 3,
        "⅔": 2 / 3,
        "⅕": .2,
        "⅖": .4,
        "⅗": .6,
        "⅘": .8,
        "⅙": 1 / 6,
        "⅚": 5 / 6,
        "⅛": .125,
        "⅜": .375,
        "⅝": .625,
        "⅞": .875
    };
    const DECIMAL_MAP = Object.fromEntries(Object.entries(VULGAR_MAP).map((([vulgar, decimal]) => [ decimal, vulgar ])));
    const FRACTION_REGEXP = new RegExp(/^\d+\/\d+/);
    const DECIMAL_REGEXP = new RegExp(/^\d*\.+\d*$/);
    const hasMapping = value => {
        if (typeof value === "string") return Object.keys(VULGAR_MAP).includes(value);
        if (typeof value === "number") return Object.keys(DECIMAL_MAP).includes(String(value));
        return false;
    };
    const toVulgar = decimal => hasMapping(decimal) ? DECIMAL_MAP[decimal] : decimal.toString();
    const toDecimal = value => hasMapping(value) ? VULGAR_MAP[value].toString() : value;
    const parseVulgars = str => {
        const splitStr = str.split(" ");
        return splitStr.map((substr => {
            if (FRACTION_REGEXP.test(substr)) {
                const [a, b] = substr.split("/");
                const decimal = parseInt(a, 10) / parseInt(b, 10);
                return hasMapping(decimal) ? toVulgar(decimal) : substr;
            }
            if (DECIMAL_REGEXP.test(substr)) {
                const [whole, fraction] = substr.split(".");
                const decimal = parseFloat(`.${fraction}`);
                const vulgar = toVulgar(decimal);
                return parseInt(whole, 10) ? `${whole} ${vulgar}` : vulgar;
            }
            return substr;
        })).join(" ");
    };
    const VULGAR_LETTER_REGEXP = /(?:\p{No}|\d+\s*\/\s*\d+)/u;
    function parseNumber(s) {
        if (VULGAR_LETTER_REGEXP.test(s)) {
            s = stripLine(s).replace(/\p{Zs}/gu, "");
            s = parseVulgars(s);
            s = toDecimal(s);
        }
        const n = parseFloat(s.replace(",", "."));
        if (!isNaN(n)) return round(n, 2);
        return null;
    }
    function isRegexp(value) {
        return toString.call(value) === "[object RegExp]";
    }
    function mRegExp(regExps, flags) {
        return RegExp(joinRegExp(regExps), flags);
    }
    function joinRegExp(regexps, separator = "") {
        return regexps.map((function(r) {
            if (isRegexp(r)) return r.source;
            return r;
        })).join(separator || "");
    }
    const WORD_BOUNDARY_END = /(?=\s+|[.,);/]|$)/;
    function buildUnitRegexp(unit_type, units) {
        return RegExp(`(?<${unit_type}>${units.join("|")})\\.?`);
    }
    const recipe_line_DECIMAL_REGEXP = /(?:\d+[,.]\d+|\d+)/u;
    const DECIMAL_WITH_VULGAR_REGEXP = mRegExp([ "(?:", VULGAR_LETTER_REGEXP, "|", recipe_line_DECIMAL_REGEXP, ")" ], "u");
    const VALUE_RANGE_DELIMITER_REGEXP = RegExp(/(?<value_range>\s*\p{Pd}\s*)/u);
    const VALUE_REGEXP = mRegExp([ "(?<value>", DECIMAL_WITH_VULGAR_REGEXP, VALUE_RANGE_DELIMITER_REGEXP, DECIMAL_WITH_VULGAR_REGEXP, "|", DECIMAL_WITH_VULGAR_REGEXP, ")" ], "u");
    const UNIT_REGEXP = mRegExp([ "(?:", VALUE_REGEXP, /\s?/, "(?<unit>", ...VALUE_UNITS.map((k => buildUnitRegexp(k, UNIT_MAP[k]).source)).join("|"), ")", "|", "(?<no_value_unit>", ...NO_VALUE_UNITS.map((k => buildUnitRegexp(k, UNIT_MAP[k]).source)).join("|"), ")", ")\\.?", WORD_BOUNDARY_END ], "u");
    function parseRecipeLine(raw_line) {
        var _a;
        let groups;
        let name;
        for (const regexp of [ UNIT_REGEXP, VALUE_REGEXP ]) {
            groups = ((_a = regexp.exec(raw_line)) === null || _a === void 0 ? void 0 : _a.groups) || {};
            if ((groups === null || groups === void 0 ? void 0 : groups.value) || (groups === null || groups === void 0 ? void 0 : groups.no_value_unit)) {
                name = stripLine(raw_line.replace(regexp, ""));
                break;
            }
        }
        if (!groups) return null;
        if (!(groups.value || groups.value_range) && !groups.no_value_unit) return null;
        const ingredient = {
            name
        };
        if (groups.value) {
            let value;
            if (groups.value_range) {
                value = [];
                for (const v of groups.value.split(VALUE_RANGE_DELIMITER_REGEXP)) {
                    const n = parseNumber(v);
                    if (n) value.push(n);
                }
            } else value = parseNumber(groups.value);
            ingredient.value = value;
        }
        for (const t of UNITS) if (groups[t]) ingredient.unit = t;
        if (!ingredient.unit) ingredient.unit = "pcs";
        return ingredient;
    }
    function parseTextRecipe(raw_text) {
        const recipe = {
            name: "",
            ingredient_groups: []
        };
        let group = {
            name: "",
            ingredients: []
        };
        let i = 0;
        const lines = raw_text.trim().split("\n");
        lines.push("###");
        for (const line of lines) {
            if (!line.trim()) continue;
            const result = parseRecipeLine(line);
            if (result) {
                if (i == 1 && !result.name && recipe.name) {
                    group.name = recipe.name;
                    recipe.name = "";
                }
                group.ingredients.push(result);
            } else {
                const name = stripLine(line);
                if (i == 0) recipe.name = name; else {
                    if (group.ingredients.length > 0) {
                        if (group.ingredients.length == 1 && group.name && !group.ingredients[0].name) {
                            const newGroup = recipe.ingredient_groups.length > 0 ? recipe.ingredient_groups.pop() : {
                                name: "",
                                ingredients: []
                            };
                            newGroup.ingredients.push(Object.assign(Object.assign({}, group.ingredients[0]), {
                                name: group.name
                            }));
                            group = newGroup;
                        }
                        recipe.ingredient_groups.push(group);
                    }
                    if (name === "###") break;
                    group = {
                        name,
                        ingredients: []
                    };
                }
            }
            i++;
        }
        return recipe;
    }
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }
    function checks_isRangeIngredient(ingredient) {
        return Array.isArray(ingredient.value);
    }
    function recipeScale(recipe, scale) {
        for (const group of recipe.ingredient_groups) for (const ingredient of group.ingredients) {
            if (!ingredient.value) continue;
            if (checks_isRangeIngredient(ingredient)) ingredient.calculated_value = [ ...ingredient.value ].map((v => round(v * scale))); else ingredient.calculated_value = round(ingredient.value * scale);
        }
        return recipe;
    }
    function renderRecipeTable(recipe) {
        let html = "";
        if (recipe.name) html += `<h2>${recipe.name}</h2>`;
        html += "<table>";
        for (const g of recipe.ingredient_groups) {
            if (g.name) html += `<tr><th colspan='2'>${g.name}</th></tr>`;
            for (const i of g.ingredients) {
                let value = "";
                if (i.value) {
                    value = i.value.toString();
                    if (Array.isArray(i.value)) value = i.value.join(" - ");
                }
                let calcValue = "";
                if (i.calculated_value) {
                    calcValue = i.calculated_value.toString();
                    if (Array.isArray(i.calculated_value)) calcValue = i.calculated_value.join(" - ");
                    calcValue += ` ${i.unit}`;
                }
                html += `<tr><td>${i.name}</td> <td>${value} ${i.unit}</td><td>${calcValue}</td></tr>`;
            }
        }
        html += "</table>";
        return html;
    }
    function setupSyncLocalStorageValue(el, key) {
        if (localStorage.getItem(key)) el.value = localStorage.getItem(key);
        el.addEventListener("change", (() => {
            localStorage.setItem(key, el.value);
        }));
    }
    const RAW_RECIPE_KEY = "raw_recipe";
    const SCALE_KEY = "scale";
    const NEW_SCALE_KEY = "new_scale";
    const EXAMPLE_RECIPE = `\nТрадиционный кимчи  \nКимчи выход 3,6 кг\nКапуста пекинская 2,7 кг\nЗагуститель  \nВода 2 cup\nРисовая мука 2 ст.л.\nСахар 2 ст.л.\nСоус  \nЧеснок 0,5 cup\nИмбирь 2 ч.л.\nЛук репчатый 1 шт\nРыбный соус 0,5 cup\nПерец кочукари 2 cup\nКреветки ферментированые (saeujeot) 0,25 cup\nЯблоки (опционально) 1 шт\nОвощи  \nМорковь 1 cup\nРедис  2 cup\nЗеленый лук 8 шт\n`;
    ready((() => {
        const rawRecipeTextArea = document.getElementById("raw_recipe");
        const parsedRecipe = document.getElementById("parsed_recipe");
        const scaleWrap = document.getElementById("scale_wrap");
        const scale = document.getElementById("scale");
        setupSyncLocalStorageValue(scale, SCALE_KEY);
        const newScale = document.getElementById("new_scale");
        setupSyncLocalStorageValue(newScale, NEW_SCALE_KEY);
        const updateScaleCb = () => {
            const calculatedScale = Number.parseInt(newScale.value) / Number.parseInt(scale.value);
            if (!recipe) return;
            recipe = recipeScale(recipe, calculatedScale);
            parsedRecipe.innerHTML = renderRecipeTable(recipe);
        };
        const rawRecipeUpdateCb = () => {
            const value = rawRecipeTextArea.value;
            localStorage.setItem(RAW_RECIPE_KEY, value);
            recipe = parseTextRecipe(value);
            console.log(recipe);
            updateScaleCb();
            scaleWrap.style.display = "block";
        };
        scale.addEventListener("change", updateScaleCb);
        newScale.addEventListener("change", updateScaleCb);
        let recipe;
        if (localStorage.getItem(RAW_RECIPE_KEY)) {
            rawRecipeTextArea.value = localStorage.getItem(RAW_RECIPE_KEY);
            rawRecipeUpdateCb();
        } else {
            rawRecipeTextArea.value = EXAMPLE_RECIPE;
            rawRecipeUpdateCb();
        }
        rawRecipeTextArea.addEventListener("change", rawRecipeUpdateCb);
    }));
})();