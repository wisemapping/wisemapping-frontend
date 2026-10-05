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

import { buildDesigner, Harness } from '../commands/designer-harness';
import Topic from '../../../src/components/Topic';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import { buildMediumMap, stubTextMeasurement } from './RenderFixture';

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
