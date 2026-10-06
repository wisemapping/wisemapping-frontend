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
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import type { ThemeStyle } from '../../../src/components/theme/ThemeStyle';

const STYLES = '../../../src/components/theme/styles';

/** The ThemeStyle class, loaded with classic-default.json changed by edit. */
const loadWithClassicDefault = (edit: (json: Record<string, Record<string, unknown>>) => void) => {
  let ThemeStyleClass: typeof ThemeStyle | undefined;
  jest.isolateModules(() => {
    jest.doMock(`${STYLES}/classic-default.json`, () => {
      const json = JSON.parse(
        JSON.stringify(jest.requireActual(`${STYLES}/classic-default.json`)),
      ) as Record<string, Record<string, unknown>>;
      edit(json);
      return json;
    });
    ({ ThemeStyle: ThemeStyleClass } = jest.requireActual<{ ThemeStyle: typeof ThemeStyle }>(
      '../../../src/components/theme/ThemeStyle',
    ));
  });
  if (!ThemeStyleClass) throw new Error('ThemeStyle not loaded');
  return ThemeStyleClass;
};

// BL5-203: the merged style was cast to TopicStyleType, so a theme JSON missing a key loaded
// with that style undefined.
describe('ThemeStyle requires every style key (BL5-203)', () => {
  afterEach(() => {
    jest.dontMock(`${STYLES}/classic-default.json`);
  });

  it('fails on a theme whose JSON files set no value for a key, naming the theme and key', () => {
    const ThemeStyleClass = loadWithClassicDefault((json) => {
      delete json.SubTopic!.outerBorderColor;
    });
    expect(() => new ThemeStyleClass('classic', 'light')).toThrow(
      "Theme 'classic' sets no outerBorderColor for SubTopic",
    );
  });

  it('accepts a key the light file sets on top of the default one', () => {
    // classic-light.json sets the CentralTopic font colour.
    const ThemeStyleClass = loadWithClassicDefault((json) => {
      delete json.CentralTopic!.fontColor;
    });
    expect(new ThemeStyleClass('classic', 'dark').getStyles('CentralTopic').fontColor).toBe(
      '#000000',
    );
  });

  it('fails on an unknown message key instead of dropping it', () => {
    const ThemeStyleClass = loadWithClassicDefault((json) => {
      json.MainTopic!.msgKey = 'NO_SUCH_MESSAGE';
    });
    expect(() => new ThemeStyleClass('classic', 'light')).toThrow(
      'Unknown message key: NO_SUCH_MESSAGE',
    );
  });
});
