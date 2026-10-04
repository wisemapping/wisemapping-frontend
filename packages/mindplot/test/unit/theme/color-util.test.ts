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
import ColorUtil from '../../../src/components/theme/ColorUtil';

describe('ColorUtil.lightenColor', () => {
  it('zero-pads every channel', () => {
    expect(ColorUtil.lightenColor('#000000', 15)).toBe('#0f0f0f');
    expect(ColorUtil.lightenColor('#000000', 0)).toBe('#000000');
  });

  it('keeps each channel in place', () => {
    expect(ColorUtil.lightenColor('#102030', 1)).toBe('#112131');
  });

  it('clamps at both ends', () => {
    expect(ColorUtil.lightenColor('#f0f0f0', 40)).toBe('#ffffff');
    expect(ColorUtil.lightenColor('#101010', -40)).toBe('#000000');
  });

  it('expands 3-digit hex', () => {
    expect(ColorUtil.lightenColor('#fff', -16)).toBe('#efefef');
    expect(ColorUtil.lightenColor('#123', 16)).toBe('#213243');
  });

  it('preserves the alpha channel of 8- and 4-digit hex', () => {
    expect(ColorUtil.lightenColor('#10203080', 16)).toBe('#20304080');
    expect(ColorUtil.lightenColor('#1238', 16)).toBe('#21324388');
  });

  it('keeps the pound-less form when the input has no pound', () => {
    expect(ColorUtil.lightenColor('000000', 15)).toBe('0f0f0f');
  });

  it.each(['rgb(10, 20, 30)', 'red', '', '#12345', '#ggg', 'transparent'])(
    'returns %p unchanged when it can not be parsed',
    (color) => {
      expect(ColorUtil.lightenColor(color, 20)).toBe(color);
    },
  );
});
