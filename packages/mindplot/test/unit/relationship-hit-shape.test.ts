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

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import Relationship from '../../src/components/Relationship';
import Topic from '../../src/components/Topic';
import { buildDesigner } from './commands/designer-harness';

/**
 * A relationship draws a 2px line, plus a 12px "focus shape" that is meant to be
 * barely visible but always present, so the line can be clicked without hitting
 * it pixel-perfect (and through the gaps of a dashed or dotted stroke).
 *
 * The focus shape used to be hidden by setVisibility() -- which the Designer calls
 * on every relationship it builds -- and by every blur, so after load only the
 * 2px line was clickable. And redraw() moved the line and the focus shape on top
 * of every topic, undoing the "below topics" order set when they were added, so a
 * relationship crossing a topic took the topic's clicks.
 */

type Native = { _native: SVGElement };
const nativeOf = (element: unknown): SVGElement => (element as { peer: Native }).peer._native;

const focusShapeOf = (relationship: Relationship): SVGElement =>
  nativeOf((relationship as unknown as { _focusShape: unknown })._focusShape);

const lineOf = (relationship: Relationship): SVGElement => nativeOf(relationship.getLine());

const expectClickableHitShape = (relationship: Relationship): void => {
  const shape = focusShapeOf(relationship);
  expect(shape.getAttribute('visibility')).toBe('visible');
  expect(shape.getAttribute('stroke-width')).toBe('12');
};

/** True when `element` is painted before (below) `other`. */
const isBelow = (element: Element, other: Element): boolean =>
  // eslint-disable-next-line no-bitwise
  (element.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

const expectBelowTopics = (relationship: Relationship, topics: Topic[]): void => {
  [lineOf(relationship), focusShapeOf(relationship)].forEach((part) => {
    topics.forEach((topic) => {
      expect(isBelow(part, nativeOf(topic.get2DElement()))).toBe(true);
    });
  });
};

describe('Relationship hit shape', () => {
  const load = async () => {
    const harness = await buildDesigner();
    const relationship = harness.designer.getModel().getRelationships()[0];
    const topics = harness.designer.getModel().getTopics();
    return { ...harness, relationship, topics };
  };

  it('is clickable once the map is loaded', async () => {
    const { relationship } = await load();

    expectClickableHitShape(relationship);
  });

  it('is clickable again after the relationship loses the focus', async () => {
    const { relationship } = await load();

    relationship.setOnFocus(true);
    expect(focusShapeOf(relationship).getAttribute('stroke-width')).toBe('5');
    relationship.setOnFocus(false);

    expect(relationship.isOnFocus()).toBe(false);
    expectClickableHitShape(relationship);
  });

  it('follows the visibility of the relationship', async () => {
    const { relationship } = await load();

    relationship.setVisibility(false);
    expect(focusShapeOf(relationship).getAttribute('visibility')).toBe('hidden');

    relationship.setVisibility(true);
    expectClickableHitShape(relationship);
  });

  it('is clickable when a focused relationship is shown again', async () => {
    const { relationship } = await load();

    relationship.setOnFocus(true);
    relationship.setVisibility(true);

    expectClickableHitShape(relationship);
  });
});

describe('Relationship z-order', () => {
  it('is rendered below every topic once loaded', async () => {
    const { designer } = await buildDesigner();
    const relationship = designer.getModel().getRelationships()[0];

    expectBelowTopics(relationship, designer.getModel().getTopics());
  });

  it('stays below every topic after a redraw', async () => {
    const { designer } = await buildDesigner();
    const relationship = designer.getModel().getRelationships()[0];

    relationship.redraw();

    expectBelowTopics(relationship, designer.getModel().getTopics());
  });

  it('stays below every topic after being focused and blurred', async () => {
    const { designer } = await buildDesigner();
    const relationship = designer.getModel().getRelationships()[0];

    relationship.setOnFocus(true);
    relationship.redraw();
    relationship.setOnFocus(false);

    expectBelowTopics(relationship, designer.getModel().getTopics());
  });
});
