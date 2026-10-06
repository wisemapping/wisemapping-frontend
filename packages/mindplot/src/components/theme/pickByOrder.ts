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
import type { Palette } from './ThemeStyle';

/**
 * The colour of a theme palette for a topic: a single colour as is, or the entry of a palette
 * picked by the topic order (a missing order counts as 0), wrapping around its length.
 */
const pickByOrder = (colors: string | Palette, order: number | undefined): string => {
  if (typeof colors === 'string') {
    return colors;
  }
  // Topic orders are never negative; if one were, it would get the first colour.
  return colors[(order || 0) % colors.length] ?? colors[0];
};

export default pickByOrder;
