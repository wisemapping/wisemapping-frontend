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

import Designer from '../../src/components/Designer';
import { StrokeStyle } from '../../src/components/model/RelationshipModel';
import Relationship from '../../src/components/Relationship';
import XMLSerializerFactory from '../../src/components/persistence/XMLSerializerFactory';
import { buildDesigner, SAMPLE_MAP, StubWidgetManager } from './commands/designer-harness';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/** Selecting, styling and moving the ends of a relationship on a live designer. */

const nativeOf = (element: unknown): SVGElement =>
  (element as { peer: { _native: SVGElement } }).peer._native;

const lineOf = (relationship: Relationship): SVGElement => nativeOf(relationship.getLine());

const designers: Designer[] = [];
const editable = async () => {
  const harness = await buildDesigner();
  designers.push(harness.designer);
  return harness.designer.getModel().getRelationships()[0];
};

const readOnly = async () => {
  const designer = new Designer({
    zoom: 1,
    mode: 'viewonly-public',
    divContainer: document.body.appendChild(document.createElement('div')),
    widgetManager: new StubWidgetManager(),
  });
  designers.push(designer);
  const dom = new DOMParser().parseFromString(SAMPLE_MAP, 'text/xml');
  await designer.loadMap(XMLSerializerFactory.createFromDocument(dom).loadFromDom(dom, 'm'));
  return designer.getModel().getRelationships()[0];
};

afterEach(() => {
  designers.splice(0).forEach((designer) => designer.dispose());
});

describe('Relationship selection', () => {
  it('takes the focus on a click on its line, without letting the click through', async () => {
    const relationship = await editable();
    const reached = jest.fn();
    document.addEventListener('click', reached);
    try {
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      lineOf(relationship).dispatchEvent(click);
      expect(relationship.isOnFocus()).toBe(true);
      expect(click.defaultPrevented).toBe(true);
      expect(reached).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('click', reached);
    }
  });

  it('is not selectable, and shows the default cursor, on a read-only map', async () => {
    const relationship = await readOnly();
    expect(lineOf(relationship).style.cursor).toBe('default');
    lineOf(relationship).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(relationship.isOnFocus()).toBe(false);
  });

  it('leaves the focus when it is hidden', async () => {
    const relationship = await editable();
    relationship.setOnFocus(true);
    relationship.setVisibility(false);
    expect(relationship.isOnFocus()).toBe(false);
    expect(relationship.isInWorkspace()).toBe(true);
  });
});

describe('Relationship stroke', () => {
  it.each([
    [StrokeStyle.SOLID, null],
    [StrokeStyle.DASHED, '8,4'],
    [StrokeStyle.DOTTED, '1,3'],
    ['wavy' as StrokeStyle, '8,4'],
  ])('draws the %s style', async (style, dash) => {
    const relationship = await editable();
    relationship.getModel().setStrokeStyle(style);
    relationship.setStroke('#ff0000', 'solid', 1);
    expect(lineOf(relationship).getAttribute('stroke-dasharray')).toBe(dash);
    expect(lineOf(relationship).getAttribute('stroke')).toBe('#ff0000');
  });

  it('fades the line and both arrows together', async () => {
    const relationship = await editable();
    relationship.setShowStartArrow(true);
    relationship.setOpacity(0.4);
    const arrows = relationship as unknown as { _startArrow: unknown; _endArrow: unknown };
    expect(lineOf(relationship).style.opacity).toBe('0.4');
    expect(nativeOf(arrows._startArrow).style.opacity).toBe('0.4');
    expect(nativeOf(arrows._endArrow).style.opacity).toBe('0.4');
  });

  it('shows the arrow of a focused relationship when it is turned on', async () => {
    const relationship = await editable();
    relationship.setOnFocus(true);
    relationship.setShowStartArrow(true);
    relationship.setShowEndArrow(false);
    const focus = relationship as unknown as { _focusStartArrow: unknown; _focusEndArrow: unknown };
    expect(nativeOf(focus._focusStartArrow).getAttribute('visibility')).toBe('visible');
    expect(nativeOf(focus._focusEndArrow).getAttribute('visibility')).toBe('hidden');
  });
});

describe('Relationship ends and control points', () => {
  it('moves its ends, its control points and its arrows', async () => {
    const relationship = await editable();
    relationship.setFrom(10, 20);
    relationship.setTo(300, 40);
    relationship.setSrcControlPoint({ x: 50, y: -10 });
    relationship.setDestControlPoint({ x: -30, y: 15 });

    const line = relationship.getLine();
    expect(line.getFrom()).toEqual({ x: 10, y: 20 });
    expect(line.getTo()).toEqual({ x: 300, y: 40 });
    expect(relationship.getControlPoints()).toEqual([
      { x: 50, y: -10 },
      { x: -30, y: 15 },
    ]);
  });

  it('tracks which control points the user placed', async () => {
    const relationship = await editable();
    relationship.setIsSrcControlPointCustom(true);
    relationship.setIsDestControlPointCustom(false);
    expect(relationship.isSrcControlPointCustom()).toBe(true);
    expect(relationship.isDestControlPointCustom()).toBe(false);
  });

  it('describes itself', async () => {
    const relationship = await editable();
    expect(relationship.getType()).toBe('Relationship');
    expect(relationship.getId()).toBe(relationship.getModel().getId());
    expect(Relationship.getStrokeColor()).toBe('#9b74e6');
  });
});
