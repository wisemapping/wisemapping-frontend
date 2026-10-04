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

  describe('delete widgets (BL-11)', () => {
    const buildListenedIcon = (type: FeatureType, id: number) => {
      const icon = buildIcon(type, id);
      const listened: string[] = [];
      icon.addEvent = (eventType: string) => {
        listened.push(eventType);
      };
      return { icon, listened };
    };

    it('does not add a delete widget to an icon added without remove before appendTo', () => {
      const group = new IconGroup(1, 10);
      const { icon, listened } = buildListenedIcon('link', 1);
      group.addIcon(icon, false);

      group.appendTo(new Group());

      expect(listened).toEqual([]);
    });

    it('adds the delete widget to an icon added with remove once the group is appended', () => {
      const group = new IconGroup(1, 10);
      const { icon, listened } = buildListenedIcon('note', 1);
      group.addIcon(icon, true);
      expect(listened).toEqual([]);

      group.appendTo(new Group());

      expect(listened).toEqual(['mouseover', 'mouseout']);
    });

    it('shows the delete widget without asking the global designer if it is read-only', () => {
      // The global designer is the last one built, which may be another, read-only, map.
      (globalThis as Record<string, unknown>).designer = { isReadOnly: () => true };
      try {
        const topicGroup = new Group();
        const append = jest.spyOn(topicGroup, 'append');
        const group = new IconGroup(1, 10);
        group.appendTo(topicGroup);
        const icon = buildIcon('note', 1);
        let mouseOver: (() => void) | undefined;
        icon.addEvent = (eventType: string, fnc: () => void) => {
          if (eventType === 'mouseover') mouseOver = fnc;
        };
        icon.getGroup = () => group;
        group.addIcon(icon, true);
        append.mockClear();

        mouseOver!();

        expect(append).toHaveBeenCalledTimes(1);
      } finally {
        delete (globalThis as Record<string, unknown>).designer;
      }
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
