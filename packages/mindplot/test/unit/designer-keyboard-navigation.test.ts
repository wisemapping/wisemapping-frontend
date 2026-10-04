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
import DesignerKeyboard from '../../src/components/DesignerKeyboard';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

/**
 * Arrow-key navigation on a horizontal map.
 *
 * Which arrow walks towards the root depends on the half of the map the node
 * sits on, and that half used to be decided by `x > 0` / `x < 0`. A node at
 * exactly x === 0 matched neither test, so it fell through to the go-to-child
 * branch and, having no children, could not reach its parent with either
 * arrow. The same zero leaked into the sibling search, where a product
 * comparison `>= 0` counted it as same-side as both halves.
 *
 * Driven through `_moveSelection` rather than through real key events: the
 * decision under test is which topic the direction resolves to, and a live
 * Designer would need a canvas, a layout manager and an event bus to answer it.
 */

type Fake = {
  name: string;
  x: number;
  y: number;
  children: Fake[];
  parent: Fake | null;
  central: boolean;
};

const topic = (name: string, x: number, y: number, central = false): Fake => ({
  name,
  x,
  y,
  children: [],
  parent: null,
  central,
});

const attach = (parent: Fake, child: Fake): Fake => {
  child.parent = parent;
  parent.children.push(child);
  return child;
};

/** The slice of Topic that `_moveSelection` actually calls. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asTopic = (fake: Fake): any => ({
  __fake: fake,
  getPosition: () => ({ x: fake.x, y: fake.y }),
  getChildren: () => fake.children.map(asTopic),
  getParent: () => (fake.parent ? asTopic(fake.parent) : null),
  isCentralTopic: () => fake.central,
  getOrientation: () => 'horizontal',
  areChildrenShrunken: () => false,
  getId: () => fake.name,
  getOrder: () => 0,
});

type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

/**
 * Presses one arrow with `from` selected, and returns the name of the topic
 * navigation settled on, or null when it went nowhere.
 */
const press = (map: Fake[], central: Fake, from: Fake, direction: Direction): string | null => {
  let landed: string | null = null;
  const record = (node: { __fake: Fake }) => {
    landed = node.__fake.name;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const designer: any = {
    getModel: () => ({
      selectedTopic: () => asTopic(from),
      getCentralTopic: () => asTopic(central),
      findTopicById: () => null,
      getTopics: () => map.map(asTopic),
    }),
    revealNode: record,
    goToNode: record,
    deselectAll: () => undefined,
    getActionDispatcher: () => ({ shrinkBranch: () => undefined }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keyboard = Object.create(DesignerKeyboard.prototype) as any;
  keyboard._moveSelection(designer, direction);
  return landed;
};

describe('DesignerKeyboard horizontal navigation', () => {
  /**
   *                        central (0,0)
   *     left (-200,0)                    right (200,0)
   *                                      rightUpper (400,-40)
   *                                      rightLower (400, 40)
   *                        centred (0,120)   <- x === 0, a leaf
   */
  let central: Fake;
  let left: Fake;
  let right: Fake;
  let rightUpper: Fake;
  let rightLower: Fake;
  let centred: Fake;
  let map: Fake[];

  beforeEach(() => {
    central = topic('central', 0, 0, true);
    left = attach(central, topic('left', -200, 0));
    right = attach(central, topic('right', 200, 0));
    rightUpper = attach(right, topic('rightUpper', 400, -40));
    rightLower = attach(right, topic('rightLower', 400, 40));
    centred = attach(central, topic('centred', 0, 120));
    map = [central, left, right, rightUpper, rightLower, centred];
  });

  describe('reaching the parent', () => {
    it('walks left towards the root from the right half', () => {
      expect(press(map, central, rightUpper, 'LEFT')).toBe('right');
      expect(press(map, central, right, 'LEFT')).toBe('central');
    });

    it('walks right towards the root from the left half', () => {
      expect(press(map, central, left, 'RIGHT')).toBe('central');
    });

    it('reaches the parent of a topic sitting at x === 0', () => {
      // Regression: x === 0 matched neither x > 0 nor x < 0, so this fell
      // through to go-to-child and the parent was unreachable either way.
      expect(press(map, central, centred, 'LEFT')).toBe('central');
    });

    it('does not mistake the away-from-root arrow for the parent', () => {
      // 'right' has children, so the opposite arrow descends instead.
      expect(press(map, central, right, 'RIGHT')).toBe('rightUpper');
      // 'left' has none, so nothing on that side to descend to.
      expect(press(map, central, left, 'LEFT')).toBeNull();
    });
  });

  describe('moving between siblings', () => {
    it('moves down to the next sibling on the same side', () => {
      expect(press(map, central, rightUpper, 'DOWN')).toBe('rightLower');
    });

    it('moves up to the previous sibling on the same side', () => {
      expect(press(map, central, rightLower, 'UP')).toBe('rightUpper');
    });

    it('does not pull a left-half topic onto a sibling at x === 0', () => {
      // Regression: the same-side test was a product `>= 0`, which made
      // x === 0 count as same-side as both halves, so this landed on 'centred'.
      expect(press(map, central, left, 'DOWN')).not.toBe('centred');
    });
  });

  describe('from the central topic', () => {
    it('descends into the side the arrow points at', () => {
      expect(press(map, central, central, 'LEFT')).toBe('left');
      expect(press(map, central, central, 'RIGHT')).toBe('right');
    });
  });

  describe('a child at x === 0 (BL-28)', () => {
    it('is on the right of the central topic', () => {
      // Regression: tested as `x >= 0` for LEFT and `x <= 0` for RIGHT, it was
      // excluded from both, and RIGHT fell back to the first child, 'leftOnly'.
      const root = topic('central', 0, 0, true);
      attach(root, topic('leftOnly', -200, 0));
      attach(root, topic('centred', 0, 60));

      expect(press([root], root, root, 'RIGHT')).toBe('centred');
      expect(press([root], root, root, 'LEFT')).toBe('leftOnly');
    });

    it('is not a left-side child when descending on the left', () => {
      // Regression: the preferred-side filter counted x === 0 on both sides, so
      // the nearer 'centred' child won over the left one.
      const root = topic('central', 0, 0, true);
      const parent = attach(root, topic('parent', -200, 0));
      attach(parent, topic('farLeft', -400, 40));
      attach(parent, topic('centred', 0, 0));

      expect(press([root], root, parent, 'LEFT')).toBe('farLeft');
    });
  });
});
