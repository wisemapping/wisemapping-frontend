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

import type NodeModel from '../../model/NodeModel';

/** The attributes of a FreeMind or Freeplane <font> element. */
export type FreemindFontAttributes = {
  name?: string | null;
  size?: string | null;
  bold?: string | null;
  italic?: string | null;
};

// The WiseMapping font sizes and the FreeMind size each one is exported as.
const FONT_SIZES: Array<[number, number]> = [
  [6, 10],
  [8, 12],
  [10, 18],
  [15, 24],
];

/**
 * The WiseMapping size closest to a FreeMind font size. 12, the FreeMind default size, is also
 * the size the exporter writes in a font that only sets the weight or style, so it is not
 * imported: the theme size applies.
 */
export const freemindFontSize = (size: string | null | undefined): number | undefined => {
  const freeSize = Number(size);
  if (!size || !Number.isFinite(freeSize) || freeSize <= 0 || freeSize === 12) {
    return undefined;
  }
  // The first of the closest sizes.
  const closest = FONT_SIZES.reduce((result, entry) =>
    Math.abs(entry[1] - freeSize) < Math.abs(result[1] - freeSize) ? entry : result,
  );
  return closest[0];
};

/** Sets the font of a FreeMind or Freeplane node on its topic. */
export const applyFreemindFont = (topic: NodeModel, font: FreemindFontAttributes): void => {
  if (font.name) {
    topic.setFontFamily(font.name);
  }
  const size = freemindFontSize(font.size);
  if (size) {
    topic.setFontSize(size);
  }
  if (font.bold === 'true') {
    topic.setFontWeight('bold');
  }
  if (font.italic === 'true') {
    topic.setFontStyle('italic');
  }
};
