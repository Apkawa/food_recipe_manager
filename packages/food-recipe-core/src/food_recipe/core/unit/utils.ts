import {MEASURE_UNITS, Unit, VOLUME_UNITS, WEIGHT_UNITS} from '@app/core/unit/constants';

export function isVolumeUnit(unit: Unit): unit is (typeof VOLUME_UNITS)[number] {
  return (VOLUME_UNITS as ReadonlyArray<string>).includes(unit);
}
export function isMeasureUnit(unit: Unit): unit is (typeof MEASURE_UNITS)[number] {
  return (MEASURE_UNITS as ReadonlyArray<string>).includes(unit);
}
export function isWeightUnit(unit: Unit): unit is (typeof WEIGHT_UNITS)[number] {
  return (WEIGHT_UNITS as ReadonlyArray<string>).includes(unit);
}
