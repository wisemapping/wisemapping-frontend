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
export function getNextValue(values: any[], current: any): any {
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
export function getPreviousValue(values: any[], current: any): any {
  const currentIndex = values.indexOf(current);
  if (currentIndex === 0) return current;
  if (currentIndex === -1) return values[values.length - 1];
  return values[currentIndex - 1];
}

/**
 * the unique property value of object in the array or null if more than one exits
 */
export function getTheUniqueValueOrNull(
  objectsArray: object[],
  propertyValueGetter: (object: object) => string | number,
) {
  let result;
  for (let i = 0; i < objectsArray.length; i++) {
    const value = propertyValueGetter(objectsArray[i]);
    if (result != null && result !== value) {
      result = null;
      break;
    }
    result = value;
  }
  return result;
}
