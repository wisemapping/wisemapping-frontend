/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {
  getNextValue,
  getPreviousValue,
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

  // it('Given an array and the current value undefined it return the next value of the array', () => {
  //   expect(getNextValue([1, undefined, 3], undefined)).toEqual(3);
  // });
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

  // it('Given an array and the current value undefined it return the next value of the array', () => {
  //   expect(getPreviousValue([1, undefined, 3], undefined)).toEqual(1);
  // });
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
});
