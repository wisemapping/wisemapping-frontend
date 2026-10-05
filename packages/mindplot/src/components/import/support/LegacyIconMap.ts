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

import iconToEmoji from '../../persistence/iconToEmoji.json';

/**
 * The SVG icons that WiseMapping no longer ships (face_surprise, bulb_light_on, thumb_thumb_up...)
 * mapped to the emoji that replaced them. It is the same map the Tango loader uses to migrate them,
 * so imported files that still hold these ids get the same emoji as the saved maps.
 */
const legacyIconToEmoji = iconToEmoji as Record<string, string>;

/** The emoji that replaced a legacy WiseMapping icon id, undefined if it is not a legacy id. */
export const legacyIconEmoji = (iconId: string): string | undefined =>
  Object.prototype.hasOwnProperty.call(legacyIconToEmoji, iconId)
    ? legacyIconToEmoji[iconId]
    : undefined;

export default legacyIconEmoji;
