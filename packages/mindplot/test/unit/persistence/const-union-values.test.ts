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
import { describe, expect, it } from '@jest/globals';
import ContentType from '../../../src/components/ContentType';
import { PivotType } from '../../../src/components/RelationshipControlPoints';
import { StrokeStyle } from '../../../src/components/model/RelationshipModel';

// T5: ContentType, StrokeStyle and PivotType are `as const` objects plus their union of values,
// not enums. The persisted values (a note's contentType, a relationship's strokeStyle) must not
// change, and the value read from a map is its type once checked, without a cast.
describe('as const unions (T5)', () => {
  it('keeps the persisted values', () => {
    expect(Object.values(ContentType)).toEqual(['plain', 'html']);
    expect(Object.values(StrokeStyle)).toEqual(['solid', 'dashed', 'dotted']);
    // No reverse mapping, as a numeric enum had: just the two ends.
    expect(Object.values(PivotType)).toEqual([0, 1]);
  });

  it('takes the plain values as the type', () => {
    const contentType: ContentType = 'html';
    const strokeStyle: StrokeStyle = 'dashed';
    const pivot: PivotType = 1;

    expect(contentType).toBe(ContentType.HTML);
    expect(strokeStyle).toBe(StrokeStyle.DASHED);
    expect(pivot).toBe(PivotType.End);
  });
});
