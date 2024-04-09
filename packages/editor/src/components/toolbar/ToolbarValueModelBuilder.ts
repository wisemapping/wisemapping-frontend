export enum SwitchValueDirection {
  'up',
  'down',
}

export const fontSizes = [6, 8, 10, 15];

/**
 * Given an array and the current value it return the next posible value
 * @param values posible  values
 * @param current the current vaule
 * @returns the next vaule in the array or same if is the last
 */
export function getNextValue(
  values: (string | number)[],
  current: string | number,
): string | number {
  const nextIndex = values.indexOf(current) + 1;
  if (nextIndex === values.length) return current;
  return values[nextIndex];
}

/**
 * Given an array and the current value it return the previous value
 * @param values posible  values
 * @param current the current vaule
 * @returns the previous vaule in the array or same if is the first
 */
export function getPreviousValue(
  values: (string | number)[],
  current: string | number,
): string | number {
  const currentIndex = values.indexOf(current);
  if (currentIndex === 0) return current;
  if (currentIndex === -1) return values[values.length - 1];
  return values[currentIndex - 1];
}
