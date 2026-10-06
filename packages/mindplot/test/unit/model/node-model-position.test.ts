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
import Mindmap from '../../../src/components/model/Mindmap';
import type PositionType from '../../../src/components/PositionType';

describe('INodeModel.getPosition typing (BL4-16)', () => {
  test('is typed as possibly undefined, as it is undefined for a topic without a position', () => {
    const topic = new Mindmap('map').createNode('MainTopic');

    // ts-jest type-checks the tests: this fails to compile while getPosition() claims to always
    // return a position.
    // @ts-expect-error a topic may have no position
    const position: PositionType = topic.getPosition();
    expect(position).toBeUndefined();

    topic.setPosition(3, 4);
    expect(topic.getPosition()?.x).toBe(3);
  });
});
