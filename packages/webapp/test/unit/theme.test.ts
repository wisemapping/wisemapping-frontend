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

import { createAppTheme } from '../../src/theme';
import { organicTokens } from '../../src/theme/tokens';

describe('createAppTheme (Organic design tokens)', () => {
  test('light theme background uses the Organic cream ground token', () => {
    const theme = createAppTheme('light');
    expect(theme.palette.background.default).toBe(organicTokens.color.ground);
  });

  test('dark theme background uses the Organic dark ground token, not the old grey default', () => {
    const theme = createAppTheme('dark');
    expect(theme.palette.background.default).toBe(organicTokens.color.groundDark);
    expect(theme.palette.background.default).not.toBe('#2a2a2a');
  });

  test('primary color uses the Organic terracotta accent in light mode', () => {
    const theme = createAppTheme('light');
    expect(theme.palette.primary.main).toBe(organicTokens.color.terracotta);
  });

  test('primary color uses the Organic muted terracotta accent in dark mode', () => {
    const theme = createAppTheme('dark');
    expect(theme.palette.primary.main).toBe(organicTokens.color.terracottaDark);
  });

  test('display heading (h4) uses the Caprasimo display font stack', () => {
    const theme = createAppTheme('light');
    expect(theme.typography.h4.fontFamily).toBe(organicTokens.font.display);
  });
});
