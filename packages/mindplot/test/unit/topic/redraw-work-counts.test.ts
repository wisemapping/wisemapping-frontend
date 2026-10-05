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
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import { Text } from '@wisemapping/web2d';
import { buildDesigner, Harness } from '../commands/designer-harness';
import Topic from '../../../src/components/Topic';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import MultitTextEditor from '../../../src/components/MultilineTextEditor';
import { buildMediumMap, stubTextMeasurement } from './RenderFixture';

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
  const spy = jest
    .spyOn(proto, method as never)
    .mockImplementation(function counted(this: unknown, ...args: unknown[]) {
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
    expect(layouts).toBe(1);
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
    expect(layouts).toBe(1);
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

  it('measures the text once for its width and once for its height', () => {
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
    expect(measures).toBe(2);
  });
});
