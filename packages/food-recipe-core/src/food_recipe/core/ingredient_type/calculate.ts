export interface ConcentrationResult {
  value: number;
  water: number;
}

export function calculateConcentration(
  value: number,
  fromConcentration: number,
  toConcentration: number,
): number {
  return (fromConcentration * value) / toConcentration;
}

export function calculateConcentrationDiluting(
  value: number,
  fromConcentration: number,
  toConcentration: number,
): ConcentrationResult {
  const newValue = calculateConcentration(value, fromConcentration, toConcentration);
  const water = value - newValue; // TODO улучшить формулу
  return {
    value: newValue,
    water,
  };
}
