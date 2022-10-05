import {
  getNextValue,
  getPreviousValue,
  getTheUniqueValueOrNull,
} from '../../../src/components/toolbar/ToolbarValueModelBuilder';

describe('getNextValue', () => {
  it('Given an array and the current value it return the next value of the array', () => {
    expect(getNextValue([1, 2, 3], 2)).toEqual(3);
  });

  it('Given an array and the current value when the last value is selected it return same', () => {
    expect(getNextValue([1, 2, 3], 3)).toEqual(3);
  });

  it('Given a current value not present in values array return the first element', () => {
    expect(getNextValue([1, 2, 3], 4)).toEqual(1);
  });

  it('Given an array and the current value undefined it return the next value of the array', () => {
    expect(getNextValue([1, undefined, 3], undefined)).toEqual(3);
  });
});

describe('getPrevioustValue', () => {
  it('Given an array and the current value it return the previous value of the array', () => {
    expect(getPreviousValue([1, 2, 3], 2)).toEqual(1);
  });

  it('Given an array and the current value when the first value is selected it return same', () => {
    expect(getPreviousValue([1, 2, 3], 1)).toEqual(1);
  });

  it('Given a current value not present in values array return the last element', () => {
    expect(getPreviousValue([1, 2, 3], 4)).toEqual(3);
  });

  it('Given an array and the current value undefined it return the next value of the array', () => {
    expect(getPreviousValue([1, undefined, 3], undefined)).toEqual(1);
  });
});

describe('getTheUniqueValueOrNull', () => {
  const testArray = [
    {
      a: 'va',
      b: 'vb',
      c: 'vc',
    },
    {
      a: 'va',
      b: 'vb!!!!!',
      c: 'vc',
    },
    {
      a: 'va',
      b: 'vb',
      c: 'vc',
    },
  ];

  it("Given an array of objects testArray and a function that returns the property named 'a', it returns the property value 'va'", () => {
    expect(getTheUniqueValueOrNull(testArray, (o) => o['a'])).toEqual('va');
  });

  it("Given an array of objects testArray and a function that returns the property named 'b', it returns null", () => {
    expect(getTheUniqueValueOrNull(testArray, (o) => o['b'])).toBeNull();
  });
});
