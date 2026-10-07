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

const clampChannel = (value: number): number => Math.min(255, Math.max(0, value));

const toHex = (value: number): string => value.toString(16).padStart(2, '0');

type Rgba = { r: number; g: number; b: number; a: number };

// WCAG 2 relative luminance (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance).
const relativeLuminance = ({ r, g, b }: Rgba): number => {
  const linear = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

class ColorUtil {
  /**
   * Lightens (positive amt) or darkens (negative amt) a hex colour by adding amt to
   * each RGB channel. Accepts #RGB, #RGBA, #RRGGBB and #RRGGBBAA (the pound is
   * optional and preserved); alpha is kept as is. Anything else, such as rgb(...)
   * or a colour name, is returned unchanged.
   */
  static lightenColor(col: string, amt: number): string {
    const usePound = col[0] === '#';
    let hex = usePound ? col.slice(1) : col;

    if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) {
      return col;
    }

    // Expand the short forms (#RGB, #RGBA) to one byte per channel.
    if (hex.length <= 4) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }

    const r = clampChannel(parseInt(hex.slice(0, 2), 16) + amt);
    const g = clampChannel(parseInt(hex.slice(2, 4), 16) + amt);
    const b = clampChannel(parseInt(hex.slice(4, 6), 16) + amt);
    const alpha = hex.slice(6);

    return (usePound ? '#' : '') + toHex(r) + toHex(g) + toHex(b) + alpha;
  }

  /**
   * The RGB channels (0-255) and alpha (0-1) of a hex colour (#RGB, #RGBA, #RRGGBB or
   * #RRGGBBAA, pound optional), an rgb()/rgba() colour (what the colour picker saves),
   * 'transparent' as a fully transparent black, or undefined for anything else.
   */
  static parse(col: string): Rgba | undefined {
    const value = col.trim().toLowerCase();
    if (value === 'transparent') {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    const fn =
      /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+)(%?)\s*)?\)$/.exec(
        value,
      );
    if (fn) {
      const channel = (c: string | undefined) => clampChannel(Math.round(Number(c)));
      const [r, g, b] = [channel(fn[1]), channel(fn[2]), channel(fn[3])];
      let a = fn[4] === undefined ? 1 : Number(fn[4]);
      if (fn[5] === '%') {
        a /= 100;
      }
      return { r, g, b, a: Math.min(1, Math.max(0, a)) };
    }
    let hex = value[0] === '#' ? value.slice(1) : value;
    if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) {
      return undefined;
    }
    if (hex.length <= 4) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  /**
   * The colour seen when col is painted over the opaque backdrop, as #rrggbb: col itself when it
   * is opaque. Undefined when either colour cannot be parsed.
   */
  static over(col: string, backdrop: string): string | undefined {
    const top = ColorUtil.parse(col);
    const bottom = ColorUtil.parse(backdrop);
    if (!top || !bottom) {
      return undefined;
    }
    const mix = (a: number, b: number): number => Math.round(a * top.a + b * (1 - top.a));
    return `#${toHex(mix(top.r, bottom.r))}${toHex(mix(top.g, bottom.g))}${toHex(mix(top.b, bottom.b))}`;
  }

  /** The WCAG 2 contrast ratio (1 to 21) of two opaque colours, or undefined when one cannot be parsed. */
  static contrastRatio(first: string, second: string): number | undefined {
    const a = ColorUtil.parse(first);
    const b = ColorUtil.parse(second);
    if (!a || !b) {
      return undefined;
    }
    const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
    const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
    return (lighter + 0.05) / (darker + 0.05);
  }
}

export default ColorUtil;
