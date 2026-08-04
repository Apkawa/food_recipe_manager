import {MEASURE_UNITS, Unit, VOLUME_UNITS, WEIGHT_UNITS} from '../unit/constants';

/** Check whether a unit is a volume unit (l, ml, US volumes). */
export function isVolumeUnit(unit: Unit): unit is (typeof VOLUME_UNITS)[number] {
  return (VOLUME_UNITS as ReadonlyArray<string>).includes(unit);
}
/** Check whether a unit is a kitchen measure (tsp, tbsp, cup, shot, pinch). */
export function isMeasureUnit(unit: Unit): unit is (typeof MEASURE_UNITS)[number] {
  return (MEASURE_UNITS as ReadonlyArray<string>).includes(unit);
}
/** Check whether a unit is a weight unit (g, kg, US weights). */
export function isWeightUnit(unit: Unit): unit is (typeof WEIGHT_UNITS)[number] {
  return (WEIGHT_UNITS as ReadonlyArray<string>).includes(unit);
}
