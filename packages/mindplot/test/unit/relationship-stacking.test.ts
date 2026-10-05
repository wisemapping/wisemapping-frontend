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
 * Relationship.redraw moved its arrows to the back of the canvas, and focusing one moved its focus
 * shape there, so how relationships stacked depended on the order they were redrawn and focused
 * in (BL5-145). The stacking is now set once, when a relationship is added: below the topics and
 * the relationships already there, with the line on top of its arrows and its focus parts.
 */
import { buildDesigner, Harness, SAMPLE_MAP } from './commands/designer-harness';
import Relationship from '../../src/components/Relationship';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

// Two relationships: B (3) to Floating (5), and A1 (2) to B1 (4).
const MAP = SAMPLE_MAP.replace(
  '</map>',
  '  <relationship id="11" srcTopicId="2" destTopicId="4" lineType="3" endArrow="true" startArrow="true"/>\n</map>',
);

type Part = { peer: { _native: Element } };

/** The parts of a relationship, by name, from the bottom one to the top one. */
const PARTS = ['focusEndArrow', 'focusStartArrow', 'focusShape', 'endArrow', 'startArrow', 'line'];

/** The parts of a relationship, named after its load order ('first', 'second'). */
const partsOf = (relationship: Relationship, label: string): Map<Element, string> => {
  const fields = relationship as unknown as Record<string, Part & { getElementClass?: () => Part }>;
  return new Map(
    PARTS.map((name) => {
      const field = fields[`_${name}`];
      const element = field.getElementClass ? field.getElementClass() : field;
      return [element.peer._native, `${label} ${name}`];
    }),
  );
};

const LABELS = ['first', 'second'];

/** The relationship parts on the canvas, bottom first, and the index of the first topic. */
const stacking = (harness: Harness): { parts: string[]; firstTopic: number } => {
  const names = new Map<Element, string>();
  harness.designer
    .getModel()
    .getRelationships()
    .forEach((relationship, i) =>
      partsOf(relationship, LABELS[i]).forEach((name, el) => names.set(el, name)),
    );
  const children = Array.from(harness.designer.getContainer().querySelector('svg')!.children);
  const topics = new Set(
    harness.designer
      .getModel()
      .getTopics()
      .map((topic) => topic.get2DElement().peer._native as Element),
  );
  return {
    parts: children.filter((el) => names.has(el)).map((el) => names.get(el)!),
    firstTopic: children.findIndex((el) => topics.has(el)),
  };
};

describe('relationship stacking (BL5-145)', () => {
  let harness: Harness;
  let relationships: Relationship[];

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    harness = await buildDesigner(MAP);
    relationships = harness.designer.getModel().getRelationships();
    expect(relationships).toHaveLength(2);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stacks the relationships by the order they are added in, below the topics', () => {
    const { parts, firstTopic } = stacking(harness);
    // The one added last is at the back; each one keeps its line on top of its other parts.
    expect(parts).toEqual([...PARTS.map((p) => `second ${p}`), ...PARTS.map((p) => `first ${p}`)]);
    const children = Array.from(harness.designer.getContainer().querySelector('svg')!.children);
    const lastPart = Math.max(
      ...relationships.flatMap((r, i) =>
        Array.from(partsOf(r, LABELS[i]).keys()).map((el) => children.indexOf(el)),
      ),
    );
    expect(lastPart).toBeLessThan(firstTopic);
  });

  it('keeps the stacking whatever the order relationships are redrawn and focused in', () => {
    const before = stacking(harness).parts;

    relationships[1].redraw();
    relationships[0].redraw();
    expect(stacking(harness).parts).toEqual(before);

    relationships[1].setOnFocus(true);
    relationships[1].setOnFocus(false);
    relationships[0].setOnFocus(true);
    expect(stacking(harness).parts).toEqual(before);

    // A moved topic redraws the relationships attached to it.
    const floating = harness.topic(5);
    const position = floating.getPosition();
    harness.designer.getActionDispatcher().moveTopic(5, { x: position.x + 50, y: position.y });
    expect(stacking(harness).parts).toEqual(before);
  });
});
