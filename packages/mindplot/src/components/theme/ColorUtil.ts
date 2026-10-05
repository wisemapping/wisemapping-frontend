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
}

export default ColorUtil;
