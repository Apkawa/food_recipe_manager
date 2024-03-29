import {Ingredient} from '../types/recipe';
import {NO_VALUE_UNITS, Unit, UNITS, VALUE_UNITS} from '../unit/constants';
import {UNIT_PARSE_MAP} from '../unit/unit_map';
import {parseNumber, VULGAR_LETTER_REGEXP} from '../../utils/number';
import {stripLine} from '../../utils';
import {mRegExp} from '../../utils/regexp';
import {prepareIngredient} from '../ingredient_type/parse';

const WORD_BOUNDARY_END = /(?=\s+|[.,);/]|$)/;

function buildUnitRegexp(unit_type: Unit, units: string[]): RegExp {
  return RegExp(`(?<${unit_type}>${units.join('|')})\\.?`);
}

const DECIMAL_REGEXP = /(?:\d+[,.]\d+|\d+)/u;
const DECIMAL_WITH_VULGAR_REGEXP = mRegExp(
  ['(?:', VULGAR_LETTER_REGEXP, '|', DECIMAL_REGEXP, ')'],
  'u',
);

const VALUE_RANGE_DELIMITER_REGEXP = RegExp(/(?<value_range>\s*\p{Pd}\s*)/u);
const VALUE_REGEXP = mRegExp(
  [
    '(?<value>',
    // With range
    DECIMAL_WITH_VULGAR_REGEXP,
    VALUE_RANGE_DELIMITER_REGEXP,
    DECIMAL_WITH_VULGAR_REGEXP,
    '|',
    DECIMAL_WITH_VULGAR_REGEXP,
    ')',
  ],
  'u',
);

const UNIT_REGEXP = mRegExp(
  [
    '(?:',
    // Value units
    VALUE_REGEXP,
    /\s?/, // Space
    '(?<unit>',
    // build all regexps
    ...VALUE_UNITS.map((k) => buildUnitRegexp(k, UNIT_PARSE_MAP[k]).source).join('|'),
    ')', // unit
    '|',
    '(?<no_value_unit>',
    ...NO_VALUE_UNITS.map((k) => buildUnitRegexp(k, UNIT_PARSE_MAP[k]).source).join('|'),
    ')', // no_value_units
    ')\\.?',
    WORD_BOUNDARY_END,
  ],
  'u',
);

type UnitGroupsResult = {
  [key in Unit]?: string;
};

interface MatchGroupsResult extends UnitGroupsResult {
  value?: string;
  no_value_unit?: string;
  value_range?: string;
  unit?: string;
}

export function parseRecipeLine(raw_line: string): Ingredient | null {
  let groups: MatchGroupsResult = {};
  let name: string = '';
  for (const regexp of [UNIT_REGEXP, VALUE_REGEXP]) {
    groups = (regexp.exec(raw_line)?.groups || {}) as MatchGroupsResult;
    if (groups?.value || groups?.no_value_unit) {
      name = stripLine(raw_line.replace(regexp, ''));
      break;
    }
  }
  if (!groups) {
    return null;
  }
  if (!(groups.value || groups.value_range) && !groups.no_value_unit) {
    // Если это не по вкусу и нет значения - тогда это ошибка парсинга
    return null;
  }

  let ingredient: Partial<Ingredient> = {
    name,
  };
  if (groups.value) {
    let value: number | number[] | undefined;
    if (groups.value_range) {
      value = [];
      for (const v of groups.value.split(VALUE_RANGE_DELIMITER_REGEXP)) {
        const n = parseNumber(v);
        if (n) {
          value.push(n);
        }
      }
    } else {
      value = parseNumber(groups.value) || undefined;
    }
    ingredient.value = value;
  }

  for (const t of UNITS) {
    if (groups[t]) {
      ingredient.unit = t;
    }
  }
  if (!ingredient.unit) {
    // Скорее всего была строка с одним числом без единиц измерения. Будем считать что это шт
    ingredient.unit = 'pcs';
  }
  ingredient = prepareIngredient(ingredient as Ingredient);
  return ingredient as Ingredient;
}
