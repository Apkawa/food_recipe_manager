/**
 * Result of a dilution calculation.
 *
 * @property value - Total volume of the solution at the target concentration.
 * @property water - Difference between the original and new total volumes.
 */
export interface ConcentrationResult {
  value: number;
  water: number;
}

/**
 * Calculate the total volume needed to reach a target concentration.
 *
 * Applies `(fromConcentration * value) / toConcentration`, e.g. diluting
 * 100 ml of a 50% solution to 25% requires 200 ml in total.
 *
 * @param value - Volume of the starting solution.
 * @param fromConcentration - Concentration of the starting solution, in percent.
 * @param toConcentration - Desired target concentration, in percent.
 * @returns Total volume at the target concentration.
 */
export function calculateConcentration(
  value: number,
  fromConcentration: number,
  toConcentration: number,
): number {
  return (fromConcentration * value) / toConcentration;
}

/**
 * Calculate the total volume and water delta for diluting a solution.
 *
 * @param value - Volume of the starting solution.
 * @param fromConcentration - Concentration of the starting solution, in percent.
 * @param toConcentration - Desired target concentration, in percent.
 * @returns New total volume and the difference between original and new volumes.
 */
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
