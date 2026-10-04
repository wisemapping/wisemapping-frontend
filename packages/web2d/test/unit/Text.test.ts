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
import Text from '../../src/components/Text';
import Workspace from '../../src/components/Workspace';
import Group from '../../src/components/Group';
import TextPeer from '../../src/components/peer/svg/TextPeer';
import FontPeer from '../../src/components/peer/svg/FontPeer';
import RectPeer from '../../src/components/peer/svg/RectPeer';
import TransformUtil from '../../src/components/peer/utils/TransformUtils';
import { CHAR_WIDTH_RATIO, LINE_HEIGHT_RATIO } from '../setup';

const tspans = (text: Text) => Array.from(text.peer._native.querySelectorAll('tspan'));

describe('TextPeer lines', () => {
  it('splits on \\n', () => {
    const text = new Text();
    text.setText('a\nbb\nccc');
    expect(text.peer.getTextLines()).toEqual(['a', 'bb', 'ccc']);
    expect(tspans(text).map((t) => t.textContent)).toEqual(['a', 'bb', 'ccc']);
    expect(text.getText()).toBe('a\nbb\nccc');
  });

  it('the empty string has no lines', () => {
    const text = new Text();
    text.setText('');
    expect(text.peer.getTextLines()).toEqual([]);
    expect(tspans(text)).toHaveLength(0);
  });

  it('characterization: empty lines become a single-space tspan', () => {
    const text = new Text();
    text.setText('a\n\nb');
    expect(tspans(text).map((t) => t.textContent)).toEqual(['a', ' ', 'b']);
  });

  it('characterization: a trailing newline adds an empty line', () => {
    const text = new Text();
    text.setText('a\n');
    expect(text.peer.getTextLines()).toEqual(['a', '']);
  });

  // Section 3.5: getTextLines keeps \r from CRLF text.
  it.failing('splits CRLF text without keeping \\r', () => {
    const text = new Text();
    text.setText('a\r\nb');
    expect(text.peer.getTextLines()).toEqual(['a', 'b']);
  });

  it('every tspan starts a new line at the text x', () => {
    const text = new Text();
    text.setPosition(12.5, 30);
    text.setText('a\nb');
    tspans(text).forEach((t) => {
      expect(t.getAttribute('dy')).toBe('1em');
      expect(t.getAttribute('x')).toBe('12.5');
    });
  });

  it('setPosition moves the text and its tspans', () => {
    const text = new Text();
    text.setText('a\nb');
    text.setPosition(5, 6);
    expect(text.peer._native.getAttribute('x')).toBe('5.00');
    expect(text.peer._native.getAttribute('y')).toBe('6.00');
    tspans(text).forEach((t) => expect(t.getAttribute('x')).toBe('5.00'));
    expect(text.getPosition()).toEqual({ x: 5, y: 6 });
  });

  it('characterization: setText rebuilds every tspan, even for the same text', () => {
    const text = new Text();
    text.setText('a\nb');
    const before = tspans(text);
    text.setText('a\nb');
    expect(tspans(text)[0]).not.toBe(before[0]);
  });
});

describe('TextPeer fonts', () => {
  it('setFont writes family, size (pt × 43/32), style and mapped weight', () => {
    const text = new Text();
    text.setFont('Verdana', 10, 'italic', 'bold');
    const node = text.peer._native;
    expect(node.getAttribute('font-family')).toBe('Verdana');
    expect(node.getAttribute('font-size')).toBe('13.4');
    expect(node.getAttribute('font-style')).toBe('italic');
    expect(node.getAttribute('font-weight')).toBe('900');
  });

  it('characterization: normal weight renders as 600', () => {
    const text = new Text();
    text.setFont('Arial', 10, 'normal', 'normal');
    expect(text.peer._native.getAttribute('font-weight')).toBe('600');
    text.setWeight('300' as never);
    expect(text.peer._native.getAttribute('font-weight')).toBe('300');
  });

  it('individual setters keep the other font properties', () => {
    const text = new Text();
    text.setFont('Arial', 10, 'italic', 'bold');
    text.setFontSize(20);
    text.setStyle('normal');
    text.setFontName('Tahoma');
    const node = text.peer._native;
    expect(node.getAttribute('font-family')).toBe('Tahoma');
    expect(node.getAttribute('font-size')).toBe('26.9');
    expect(node.getAttribute('font-style')).toBe('normal');
    expect(node.getAttribute('font-weight')).toBe('900');
    text.peer.setTextSize(8);
    expect(node.getAttribute('font-size')).toBe('10.8');
  });

  it('getFontStyle reports the font and colour', () => {
    const text = new Text();
    text.setFont('Arial', 12, 'italic', 'bold');
    text.setColor('#333');
    expect(text.getColor()).toBe('#333');
    expect(text.getFontStyle()).toEqual({
      fontFamily: 'Arial',
      size: '12',
      style: 'italic',
      weight: '900',
      color: '#333',
    });
  });

  // Section 3.5: setFont(name, ...) rebuilds the FontPeer, so empty arguments reset to defaults.
  it.failing('setFont with only a name keeps size, style and weight', () => {
    const text = new Text();
    text.setFont('Arial', 20, 'italic', 'bold');
    text.setFont('Tahoma', undefined as unknown as number, '', undefined as unknown as string);
    expect(text.peer._native.getAttribute('font-size')).toBe('26.9');
    expect(text.peer._native.getAttribute('font-style')).toBe('italic');
  });

  it('stores the alignment', () => {
    const text = new Text();
    expect(text.peer.getTextAlignment()).toBe('left');
    text.setTextAlignment('center');
    expect(text.peer.getTextAlignment()).toBe('center');
    expect(() => text.setTextAlignment('')).toThrow();
  });
});

describe('FontPeer', () => {
  it('defaults and init', () => {
    const font = new FontPeer('Arial');
    expect(font.getSize()).toBe(10);
    expect(font.getStyle()).toBe('normal');
    font.init({ size: 12, style: 'italic', weight: 'bold' });
    expect(font.getSize()).toBe(12);
    expect(font.getStyle()).toBe('italic');
    expect(font.getWeight()).toBe('900');
    font.init({});
    expect(font.getSize()).toBe(12);
  });

  it('graph size is pt × 43/32 and HTML size is pt × scale × 42/32', () => {
    const font = new FontPeer('Arial');
    font.setSize(10);
    expect(font.getGraphSize()).toBe('13.4');
    expect(font.getHtmlSize({ width: 1, height: 1 })).toBe('13');
    expect(font.getHtmlSize({ width: 2, height: 2 })).toBe('26');
  });

  // Section 3.5: the editor uses 42/32 and the canvas 43/32, so editor text is about 3 % smaller.
  it.failing('HTML and SVG font sizes use the same pt to px ratio', () => {
    const font = new FontPeer('Arial');
    font.setSize(30);
    expect(Number(font.getHtmlSize({ width: 1, height: 1 }))).toBeCloseTo(
      Number(font.getGraphSize()),
      0,
    );
  });
});

describe('Text measurement (fake getBBox)', () => {
  const measured = () => {
    const text = new Text();
    text.setFont('Arial', 10, 'normal', 'normal');
    text.setText('abc\nab');
    return text;
  };

  it('getShapeWidth and getShapeHeight come from getBBox', () => {
    const text = measured();
    expect(text.getShapeWidth()).toBeCloseTo(3 * 13.4 * CHAR_WIDTH_RATIO);
    expect(text.getShapeHeight()).toBeCloseTo(2 * 13.4 * LINE_HEIGHT_RATIO);
  });

  it('getFontHeight is the height of one line', () => {
    expect(measured().getFontHeight()).toBeCloseTo(13.4 * LINE_HEIGHT_RATIO);
  });

  // Section 3.5: getFontHeight = bboxHeight / lines gives NaN for ''.
  it.failing('getFontHeight of an empty text is a number', () => {
    const text = new Text();
    text.setText('');
    expect(Number.isNaN(text.getFontHeight())).toBe(false);
  });
});

describe('Text HTML font size (TransformUtil)', () => {
  it('scales by the workspace size / coordSize ratio', () => {
    const workspace = new Workspace();
    workspace.setSize('400px', '400px');
    workspace.setCoordSize(200, 200);
    const text = new Text();
    workspace.append(text);
    text.setFontSize(10);
    expect(text.getHtmlFontSize()).toBe('26');
  });

  it('multiplies the scale of nested groups', () => {
    const workspace = new Workspace();
    workspace.setSize('400px', '400px');
    workspace.setCoordSize(200, 200);
    const group = new Group({ width: 100, height: 100 });
    group.setCoordSize(50, 50);
    workspace.append(group);
    const text = new Text();
    group.append(text);
    text.setFontSize(10);
    expect(TransformUtil.workoutScale(text.peer)).toEqual({ width: 4, height: 4 });
    expect(text.getHtmlFontSize()).toBe('53');
  });

  it('a detached text has scale 1', () => {
    const text = new Text();
    expect(TransformUtil.workoutScale(text.peer)).toEqual({ width: 1, height: 1 });
  });

  it('rejects parents that are not groups or workspaces', () => {
    const peer = new TextPeer(new FontPeer('Arial'));
    peer.setParent(new RectPeer(0));
    expect(() => TransformUtil.workoutScale(peer)).toThrow('Not supported element');
  });

  // W-HTMLFONT: the scale comes from the workspace peer's _size, set once. mindplot's Canvas
  // writes the SVG width/height directly on resize, so the editor font is scaled by H0/H1.
  it.failing('W-HTMLFONT: the HTML font size is right after the SVG is resized', () => {
    const workspace = new Workspace();
    workspace.setSize('800px', '800px');
    workspace.setCoordSize(800, 800);
    const text = new Text();
    workspace.append(text);
    text.setFontSize(10);
    expect(text.getHtmlFontSize()).toBe('13');

    // What mindplot's Canvas.setZoom does after the container shrinks to 400 px (zoom 1).
    const svg = workspace.getSVGElement();
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '400');
    workspace.setCoordSize(400, 400);
    expect(text.getHtmlFontSize()).toBe('13');
  });
});

describe('Text native position (DomUtils.getPosition, W-NATIVEPOS)', () => {
  it('characterization: returns document coordinates for SVG text', () => {
    const workspace = new Workspace();
    document.body.append(workspace._getHtmlContainer());
    const text = new Text();
    workspace.append(text);
    const node = text.peer._native;
    node.getClientRects = () => [{}] as unknown as DOMRectList;
    node.getBoundingClientRect = () => ({ top: 30, left: 40 }) as DOMRect;
    expect(text.getNativePosition()).toEqual({ top: 30, left: 40 });
    workspace._getHtmlContainer().remove();
  });
});
