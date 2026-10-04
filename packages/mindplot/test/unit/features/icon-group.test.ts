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
import { Group } from '@wisemapping/web2d';
import IconGroup from '../../../src/components/IconGroup';
import Icon from '../../../src/components/Icon';
import FeatureModel from '../../../src/components/model/FeatureModel';
import FeatureType from '../../../src/components/model/FeatureType';

const buildIcon = (type: FeatureType, id: number): Icon & { label: string } => {
  const element = new Group();
  return {
    label: `${type}-${id}`,
    getElement: () => element,
    setGroup: () => undefined,
    getGroup: () => null,
    getSize: () => undefined,
    getPosition: () => element.getPosition(),
    addEvent: () => undefined,
    remove: () => undefined,
    getModel: () => ({ getType: () => type, getId: () => id }) as unknown as FeatureModel,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const order = (group: IconGroup): string[] =>
  (group as any)._icons.map((i: { label: string }) => i.label);

describe('IconGroup', () => {
  describe('icon order (B-EICON)', () => {
    it('places emoji icons with the other icons, before notes and links', () => {
      const group = new IconGroup(1, 10);
      group.addIcon(buildIcon('link', 1), false);
      group.addIcon(buildIcon('note', 2), false);
      group.addIcon(buildIcon('eicon', 3), false);

      expect(order(group)).toEqual(['eicon-3', 'note-2', 'link-1']);
    });

    it('keeps emoji and image icons in the order they were added', () => {
      const group = new IconGroup(1, 10);
      group.addIcon(buildIcon('note', 1), false);
      group.addIcon(buildIcon('eicon', 2), false);
      group.addIcon(buildIcon('icon', 3), false);
      group.addIcon(buildIcon('eicon', 4), false);
      group.addIcon(buildIcon('link', 5), false);

      expect(order(group)).toEqual(['eicon-2', 'icon-3', 'eicon-4', 'note-1', 'link-5']);
    });
  });

  describe('icon size from the constructor', () => {
    it('sizes the group for its icons before seIconSize is called again', () => {
      const group = new IconGroup(1, 10);
      group.addIcon(buildIcon('icon', 1), false);
      group.addIcon(buildIcon('eicon', 2), false);

      expect(group.getSize()).toEqual({ width: 20, height: 10 });
    });
  });
});
