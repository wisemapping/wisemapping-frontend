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

// The FreeMind exporter writes WiseMapping SVG icon ids as builtin icons, so they are kept as they are.
const svgIconIds = new Set<string>(iconFamily.flatMap((family) => family.icons));

export default class FreemindIconConverter {
  public static toWiseIcon(iconId: string): WiseIcon | null {
    const emoji = Object.prototype.hasOwnProperty.call(freeIdToEmoji, iconId)
      ? freeIdToEmoji[iconId]
      : undefined;
    if (emoji) {
      return { type: 'eicon', id: emoji };
    }
    return svgIconIds.has(iconId) ? { type: 'icon', id: iconId } : null;
  }
}
