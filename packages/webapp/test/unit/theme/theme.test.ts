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

import { createAppTheme } from '../../../src/theme';

describe('createAppTheme', () => {
  test('propagates the requested palette mode', () => {
    expect(createAppTheme('light').palette.mode).toBe('light');
    expect(createAppTheme('dark').palette.mode).toBe('dark');
  });

  test('uses the WiseMapping amber as the primary accent in both modes', () => {
    expect(createAppTheme('light').palette.primary.main).toBe('#ffa800');
    expect(createAppTheme('dark').palette.primary.main).toBe('#cc8500');
  });

  test('dark mode darkens the page ground and inverts the text colour', () => {
    const light = createAppTheme('light');
    const dark = createAppTheme('dark');

    expect(light.palette.background.default).toBe('#fafafa');
    expect(light.palette.background.paper).toBe('#ffffff');
    expect(light.palette.text.primary).toBe('#333333');

    expect(dark.palette.background.default).toBe('#2a2a2a');
    expect(dark.palette.background.paper).toBe('#1e1e1e');
    expect(dark.palette.text.primary).toBe('#ffffff');
  });

  test('every palette slot that carries the mode actually differs between modes', () => {
    const light = createAppTheme('light');
    const dark = createAppTheme('dark');

    expect(dark.palette.background.default).not.toBe(light.palette.background.default);
    expect(dark.palette.background.paper).not.toBe(light.palette.background.paper);
    expect(dark.palette.text.primary).not.toBe(light.palette.text.primary);
    expect(dark.palette.text.secondary).not.toBe(light.palette.text.secondary);
    expect(dark.typography.h4.color).not.toBe(light.typography.h4.color);
  });

  test('keeps the secondary palette mode independent', () => {
    expect(createAppTheme('dark').palette.secondary.main).toBe(
      createAppTheme('light').palette.secondary.main,
    );
  });

  test('exposes the Figtree-first body font stack', () => {
    const { fontFamily } = createAppTheme('light').typography;

    expect(fontFamily).toBe('Figtree,Noto Sans JP,Helvetica,system-ui,Arial,sans-serif');
  });

  test('buttons opt out of upper-casing and use the rounded 9px radius', () => {
    const root = createAppTheme('light').components?.MuiButton?.styleOverrides?.root as Record<
      string,
      unknown
    >;

    expect(root.textTransform).toBe('none');
    expect(root.borderRadius).toBe('9px');
  });
});
