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

import Topic from '../../../src/components/Topic';
import { buildDesigner, Harness, SAMPLE_MAP } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/** How a live topic answers the pointer, and how it draws its border style. */

const nativeOf = (element: unknown): SVGElement =>
  (element as { peer: { _native: SVGElement } }).peer._native;

const groupOf = (topic: Topic): SVGElement => nativeOf(topic.get2DElement());

const harnesses: Harness[] = [];
const open = async (xml = SAMPLE_MAP) => {
  const harness = await buildDesigner(xml);
  harnesses.push(harness);
  harness.designer.deselectAll();
  return harness;
};

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
  jest.restoreAllMocks();
});

describe('Topic pointer events', () => {
  it('opens the text editor on a double click, without letting it through', async () => {
    const harness = await open();
    const reached = jest.fn();
    harness.designer.getContainer().addEventListener('dblclick', reached);

    groupOf(harness.topic(3)).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(harness.designer.getTextEditor().getActiveTopic()).toBe(harness.topic(3));
    expect(reached).not.toHaveBeenCalled();
  });

  it('keeps a click on a topic from reaching the canvas', async () => {
    const harness = await open();
    const reached = jest.fn();
    harness.designer.getContainer().addEventListener('click', reached);
    groupOf(harness.topic(3)).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(reached).not.toHaveBeenCalled();
  });

  it('highlights its outer shape while hovered, unless selected', async () => {
    const harness = await open();
    const topic = harness.topic(3);
    const outer = nativeOf(topic.getOuterShape());

    groupOf(topic).dispatchEvent(new MouseEvent('mouseover'));
    expect(outer.style.opacity).toBe('1');
    groupOf(topic).dispatchEvent(new MouseEvent('mouseout'));
    expect(outer.style.opacity).toBe('0');

    topic.setOnFocus(true);
    groupOf(topic).dispatchEvent(new MouseEvent('mouseover'));
    groupOf(topic).dispatchEvent(new MouseEvent('mouseout'));
    expect(outer.style.opacity).toBe('1');
  });

  it('does not react to hovering while its mouse events are off', async () => {
    const harness = await open();
    const topic = harness.topic(3);
    const outer = nativeOf(topic.getOuterShape());
    const before = outer.style.opacity;
    topic.setMouseEventsEnabled(false);
    groupOf(topic).dispatchEvent(new MouseEvent('mouseover'));
    expect(outer.style.opacity).toBe(before);
  });

  it('fades its group and its text together', async () => {
    const harness = await open();
    const topic = harness.topic(1);
    topic.setOpacity(0.3);
    expect(groupOf(topic).style.opacity).toBe('0.3');
    expect(nativeOf(topic.getOrBuildTextShape()).style.opacity).toBe('0.3');
  });

  it('has no page coordinates once off the page', async () => {
    const harness = await open();
    const topic = harness.topic(4);
    expect(topic.getAbsoluteCornerCoordinates()).not.toBeNull();
    groupOf(topic).remove();
    expect(topic.getAbsoluteCornerCoordinates()).toBeNull();
  });
});

describe('Topic border style', () => {
  const dash = async (style: string) => {
    const harness = await open(SAMPLE_MAP.replace('text="B" ', 'text="B" shape="rectangle" '));
    const topic = harness.topic(3);
    topic.setBorderStyle(style);
    // The topic shape wraps the web2d shape it draws.
    const { _shape: shape } = topic.getInnerShape() as unknown as { _shape: unknown };
    return nativeOf(shape).getAttribute('stroke-dasharray');
  };

  it('draws a solid, dashed or dotted border, and solid for an unknown style', async () => {
    const solid = await dash('solid');
    const dashed = await dash('dashed');
    const dotted = await dash('dotted');
    expect(dashed).not.toBe(solid);
    expect(dotted).not.toBe(solid);
    expect(dotted).not.toBe(dashed);
    expect(await dash('wavy')).toBe(solid);
  });
});
