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

/* eslint-disable import/first */
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';
import { buildDesigner, Harness } from '../commands/designer-harness';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';
import Topic from '../../../src/components/Topic';
import { LineType } from '../../../src/components/TopicConnection';

/*
 * mmap2json-2017 as MindManager draws it: A in the centre, B and C on its right, D, E and F
 * under B, and G under E. E is the middle one of three equal-height siblings, so it is at the
 * height of B and the B-E connection is a straight horizontal line.
 */
const importedDesigner = async (name = 'mmap2json-2017'): Promise<Harness> => {
  const buffer = fs.readFileSync(path.resolve(__dirname, `./input/mindmanager/real/${name}.mmap`));
  const archive = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  const xml = await TextImporterFactory.create('mmap', archive).import(name, '');
  return buildDesigner(xml);
};

const byText = (harness: Harness, text: string): Topic => {
  const topic = harness.designer
    .getModel()
    .getTopics()
    .find((candidate) => candidate.getModel().getText() === text);
  if (!topic) {
    throw new Error(`Topic ${text} is not on the canvas`);
  }
  return topic;
};

// The y of every point of an SVG path: M x,y C x,y x,y x,y
const pathYs = (d: string): number[] =>
  Array.from(d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)).map((match) => Number(match[2]));

describe('mmap2json-2017 laid out', () => {
  it('places B and C on the right of A, B above C', async () => {
    const harness = await importedDesigner();
    const a = byText(harness, 'A').getPosition();
    const b = byText(harness, 'B').getPosition();
    const c = byText(harness, 'C').getPosition();

    expect(b.x).toBeGreaterThan(a.x);
    expect(c.x).toBe(b.x);
    expect(b.y).toBeLessThan(c.y);
  });

  /*
   * MindManager centres the main topics themselves on A (B and C are equally far above and below
   * it). The balanced layout centres the stack of their branches instead: B's branch is three
   * topics high and C's one, so B and C sit lower than in MindManager. That is the layout
   * (BalancedSorter.computeOffsets sums the branch heights), not the import.
   */
  // Decided: WiseMapping centres the block of B (with its subtree) and C on A, not B and C
  // themselves as MindManager does; centring the topics would unbalance maps with uneven
  // subtrees. So B, whose branch is taller, sits closer to A than C.
  it('centres the block of B (with its subtree) and C on A, so B sits closer to A', async () => {
    const harness = await importedDesigner();
    const a = byText(harness, 'A').getPosition();
    const b = byText(harness, 'B').getPosition();
    const c = byText(harness, 'C').getPosition();
    const d = byText(harness, 'D').getPosition();

    expect(a.y - b.y).toBeLessThan(c.y - a.y);
    expect((d.y + c.y) / 2).toBeCloseTo(a.y);
  });

  it('centres D, E and F on B: E is at the height of B', async () => {
    const harness = await importedDesigner();
    const b = byText(harness, 'B').getPosition();
    const d = byText(harness, 'D').getPosition();
    const e = byText(harness, 'E').getPosition();
    const f = byText(harness, 'F').getPosition();

    expect(e.y).toBeCloseTo(b.y);
    expect(d.y).toBeLessThan(e.y);
    expect(f.y).toBeGreaterThan(e.y);
    expect(e.y - d.y).toBeCloseTo(f.y - e.y);
    expect(byText(harness, 'G').getPosition().y).toBeCloseTo(e.y);
  });

  it('draws the B-E connection as a straight horizontal line', async () => {
    const harness = await importedDesigner();
    const e = byText(harness, 'E');
    const connection = e.getOutgoingLine();
    expect(connection).not.toBeNull();

    // The import sets no connStyle: the line is the one of the prism theme.
    expect(connection!.getLineType()).toBe(LineType.ARC);

    const line = connection!.getLine();
    expect(line.getFrom().y).toBeCloseTo(line.getTo().y);
    const d = line.getElementClass().getNode().getAttribute('d');
    const ys = pathYs(d!);
    expect(ys.length).toBeGreaterThanOrEqual(4);
    ys.forEach((y) => expect(y).toBeCloseTo(ys[0]));
  });
});

/*
 * mindm-test-dom-mm23 as MindManager draws it (its Preview.png): 1, 3 and 5 on the right of Test,
 * from top to bottom, and Main Topic, 6, 2 and 4 on its left. MindManager lays the main topics out
 * clockwise: the left ones are in reverse document order (4, 2, 6, Main Topic), bottom to top.
 */
describe('mindm-test-dom-mm23 laid out', () => {
  const ys = (harness: Harness, texts: string[]): number[] =>
    texts.map((text) => byText(harness, text).getPosition().y);
  const increasing = (values: number[]): boolean =>
    values.every((value, index) => index === 0 || value > values[index - 1]);

  it('places 1, 3 and 5 on the right, top to bottom', async () => {
    const harness = await importedDesigner('mindm-test-dom-mm23');
    const center = byText(harness, 'Test').getPosition();

    ['1', '3', '5'].forEach((text) =>
      expect(byText(harness, text).getPosition().x).toBeGreaterThan(center.x),
    );
    expect(increasing(ys(harness, ['1', '3', '5']))).toBe(true);
  });

  it('places Main Topic, 6, 2 and 4 on the left, top to bottom', async () => {
    const harness = await importedDesigner('mindm-test-dom-mm23');
    const center = byText(harness, 'Test').getPosition();

    ['Main Topic', '6', '2', '4'].forEach((text) =>
      expect(byText(harness, text).getPosition().x).toBeLessThan(center.x),
    );
    expect(increasing(ys(harness, ['Main Topic', '6', '2', '4']))).toBe(true);
  });
});
