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
import type { IconBuilders } from '../../../src/components/TopicFeature';
import TopicFeatureFactory from '../../../src/components/TopicFeature';
import type FeatureModel from '../../../src/components/model/FeatureModel';
import FeatureModelFactory from '../../../src/components/model/FeatureModelFactory';
import type FeatureType from '../../../src/components/model/FeatureType';
import type Topic from '../../../src/components/Topic';
import type Icon from '../../../src/components/Icon';

// Each icon class records what it was built with. A function declaration: jest.mock is hoisted.
function mockIconClass(name: string) {
  return {
    __esModule: true,
    default: class {
      name = name;

      args: unknown[];

      constructor(...args: unknown[]) {
        this.args = args;
      }
    },
  };
}
jest.mock('../../../src/components/SvgImageIcon', () => mockIconClass('SvgImageIcon'));
jest.mock('../../../src/components/EmojiCharIcon', () => mockIconClass('EmojiCharIcon'));
jest.mock('../../../src/components/LinkIcon', () => mockIconClass('LinkIcon'));
jest.mock('../../../src/components/NoteIcon', () => mockIconClass('NoteIcon'));

const topic = {} as Topic;
type Built = Icon & { name: string; args: unknown[] };

// BL5-187: the icon of each feature type is in a record keyed by every FeatureType, so a type
// without its icon is a compile error again, as the `never` default of the old switch made it.
describe('TopicFeatureFactory.createIcon (BL5-187)', () => {
  it.each([
    ['icon', 'SvgImageIcon', { id: 'flag_blue' }],
    ['eicon', 'EmojiCharIcon', { id: '😀' }],
    ['link', 'LinkIcon', { url: 'https://example.com' }],
    ['note', 'NoteIcon', { text: 'a note' }],
  ] as [FeatureType, string, Record<string, string>][])(
    'builds a %s feature as a %s',
    (type, iconName, attributes) => {
      const model = FeatureModelFactory.createModel(type, attributes);
      const icon = TopicFeatureFactory.createIcon(topic, model, true) as Built;

      expect(icon.name).toBe(iconName);
      expect(icon.args).toEqual([topic, model, true]);
    },
  );

  it('throws on a feature type with no icon', () => {
    const model = { getType: () => 'icons', isOfType: () => true } as unknown as FeatureModel;

    expect(() => TopicFeatureFactory.createIcon(topic, model, false)).toThrow(
      'Unhandled feature type case: icons',
    );
  });

  it('has an icon for every feature type (ts-jest type-checks this)', () => {
    const builder = () => ({}) as Icon;
    // @ts-expect-error the eicon builder is missing
    const missing: IconBuilders = { icon: builder, link: builder, note: builder };
    expect(Object.keys(missing)).toHaveLength(3);
  });
});
