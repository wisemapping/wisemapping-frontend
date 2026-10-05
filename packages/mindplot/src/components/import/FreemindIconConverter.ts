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

import iconFamily from '../model/SvgIconFamily.json';
import { legacyIconEmoji } from './support/LegacyIconMap';

export type WiseIcon = { type: 'icon' | 'eicon'; id: string };

// FreeMind builtin icons (freemind/images/icons) mapped to the emoji icons WiseMapping uses.
const freeIdToEmoji: Record<string, string> = {
  help: '❓',
  messagebox_warning: '⚠️',
  idea: '💡',
  button_ok: '✅',
  button_cancel: '❌',
  'full-0': '0️⃣',
  'full-1': '1️⃣',
  'full-2': '2️⃣',
  'full-3': '3️⃣',
  'full-4': '4️⃣',
  'full-5': '5️⃣',
  'full-6': '6️⃣',
  'full-7': '7️⃣',
  'full-8': '8️⃣',
  'full-9': '9️⃣',
  stop: '🔴',
  prepare: '🟡',
  go: '🟢',
  back: '⬅️',
  forward: '➡️',
  up: '⬆️',
  down: '⬇️',
  attach: '📎',
  ksmiletris: '😊',
  'smiley-neutral': '😐',
  'smiley-oh': '😮',
  'smiley-angry': '😠',
  smily_bad: '😞',
  clanbomber: '💣',
  desktop_new: '📌',
  flag: '🚩',
  'flag-black': '🏴',
  // Only used to export the emoji: the blue flag is imported as a flag (freeIdToSvgId).
  'flag-blue': '🔵',
  'flag-green': '🟢',
  'flag-orange': '🟠',
  'flag-pink': '🩷',
  'flag-yellow': '🟡',
  gohome: '🏠',
  home: '🏠',
  kaddressbook: '☎️',
  knotify: '🎵',
  music: '🎵',
  korn: '📫',
  Mail: '✉️',
  kmail: '📧',
  password: '🔑',
  pencil: '✏️',
  edit: '📝',
  wizard: '🪄',
  xmag: '🔍',
  bell: '🔔',
  bookmark: '⭐',
  penguin: '🐧',
  licq: '🌼',
  freemind_butterfly: '🦋',
  'broken-line': '💔',
  calendar: '📅',
  clock: '🕐',
  hourglass: '⌛',
  launch: '🚀',
  family: '👪',
  female1: '👩',
  female2: '👩',
  male1: '👨',
  male2: '👨',
  fema: '👫',
  group: '👥',
  list: '📋',
  folder: '📁',
  video: '🎬',
  encrypted: '🔒',
  decrypted: '🔓',
  'stop-sign': '🛑',
  closed: '⛔',
  info: 'ℹ️',
  yes: '❗',
  redo: '🔄',
};

// FreeMind builtin icons imported as a WiseMapping SVG icon, because no emoji matches them.
// There is no blue flag emoji, and 🔵 would turn the flag into a circle.
const freeIdToSvgId: Record<string, string> = {
  'flag-blue': 'flag_blue',
};

// The same emoji can be written with or without the emoji variation selector (U+FE0F).
const withoutVariationSelector = (emoji: string): string => emoji.replace(/\uFE0F/g, '');

// Several FreeMind icons share an emoji, the first one listed is the one exported.
const emojiToFreeId = new Map<string, string>();
Object.entries(freeIdToEmoji).forEach(([freeId, emoji]) => {
  const key = withoutVariationSelector(emoji);
  if (!emojiToFreeId.has(key)) {
    emojiToFreeId.set(key, freeId);
  }
});

// The FreeMind exporter writes WiseMapping SVG icon ids as builtin icons, so they are kept as they are.
const svgIconIds = new Set<string>(iconFamily.flatMap((family) => family.icons));

// WiseMapping SVG icons that have an equivalent FreeMind builtin icon, which FreeMind can display.
const svgIdToFreeId: Record<string, string> = {
  sign_warning: 'messagebox_warning',
  sign_info: 'info',
  sign_help: 'help',
  sign_cancel: 'button_cancel',
  time_calendar: 'calendar',
  time_clock: 'clock',
  things_address_book: 'kaddressbook',
  soft_penguin: 'penguin',
  soft_folder_explore: 'folder',
  flag_blue: 'flag-blue',
  flag_green: 'flag-green',
  flag_orange: 'flag-orange',
  flag_pink: 'flag-pink',
  flag_yellow: 'flag-yellow',
  object_music: 'knotify',
};

export default class FreemindIconConverter {
  public static toWiseIcon(iconId: string): WiseIcon | null {
    if (Object.prototype.hasOwnProperty.call(freeIdToSvgId, iconId)) {
      return { type: 'icon', id: freeIdToSvgId[iconId] };
    }
    const emoji = Object.prototype.hasOwnProperty.call(freeIdToEmoji, iconId)
      ? freeIdToEmoji[iconId]
      : undefined;
    if (emoji) {
      return { type: 'eicon', id: emoji };
    }
    if (svgIconIds.has(iconId)) {
      return { type: 'icon', id: iconId };
    }
    // Maps exported by older WiseMapping versions hold the ids of the icons that became emoji.
    const legacyEmoji = legacyIconEmoji(iconId);
    return legacyEmoji ? { type: 'eicon', id: legacyEmoji } : null;
  }

  /**
   * The FreeMind builtin icon of a WiseMapping SVG icon. Icons without an equivalent keep their id:
   * FreeMind can not display them, but they are imported back as the same WiseMapping icon.
   */
  public static svgToFreemindIcon(iconId: string): string {
    return Object.prototype.hasOwnProperty.call(svgIdToFreeId, iconId)
      ? svgIdToFreeId[iconId]
      : iconId;
  }

  /** The FreeMind builtin icon of an emoji icon, null if FreeMind has no equivalent. */
  public static toFreemindIcon(emoji: string): string | null {
    return emojiToFreeId.get(withoutVariationSelector(emoji)) ?? null;
  }
}
