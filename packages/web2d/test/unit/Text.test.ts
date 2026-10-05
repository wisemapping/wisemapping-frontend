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
import TextPeer, { invalidateTextMeasurements } from '../../src/components/peer/svg/TextPeer';
import FontPeer, { FONT_PT_TO_PX } from '../../src/components/peer/svg/FontPeer';
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

  // Section 3.5: a plain ' ' is collapsed when leading or trailing (default xml:space), so a
  // trailing empty line was dropped and getFontHeight (bbox height / lines) came out too small.
  it('empty lines become a no-break-space tspan, which is never collapsed', () => {
    const text = new Text();
    text.setText('\na\n\nb\n');
    expect(tspans(text).map((t) => t.textContent)).toEqual([
      '\u00A0',
      'a',
      '\u00A0',
      'b',
      '\u00A0',
    ]);
  });

  it('a trailing newline adds an empty line that is measured', () => {
    const text = new Text();
    text.setFont('Arial', 10, 'normal', 'normal');
    text.setText('a\n');
    expect(text.peer.getTextLines()).toEqual(['a', '']);
    expect(text.getShapeHeight()).toBeCloseTo(2 * 13.4 * LINE_HEIGHT_RATIO);
  });

  // Section 3.5: getTextLines kept \r from CRLF text.
  it('splits CRLF text without keeping \\r', () => {
    const text = new Text();
    text.setText('a\r\nb');
    expect(text.peer.getTextLines()).toEqual(['a', 'b']);
  });

  it('splits on a lone CR', () => {
    const text = new Text();
    text.setText('a\rb\r\n\nc');
    expect(text.peer.getTextLines()).toEqual(['a', 'b', '', 'c']);
  });

  // The tspans share the text's x format (2 decimals), so a redraw that calls setText and then
  // setPosition with the same values writes nothing.
  it('every tspan starts a new line at the text x', () => {
    const text = new Text();
    text.setPosition(12.5, 30);
    text.setText('a\nb');
    tspans(text).forEach((t) => {
      expect(t.getAttribute('dy')).toBe('1em');
      expect(t.getAttribute('x')).toBe('12.50');
      expect(t.getAttribute('x')).toBe(text.peer._native.getAttribute('x'));
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

  it('setText reuses the tspans of the lines it keeps', () => {
    const text = new Text();
    text.setText('a\nb');
    const before = tspans(text);
    text.setText('a\nb');
    expect(tspans(text)).toEqual(before);
    expect(tspans(text)[0]).toBe(before[0]);

    text.setText('a\nc\nd');
    const after = tspans(text);
    expect(after.slice(0, 2)).toEqual(before);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    expect(after.map((t) => t.textContent)).toEqual(['a', 'c', 'd']);
  });

  it('setText removes the tspans of the lines it drops', () => {
    const text = new Text();
    text.setText('a\nb\nc');
    const [first] = tspans(text);
    text.setText('z');
    expect(tspans(text)).toHaveLength(1);
    expect(tspans(text)[0]).toBe(first);
    expect(first?.textContent).toBe('z');
    text.setText('');
    expect(text.peer._native.childNodes).toHaveLength(0);
  });

  it('setText clears nodes it does not own, as before', () => {
    const text = new Text();
    text.setText('a');
    text.peer._native.appendChild(document.createTextNode('stray'));
    text.setText('b');
    expect(Array.from(text.peer._native.childNodes).map((n) => n.textContent)).toEqual(['b']);

    // A node that replaced one of the line tspans is cleared too.
    const [tspan] = tspans(text);
    const other = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    text.peer._native.replaceChild(other, tspan as SVGTSpanElement);
    text.setText('c');
    expect(tspans(text)).toHaveLength(1);
    expect(tspans(text)[0]).not.toBe(other);
    expect(tspans(text)[0]?.textContent).toBe('c');
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
    text.setFontSize(8);
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

  // Section 3.5: setFont(name, ...) rebuilt the FontPeer, so empty arguments reset to defaults.
  it('setFont with only a name keeps size, style and weight', () => {
    const text = new Text();
    text.setFont('Arial', 20, 'italic', 'bold');
    text.setFont('Tahoma', undefined as unknown as number, '', undefined as unknown as string);
    const node = text.peer._native;
    expect(node.getAttribute('font-family')).toBe('Tahoma');
    expect(node.getAttribute('font-size')).toBe('26.9');
    expect(node.getAttribute('font-style')).toBe('italic');
    expect(node.getAttribute('font-weight')).toBe('900');
  });

  it('setFont with an empty weight keeps the weight', () => {
    const text = new Text();
    text.setFont('Arial', 10, 'normal', 'bold');
    text.setFont('', 12, '', '');
    expect(text.peer._native.getAttribute('font-family')).toBe('Arial');
    expect(text.peer._native.getAttribute('font-weight')).toBe('900');
  });

  // Section 3.5: setTextAlignment was stored but never rendered, and nothing called it.
  it('has no text alignment API', () => {
    expect('setTextAlignment' in new Text()).toBe(false);
    expect('getTextAlignment' in new Text().peer).toBe(false);
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

  // The rendered weight is heavier on purpose (e4e0602b); the semantic value is kept internally.
  it('withFontName keeps size, style and the semantic weight', () => {
    const font = new FontPeer('Arial');
    font.init({ size: 12, style: 'italic', weight: 'bold' });
    const copy = font.withFontName('Tahoma');
    expect(copy.getFontName()).toBe('Tahoma');
    expect(copy.getSize()).toBe(12);
    expect(copy.getStyle()).toBe('italic');
    expect(copy.getWeight()).toBe('900');
    copy.setSize(20);
    expect(font.getSize()).toBe(12);
  });

  it('graph size is pt × 43/32 and HTML size is the graph size × scale', () => {
    const font = new FontPeer('Arial');
    font.setSize(10);
    expect(FONT_PT_TO_PX).toBe(43 / 32);
    expect(font.getGraphSize()).toBe('13.4');
    expect(font.getHtmlSize({ width: 1, height: 1 })).toBe('13.4');
    expect(font.getHtmlSize({ width: 2, height: 2 })).toBe('26.8');
  });

  // Section 3.5: the editor used 42/32 and the canvas 43/32, so editor text was about 3 % smaller.
  it('HTML and SVG font sizes use the same pt to px ratio', () => {
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

  // Section 3.5: getFontHeight = bboxHeight / lines gave NaN for ''.
  it('getFontHeight of an empty text is a number', () => {
    const text = new Text();
    text.setText('');
    expect(text.getFontHeight()).toBe(0);
  });

  // Section 3.5: getBBox throws on a detached or undisplayed node in some browsers.
  it('a getBBox failure measures as an empty box', () => {
    const text = new Text();
    text.setText('abc');
    (text.peer._native as unknown as { getBBox: () => DOMRect }).getBBox = () => {
      throw new Error('NS_ERROR_FAILURE');
    };
    expect(text.getShapeWidth()).toBe(0);
    expect(text.getShapeHeight()).toBe(0);
    expect(text.getFontHeight()).toBe(0);
  });
});

describe('Text measurement cache', () => {
  type Box = { width: number; height: number };

  /** A text attached to the document, whose getBBox is counted (and optionally replaced). */
  const attached = (box?: () => Box) => {
    const text = new Text();
    document.body.append(text.peer._native);
    const node = text.peer._native as unknown as { getBBox: () => Box };
    const original = node.getBBox.bind(node);
    const calls = { n: 0 };
    node.getBBox = () => {
      calls.n += 1;
      return box ? box() : original();
    };
    text.setFont('Arial', 10, 'normal', 'normal');
    text.setText('abc');
    return { text, calls };
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('measures once while the text and font stay the same', () => {
    const { text, calls } = attached();
    const width = text.getShapeWidth();
    expect(text.getShapeWidth()).toBe(width);
    text.getShapeHeight();
    text.getFontHeight();
    expect(calls.n).toBe(1);
  });

  // BL5-87: a redraw read the width and the height with two calls. measure() returns both from
  // one getBBox, also when the result can not be cached (a detached node).
  it('BL5-87: measure() returns the width and height from one getBBox', () => {
    const { text, calls } = attached(() => ({ width: 30, height: 12 }));
    text.peer._native.remove();
    expect(text.measure()).toEqual({ width: 30, height: 12 });
    expect(calls.n).toBe(1);
    expect(text.getShapeWidth()).toBe(30);
    expect(text.getShapeHeight()).toBe(12);
  });

  it('BL5-87: measure() shares the cache with getShapeWidth and getShapeHeight', () => {
    const { text, calls } = attached(() => ({ width: 30, height: 12 }));
    text.getShapeWidth();
    const size = text.measure();
    expect(size).toEqual({ width: 30, height: 12 });
    // A copy: changing it does not change the cached measurement.
    size.width = 0;
    expect(text.measure().width).toBe(30);
    expect(calls.n).toBe(1);
  });

  it.each([
    ['the text', (t: Text) => t.setText('abcd')],
    ['the size', (t: Text) => t.setFontSize(12)],
    ['the family', (t: Text) => t.setFontName('Verdana')],
    ['the style', (t: Text) => t.setStyle('italic')],
    ['the weight', (t: Text) => t.setWeight('bold')],
    ['setFont', (t: Text) => t.setFont('Arial', 11, 'normal', 'normal')],
  ])('re-measures when %s changes', (_name, change) => {
    const { text, calls } = attached();
    text.getShapeWidth();
    change(text);
    text.getShapeWidth();
    text.getShapeWidth();
    expect(calls.n).toBe(2);
  });

  it('returns the new measurement after a change', () => {
    const { text } = attached();
    expect(text.getShapeWidth()).toBeCloseTo(3 * 13.4 * CHAR_WIDTH_RATIO);
    text.setText('abcdef');
    expect(text.getShapeWidth()).toBeCloseTo(6 * 13.4 * CHAR_WIDTH_RATIO);
  });

  it('setting the same values again does not re-measure', () => {
    const { text, calls } = attached();
    text.getShapeWidth();
    text.setText('abc');
    text.setFont('Arial', 10, 'normal', 'normal');
    text.setFontName('Arial');
    text.getShapeWidth();
    expect(calls.n).toBe(1);
  });

  // A detached or undisplayed node measures as zeros in some browsers: that is not cached, so the
  // text is measured again once it is displayed.
  it('does not cache a detached text', () => {
    const { text, calls } = attached();
    text.peer._native.remove();
    text.getShapeWidth();
    text.getShapeWidth();
    expect(calls.n).toBe(2);
  });

  it('does not cache an empty box for a non-empty text', () => {
    let box = { width: 0, height: 0 };
    const { text, calls } = attached(() => box);
    expect(text.getShapeWidth()).toBe(0);
    box = { width: 30, height: 12 };
    expect(text.getShapeWidth()).toBe(30);
    expect(text.getShapeWidth()).toBe(30);
    expect(calls.n).toBe(2);
  });

  it('caches the empty box of an empty text', () => {
    const { text, calls } = attached(() => ({ width: 0, height: 0 }));
    text.setText('');
    text.getShapeWidth();
    text.getShapeHeight();
    expect(calls.n).toBe(1);
  });

  // Until a font is written on the node it inherits one, which the cache key cannot see.
  it('does not cache a text whose font was never set', () => {
    const text = new Text();
    document.body.append(text.peer._native);
    text.setText('abc');
    const spy = jest.spyOn(text.peer._native as unknown as { getBBox: () => Box }, 'getBBox');
    text.getShapeWidth();
    text.getShapeWidth();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('does not cache a failed measurement', () => {
    let fail = true;
    const { text, calls } = attached(() => {
      if (fail) {
        throw new Error('NS_ERROR_FAILURE');
      }
      return { width: 20, height: 10 };
    });
    expect(text.getShapeWidth()).toBe(0);
    fail = false;
    expect(text.getShapeWidth()).toBe(20);
    expect(text.getShapeWidth()).toBe(20);
    expect(calls.n).toBe(2);
  });

  it('a returned measurement cannot change the cache', () => {
    const { text } = attached(() => ({ width: 20, height: 10 }));
    const peer = text.peer as unknown as { measure: () => Box };
    peer.measure().width = 99;
    expect(text.getShapeWidth()).toBe(20);
  });

  it('invalidateTextMeasurements drops every cached measurement', () => {
    const { text, calls } = attached();
    text.getShapeWidth();
    invalidateTextMeasurements();
    text.getShapeWidth();
    text.getShapeWidth();
    expect(calls.n).toBe(2);
  });

  // A web font that finishes loading changes the metrics of the text already measured with the
  // fallback font.
  it('a web font that finishes loading drops every cached measurement', () => {
    const listeners: Record<string, () => void> = {};
    const fonts = {
      addEventListener: (type: string, fn: () => void) => {
        listeners[type] = fn;
      },
    };
    Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });
    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
        const IsolatedText = require('../../src/components/Text').default as typeof Text;
        const text = new IsolatedText();
        document.body.append(text.peer._native);
        text.setFont('Arial', 10, 'normal', 'normal');
        text.setText('abc');
        const spy = jest.spyOn(text.peer._native as unknown as { getBBox: () => Box }, 'getBBox');
        text.getShapeWidth();
        text.getShapeWidth();
        expect(spy).toHaveBeenCalledTimes(1);
        listeners.loadingdone?.();
        text.getShapeWidth();
        expect(spy).toHaveBeenCalledTimes(2);
      });
    } finally {
      delete (document as unknown as { fonts?: unknown }).fonts;
    }
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
    expect(text.getHtmlFontSize()).toBe('26.8');
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
    expect(text.getHtmlFontSize()).toBe('53.6');
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

  // W-HTMLFONT: the scale came from the workspace peer's _size, set once. mindplot's Canvas
  // wrote the SVG width/height directly on resize, so the editor font was scaled by H0/H1.
  it('W-HTMLFONT: the HTML font size is right after the SVG is resized', () => {
    const workspace = new Workspace();
    workspace.setSize('800px', '800px');
    workspace.setCoordSize(800, 800);
    const text = new Text();
    workspace.append(text);
    text.setFontSize(10);
    expect(text.getHtmlFontSize()).toBe('13.4');

    // What mindplot's Canvas.setZoom did after the container shrinks to 400 px (zoom 1).
    const svg = workspace.getSVGElement();
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '400');
    workspace.setCoordSize(400, 400);
    expect(text.getHtmlFontSize()).toBe('13.4');
  });

  it('W-HTMLFONT: the HTML font size follows Workspace.setSize and the zoom', () => {
    const workspace = new Workspace();
    workspace.setSize('800px', '800px');
    workspace.setCoordSize(800, 800);
    const text = new Text();
    workspace.append(text);
    text.setFontSize(10);
    workspace.setSize('400px', '400px');
    workspace.setCoordSize(800, 800); // zoom 2: the coordinates are twice the pixels.
    expect(text.getHtmlFontSize()).toBe('6.7');
  });

  it('a workspace SVG without a width or height uses the peer size', () => {
    const workspace = new Workspace();
    workspace.setSize('400px', '400px');
    workspace.setCoordSize(200, 200);
    const text = new Text();
    workspace.append(text);
    workspace.getSVGElement().removeAttribute('width');
    workspace.getSVGElement().removeAttribute('height');
    expect(TransformUtil.workoutScale(text.peer)).toEqual({ width: 2, height: 2 });
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

  // BL5-76: the inline editor is absolutely positioned inside its offset parent, but got document
  // coordinates. A container passed in makes the position relative to it.
  it('BL5-76: is relative to the container passed in', () => {
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.append(container);
    const workspace = new Workspace();
    workspace.addItAsChildTo(container);
    const text = new Text();
    workspace.append(text);
    container.getBoundingClientRect = () => ({ top: 100, left: 20 }) as DOMRect;
    text.peer._native.getBoundingClientRect = () => ({ top: 130, left: 60 }) as DOMRect;
    expect(text.getNativePosition(container)).toEqual({ top: 30, left: 40 });
    container.remove();
  });

  // An absolute element whose offset parent is a static <body> is placed in the initial containing
  // block, which is the document: the body's own offset (its margin) must not be subtracted.
  it('BL5-76: a static body container gives document coordinates', () => {
    const workspace = new Workspace();
    document.body.append(workspace._getHtmlContainer());
    const text = new Text();
    workspace.append(text);
    const node = text.peer._native;
    node.getClientRects = () => [{}] as unknown as DOMRectList;
    node.getBoundingClientRect = () => ({ top: 30, left: 40 }) as DOMRect;
    const bodyRect = jest
      .spyOn(document.body, 'getBoundingClientRect')
      .mockReturnValue({ top: 8, left: 8 } as DOMRect);
    expect(text.getNativePosition(document.body)).toEqual({ top: 30, left: 40 });
    expect(text.getNativePosition(document.documentElement)).toEqual({ top: 30, left: 40 });
    bodyRect.mockRestore();
    workspace._getHtmlContainer().remove();
  });
});
