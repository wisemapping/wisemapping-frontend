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
import StyleAttributes from '../../src/components/StyleAttributes';

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
    expect(spy).toHaveBeenCalledWith(3, 'dash', 'red');
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
    expect(rect.peer._native.getAttribute('stroke-dasharray')).toBe('1 8');
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
    expect(() => new Rect(0, { bogus: 1 } as unknown as StyleAttributes)).toThrow(
      'Unsupported attribute: bogus',
    );
  });

  it('rejects attributes without a setter', () => {
    expect(() => new Ellipse({ coordSizeWidth: 1 })).toThrow('Could not find function');
  });

  // W-ATTRBAG: multi-argument strings reached number APIs unparsed.
  it('W-ATTRBAG: size "10 10" is accepted', () => {
    const rect = new Rect(0, { size: '10 10' } as unknown as StyleAttributes);
    expect(rect.getSize()).toEqual({ width: 10, height: 10 });
  });

  it('W-ATTRBAG: position "3 4" is accepted', () => {
    const rect = new Rect(0, { position: '3 4' } as unknown as StyleAttributes);
    expect(rect.getPosition()).toEqual({ x: 3, y: 4 });
  });

  it('W-ATTRBAG: the stroke width from a string is a number', () => {
    const rect = new Rect(0, { stroke: '1 solid black' });
    expect(typeof rect.getStroke().width).toBe('number');
  });
});

describe('WorkspaceElement.setAttribute / getAttribute', () => {
  it('sets and gets single attributes', () => {
    const rect = new Rect(0);
    rect.setAttribute('strokeColor', 'red');
    rect.setAttribute('x', 12);
    rect.setAttribute('fillColor', 'blue');
    expect(rect.getAttribute('strokeColor')).toBe('red');
    expect(rect.getAttribute('x')).toBe(12);
    expect(rect.getAttribute('fillColor')).toBe('blue');
  });

  it('sets multi-argument attributes from strings', () => {
    const rect = new Rect(0);
    rect.setAttribute('stroke', '4 dash red');
    expect(rect.getAttribute('strokeWidth')).toBe(4);
    expect(rect.getAttribute('strokeStyle')).toBe('dash');
  });

  it('rejects unknown attributes and attributes without a getter mapping', () => {
    const rect = new Rect(0);
    expect(() => rect.setAttribute('bogus', 1)).toThrow();
    expect(() => rect.getAttribute('bogus')).toThrow();
    expect(() => rect.getAttribute('size')).toThrow();
    expect(() => rect.getAttribute('coordSizeWidth')).toThrow();
    expect(() => rect.setAttribute('coordSizeWidth', 1)).toThrow();
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

  it.each([
    'setIsSrcControlPointCustom',
    'setIsDestControlPointCustom',
    'setDashed',
    'setSrcControlPoint',
    'setDestControlPoint',
    'isDestControlPointCustom',
    'isSrcControlPointCustom',
    'getControlPoints',
  ])('characterization: %s is a throwing Line stub (typing step T5)', (method) => {
    const line = new StraightLine() as unknown as Record<string, () => unknown>;
    expect(() => line[method]!()).toThrow('Method not implemented.');
  });

  it('characterization: the static stubs throw and are dead', () => {
    expect(() => StraightLine.setPosition()).toThrow();
    expect(() => StraightLine.setSize()).toThrow();
    expect(() => StraightLine.setFill()).toThrow();
  });
});
