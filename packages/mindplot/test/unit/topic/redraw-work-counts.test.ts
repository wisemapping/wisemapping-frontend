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

/*
 * Counts the work a redraw does (redraws, layouts, setter calls, measurements,
 * theme resolutions), so that the redraw optimizations are proven by numbers that
 * do not depend on the machine. Each bound fails on the code before the change.
 */
import { Group, Text } from '@wisemapping/web2d';
import { buildDesigner, Harness } from '../commands/designer-harness';
import Topic from '../../../src/components/Topic';
import ThemeFactory from '../../../src/components/theme/ThemeFactory';
import DefaultTheme from '../../../src/components/theme/DefaultTheme';
import ImageSVGFeature from '../../../src/components/ImageSVGFeature';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import MultitTextEditor from '../../../src/components/MultilineTextEditor';
import { buildMediumMap, stubTextMeasurement } from './RenderFixture';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

/** Calls of a prototype method while fn runs. */
const countCalls = <T extends object>(
  proto: T,
  method: keyof T,
  fn: () => void,
  filter?: (self: unknown, args: unknown[]) => boolean,
): number => {
  let count = 0;
  const original = proto[method] as unknown as (...args: unknown[]) => unknown;
  const spy = jest.spyOn(proto, method as never).mockImplementation(function counted(
    this: unknown,
    ...args: unknown[]
  ) {
    if (!filter || filter(this, args)) {
      count += 1;
    }
    return original.apply(this, args);
  } as never);
  try {
    fn();
  } finally {
    spy.mockRestore();
  }
  return count;
};

const depthOf = (topic: Topic): number => {
  let depth = 0;
  let parent = topic.getParent();
  while (parent) {
    depth += 1;
    parent = parent.getParent();
  }
  return depth;
};

const subtreeSize = (topic: Topic): number =>
  1 + topic.getChildren().reduce((sum, child) => sum + subtreeSize(child), 0);

const isTextOf = (topic: Topic) => (self: unknown) =>
  self === topic.getOrBuildTextShape() || self === topic.getOrBuildTextShape().peer;

let harness: Harness;
let topics: Topic[];

beforeAll(async () => {
  stubTextMeasurement();
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);

  const wrapper = document.createElement('div');
  const mindmapComp = document.createElement('div');
  mindmapComp.id = 'mindmap-comp';
  wrapper.appendChild(mindmapComp);
  document.body.appendChild(wrapper);

  harness = await buildDesigner(buildMediumMap());
  topics = harness.designer.getModel().getTopics();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Designer.applyLayout', () => {
  it('redraws every topic once, not once per ancestor', () => {
    const n = topics.length;
    const oldCost = topics.reduce((sum, t) => sum + depthOf(t) + 1, 0);

    const redraws = countCalls(Topic.prototype, 'redraw', () => {
      harness.designer.applyLayout('tree');
    });
    harness.designer.applyLayout('mindmap');

    console.info(`applyLayout: ${redraws} redraws for ${n} topics (O(n·depth) = ${oldCost})`);
    expect(redraws).toBeLessThanOrEqual(n);
  });
});

describe('Designer theme variant toggle', () => {
  it('redraws every topic once and lays out once', () => {
    const n = topics.length;
    let layouts = 0;
    const redraws = countCalls(Topic.prototype, 'redraw', () => {
      layouts = countCalls(LayoutManager.prototype, 'layout', () => {
        harness.designer.setThemeVariant('dark');
      });
    });
    harness.designer.setThemeVariant('light');

    console.info(`setThemeVariant: ${redraws} redraws, ${layouts} layouts for ${n} topics`);
    expect(redraws).toBeLessThanOrEqual(n);
    // At most once: here the variant changes no topic size (jsdom boxes are fixed), so the forced
    // layout is skipped, as it would move nothing (BL5-94).
    expect(layouts).toBeLessThanOrEqual(1);
  });

  it('sets the variant on every topic before redrawing any of them', () => {
    const seen: string[] = [];
    countCalls(
      Topic.prototype,
      'redraw',
      () => {
        harness.designer.setThemeVariant('dark');
      },
      (self) => {
        seen.push((self as Topic).getThemeVariant());
        return true;
      },
    );
    harness.designer.setThemeVariant('light');

    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((variant) => variant === 'dark')).toBe(true);
  });
});

describe('text editor', () => {
  afterEach(() => {
    MultitTextEditor.getInstance().close(false);
  });

  it('redraws only the edited topic on each keystroke, not its subtree', async () => {
    const topic = harness.topic(1);
    expect(subtreeSize(topic)).toBeGreaterThan(5);
    MultitTextEditor.getInstance().show(topic);
    await nextFrame();
    const textarea = document.querySelector('#textContainer textarea') as HTMLTextAreaElement;

    const redraws = countCalls(Topic.prototype, 'redraw', () => {
      textarea.value = 'Typed';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    console.info(`keystroke: ${redraws} redraws (subtree of ${subtreeSize(topic)} topics)`);
    expect(redraws).toBe(1);
  });

  it('lays out once per frame however many keystrokes arrive in it', async () => {
    const topic = harness.topic(1);
    MultitTextEditor.getInstance().show(topic);
    await nextFrame();
    const textarea = document.querySelector('#textContainer textarea') as HTMLTextAreaElement;

    let layouts = countCalls(LayoutManager.prototype, 'layout', () => {
      ['T', 'Ty', 'Typ', 'Type', 'Typed'].forEach((value) => {
        textarea.value = value;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
    const spy = jest.spyOn(LayoutManager.prototype, 'layout');
    await nextFrame();
    layouts += spy.mock.calls.length;
    spy.mockRestore();

    console.info(`5 keystrokes in a frame: ${layouts} layouts`);
    // At most once: here the variant changes no topic size (jsdom boxes are fixed), so the forced
    // layout is skipped, as it would move nothing (BL5-94).
    expect(layouts).toBeLessThanOrEqual(1);
  });
});

describe('Topic.redraw of an unchanged topic', () => {
  const textSetters: (keyof Text)[] = [
    'setText',
    'setColor',
    'setFontSize',
    'setWeight',
    'setStyle',
    'setFontName',
  ];

  it('calls no text setter and does not rebuild the tspans', () => {
    const topic = harness.topic(2);
    let setterCalls = 0;
    textSetters.forEach((setter) => {
      setterCalls += countCalls(
        Text.prototype,
        setter,
        () => topic.redraw(topic.getThemeVariant(), false),
        isTextOf(topic),
      );
    });
    console.info(`unchanged redraw: ${setterCalls} text setter calls`);
    expect(setterCalls).toBe(0);
  });

  // web2d caches text measurements by text and font (W2), so an unchanged redraw measures nothing.
  it('does not measure the unchanged text again', () => {
    const topic = harness.topic(2);
    const textNative = topic.getOrBuildTextShape().peer._native;
    const proto = (window as unknown as { SVGElement: { prototype: { getBBox: () => DOMRect } } })
      .SVGElement.prototype;
    const measures = countCalls(
      proto,
      'getBBox',
      () => topic.redraw(topic.getThemeVariant(), false),
      (self) => self === textNative,
    );
    console.info(`redraw: ${measures} text getBBox calls`);
    expect(measures).toBe(0);
  });
});

describe('Topic.redraw of a changed text', () => {
  // The width and the height come from one measurement (Text.measure), not one call each
  // (getShapeWidth then getShapeHeight), which measure twice when the result is not cacheable.
  it('measures the text once', () => {
    const topic = harness.topic(3);
    const { peer } = topic.getOrBuildTextShape();
    topic.setText('A changed text');
    const measures = countCalls(
      Object.getPrototypeOf(peer) as { measure: () => unknown },
      'measure',
      () => topic.redraw(topic.getThemeVariant(), false),
      (self) => self === peer,
    );
    console.info(`changed text redraw: ${measures} text measurements`);
    expect(measures).toBe(1);
  });
});

describe('emoji and gallery icon', () => {
  it('does not rewrite nor re-append the emoji on a redraw', () => {
    const topic = harness.topic(9);
    const emoji = topic.getOrBuildImageEmojiTextShape();
    expect(emoji).toBeDefined();

    const rewrites = countCalls(
      Text.prototype,
      'setText',
      () => topic.redraw(topic.getThemeVariant(), false),
      (self) => self === emoji,
    );
    const appends = countCalls(
      Group.prototype,
      'append',
      () => topic.redraw(topic.getThemeVariant(), false),
      (self, args) => args[0] === emoji,
    );
    console.info(`emoji redraw: ${rewrites} setText, ${appends} appends`);
    expect(rewrites).toBe(0);
    expect(appends).toBe(0);
  });

  it('does not re-append the gallery icon on a redraw', () => {
    const topic = harness.topic(15);
    const svg = topic.getOrBuildImageSVGElement();
    expect(svg).toBeDefined();

    const appends = countCalls(
      Group.prototype,
      'append',
      () => topic.redraw(topic.getThemeVariant(), false),
      (self, args) => args[0] === svg,
    );
    console.info(`gallery icon redraw: ${appends} appends`);
    expect(appends).toBe(0);
  });

  it('looks an unknown gallery icon up once, not on every call', () => {
    const topic = harness.topic(16);
    const createMaterialIcon = jest.spyOn(
      ImageSVGFeature.prototype as unknown as { createMaterialIcon: () => unknown },
      'createMaterialIcon',
    );
    topic.setImageGalleryIconName('no-such-icon');
    topic.redraw(topic.getThemeVariant(), false);
    const lookups = createMaterialIcon.mock.calls.length;
    createMaterialIcon.mockRestore();

    console.info(`unknown gallery icon: ${lookups} lookups for 2 redraws`);
    expect(topic.getOrBuildImageSVGElement()).toBeUndefined();
    expect(lookups).toBe(1);
  });
});

describe('theme resolution', () => {
  // A chain of topics, each the only child of the previous one, with a rectangle shape so
  // that the border colour is inherited from the parent.
  const chainMap = (depth: number): string => {
    const lines = ['<map name="chain" version="tango">', '<topic id="0" central="true" text="C">'];
    for (let i = 1; i <= depth; i++) {
      lines.push(
        `<topic id="${i}" text="T${i}" position="${i * 150},0" order="0" shape="rectangle">`,
      );
    }
    for (let i = 1; i <= depth; i++) {
      lines.push('</topic>');
    }
    lines.push('</topic>', '</map>');
    return lines.join('\n');
  };
  const resolveProto = DefaultTheme.prototype as unknown as { resolve: () => unknown };
  const depth = 20;
  let chain: Harness;

  beforeAll(async () => {
    chain = await buildDesigner(chainMap(depth));
  });

  it('resolves the styles of a deep topic in O(depth), not O(depth²)', () => {
    const leaf = chain.topic(depth);
    const redraw = () => leaf.redraw(leaf.getThemeVariant(), false);

    const resolves = countCalls(resolveProto, 'resolve', redraw);
    const creates = countCalls(ThemeFactory, 'create', redraw);
    const ancestorSteps = countCalls(Topic.prototype, 'getParent', redraw);

    console.info(
      `leaf redraw at depth ${depth}: ${resolves} resolve, ${creates} ThemeFactory.create, ${ancestorSteps} getParent`,
    );
    expect(resolves).toBeLessThanOrEqual(depth + 15);
    expect(creates).toBeLessThanOrEqual(4 * depth);
    expect(ancestorSteps).toBeLessThanOrEqual(12 * depth);
  });

  it('walks the ancestors a linear number of times when redrawing from the root', () => {
    const root = chain.designer.getModel().getCentralTopic();
    const ancestorSteps = countCalls(Topic.prototype, 'getParent', () =>
      root.redraw(root.getThemeVariant(), true),
    );
    console.info(`root redraw of a chain of ${depth}: ${ancestorSteps} getParent`);
    expect(ancestorSteps).toBeLessThanOrEqual(15 * (depth + 1));
  });

  it('walks the ancestors a linear number of times when redrawing the medium map', () => {
    const root = harness.designer.getModel().getCentralTopic();
    const ancestorSteps = countCalls(Topic.prototype, 'getParent', () =>
      root.redraw(root.getThemeVariant(), true),
    );
    console.info(`root redraw of ${topics.length} topics: ${ancestorSteps} getParent`);
    expect(ancestorSteps).toBeLessThanOrEqual(15 * topics.length);
  });

  it('resolves nothing from a cache outside a redraw', () => {
    const topic = harness.topic(1);
    const resolves = countCalls(resolveProto, 'resolve', () => {
      topic.getFontSize();
      topic.getFontSize();
    });
    expect(resolves).toBe(2);
  });
});
