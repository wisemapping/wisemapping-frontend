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
import Rect from '../../src/components/Rect';
import Ellipse from '../../src/components/Ellipse';
import StraightLine from '../../src/components/StraightLine';
import Group from '../../src/components/Group';
import Image from '../../src/components/Image';
import Text from '../../src/components/Text';
import Workspace from '../../src/components/Workspace';
import CurvedLine from '../../src/components/CurvedLine';
import {
  collectAttributeCalls,
  toLength,
  toNumber,
  toText,
  type ElementAttributes,
  type ShapeAttributes,
} from '../../src/components/StyleAttributes';

const attrs = (rect: Rect) =>
  Object.fromEntries(Array.from(rect.peer._native.attributes).map((a) => [a.name, a.value]));

describe('WorkspaceElement._initialize (attribute bag)', () => {
  it('characterization: Rect defaults', () => {
    expect(attrs(new Rect(0))).toEqual({
      width: '40',
      height: '40',
      x: '5',
      y: '5',
      rx: '0',
      ry: '0',
      fill: 'green',
      stroke: 'black',
      'stroke-width': '1',
    });
  });

  it('batches multi-key attributes into one setter call', () => {
    const spy = jest.spyOn(Rect.prototype, 'setStroke');
    // eslint-disable-next-line no-new
    new Rect(0, { strokeWidth: 3, strokeColor: 'red', strokeStyle: 'dash' });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(3, 'dash', 'red', undefined);
    spy.mockRestore();
  });

  it('does not depend on the key order', () => {
    const a = new Rect(0, { x: 1, width: 10, y: 2, height: 20, fillColor: 'red' });
    const b = new Rect(0, { fillColor: 'red', height: 20, y: 2, width: 10, x: 1 });
    expect(attrs(a)).toEqual(attrs(b));
  });

  it('splits multi-argument strings', () => {
    const rect = new Rect(0, { stroke: '2 dot blue' });
    expect(rect.peer._native.getAttribute('stroke-width')).toBe('2');
    // The dot dash scales with the width of 2 (BL5-77).
    expect(rect.peer._native.getAttribute('stroke-dasharray')).toBe('2 16');
    expect(rect.peer._native.getAttribute('stroke')).toBe('blue');
  });

  it('applies visibility and opacity', () => {
    const rect = new Rect(0, { visibility: false, opacity: 0.5 });
    expect(rect.isVisible()).toBe(false);
    expect(rect.peer.getOpacity()).toBe(0.5);
    rect.setVisibility(true);
    expect(rect.peer._native.style.opacity).toBe('0.5');
  });

  it('a combined key keeps the positions it does not cover', () => {
    const rect = new Rect(0, { strokeOpacity: 0.5, stroke: '3 dot blue' });
    expect(rect.getStroke()).toEqual({ color: 'blue', style: 'dot', opacity: 0.5, width: 3 });
  });

  it('a specific key given after its combined key wins', () => {
    expect(new Rect(0, { stroke: '1 dot blue', strokeWidth: 3 }).getStroke().width).toBe(3);
  });

  it('rejects unsupported attributes', () => {
    expect(() => new Rect(0, { bogus: 1 } as unknown as ShapeAttributes)).toThrow(
      'Unsupported attribute: bogus',
    );
  });

  it('rejects attributes without a setter', () => {
    expect(() => new Ellipse({ coordSizeWidth: 1 } as ShapeAttributes)).toThrow(
      'Could not find function: setCoordSize',
    );
  });

  // W-ATTRBAG: multi-argument strings reached number APIs unparsed.
  it('W-ATTRBAG: size "10 10" is accepted', () => {
    const rect = new Rect(0, { size: '10 10' } as unknown as ShapeAttributes);
    expect(rect.getSize()).toEqual({ width: 10, height: 10 });
  });

  it('W-ATTRBAG: position "3 4" is accepted', () => {
    const rect = new Rect(0, { position: '3 4' } as unknown as ShapeAttributes);
    expect(rect.getPosition()).toEqual({ x: 3, y: 4 });
  });

  it('W-ATTRBAG: the stroke width from a string is a number', () => {
    const rect = new Rect(0, { stroke: '1 solid black' });
    expect(typeof rect.getStroke().width).toBe('number');
  });
});

// Typing T8: the bag is applied with explicit code, and the reflective by-name API is gone.
describe('WorkspaceElement attribute bag without reflection (typing T8)', () => {
  it('has no setAttribute / getAttribute by name', () => {
    const rect = new Rect(0) as unknown as Record<string, unknown>;
    expect(rect.setAttribute).toBeUndefined();
    expect(rect.getAttribute).toBeUndefined();
    expect(rect._attributeNameToFuncName).toBeUndefined();
  });

  it('collects one call per setter, in the order of its first key', () => {
    const calls = collectAttributeCalls({
      strokeColor: 'red',
      x: 1,
      width: 10,
      strokeWidth: 2,
      height: 20,
      visibility: false,
      opacity: 0.5,
    });
    expect([...calls.entries()]).toEqual([
      ['stroke', [2, undefined, 'red']],
      ['position', [1]],
      ['size', [10, 20]],
      ['visibility', [false]],
      ['opacity', [0.5]],
    ]);
  });

  it('skips keys set to undefined, and combined keys that are not strings', () => {
    const calls = collectAttributeCalls({
      width: undefined,
      stroke: 3,
    } as unknown as ElementAttributes);
    expect(calls.size).toBe(0);
  });

  it('converts the arguments explicitly', () => {
    expect(toNumber(undefined)).toBeUndefined();
    expect(toNumber('2')).toBe(2);
    expect(toText(undefined)).toBeUndefined();
    expect(toText(3)).toBe('3');
    expect(toLength('400px')).toBe('400px');
    expect(toLength(7)).toBe(7);
    expect(toLength(true)).toBe('true');
    expect(toLength(undefined)).toBeUndefined();
  });

  it('a missing size argument keeps the current one', () => {
    const image = new Image({ width: 10 });
    expect(image.getSize()).toEqual({ width: 10, height: 1 });
    expect(image.peer._native.hasAttribute('height')).toBe(false);
    const ellipse = new Ellipse({ size: '20' });
    expect(ellipse.getSize()).toEqual({ width: 20, height: 40 });
    expect(ellipse.peer._native.getAttribute('ry')).toBe('20');
  });

  it('a missing position argument keeps the current one', () => {
    const text = new Text({ x: 3 });
    expect(text.getPosition()).toEqual({ x: 3, y: 0 });
    const image = new Image({ position: '4' });
    expect(image.getPosition()).toEqual({ x: 4, y: 0 });
    const group = new Group({ y: 9 });
    expect(group.getPosition()).toEqual({ x: 0, y: 9 });
  });

  it('a missing coordinate argument keeps the current one', () => {
    const group = new Group({ coordSizeWidth: 10, coordOriginY: 4 });
    expect(group.getCoordSize()).toEqual({ width: 10, height: 50 });
    expect(group.getCoordOrigin()).toEqual({ x: 0, y: 4 });
    const workspace = new Workspace({ coordSize: '300', coordOrigin: '7' });
    expect(workspace.getCoordSize()).toEqual({ width: 300, height: 200 });
    expect(workspace.getCoordOrigin()).toEqual({ x: 7, y: 0 });
  });

  it('a workspace keeps CSS lengths for its size and stroke width', () => {
    const workspace = new Workspace({ size: '300px 200px', stroke: '2px dash blue 0.5' });
    expect(workspace.getSize()).toEqual({ width: '300px', height: '200px' });
    expect(workspace._getHtmlContainer().style.border).toBe('2px dashed blue');
    expect(workspace.peer.getSize()).toEqual({ width: 300, height: 200 });
  });

  it('a line rejects a position', () => {
    expect(() => new CurvedLine({ x: 1 } as ElementAttributes)).toThrow(
      'Could not find function: setPosition',
    );
  });
});

describe('StraightLine', () => {
  it('writes the ends with 2 decimals', () => {
    const line = new StraightLine();
    line.setFrom(1.234, 2);
    line.setTo(3, 4.5);
    const node = line.peer._native;
    expect(node.getAttribute('x1')).toBe('1.23');
    expect(node.getAttribute('y1')).toBe('2.00');
    expect(node.getAttribute('x2')).toBe('3.00');
    expect(node.getAttribute('y2')).toBe('4.50');
    expect(line.getFrom()).toEqual({ x: 1.234, y: 2 });
    expect(line.getTo()).toEqual({ x: 3, y: 4.5 });
    expect(line.getType()).toBe('Line');
    expect(line.getElementClass()).toBe(line);
  });

  it('applies its default stroke', () => {
    const line = new StraightLine();
    expect(line.peer._native.getAttribute('stroke')).toBe('#495879');
    expect(line.peer._native.getAttribute('stroke-opacity')).toBe('1');
  });

  // Typing T5: only CurvedLine (a ControlPointLine) has control points; the throwing stubs are gone.
  it.each([
    'setIsSrcControlPointCustom',
    'setIsDestControlPointCustom',
    'setSrcControlPoint',
    'setDestControlPoint',
    'isDestControlPointCustom',
    'isSrcControlPointCustom',
    'getControlPoints',
    'setDashed',
  ])('has no %s (typing T5)', (method) => {
    expect((new StraightLine() as unknown as Record<string, unknown>)[method]).toBeUndefined();
  });

  // Section 3.6: the dead static setPosition/setSize/setFill stubs are deleted.
  it('has no static setPosition, setSize or setFill stubs', () => {
    const statics = StraightLine as unknown as Record<string, unknown>;
    expect(statics.setPosition).toBeUndefined();
    expect(statics.setSize).toBeUndefined();
    expect(statics.setFill).toBeUndefined();
  });
});
