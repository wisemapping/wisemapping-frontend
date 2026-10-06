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

import FreemindIconConverter from '../../../src/components/import/FreemindIconConverter';
import FreeplaneImporter, {
  FREEPLANE_ICON_EMOJIS,
  FREEPLANE_SVG_ICONS,
} from '../../../src/components/import/FreeplaneImporter';
import type { WiseIcon } from '../../../src/components/import/FreemindIconConverter';

// The private icon mappers under test.
type IconMapper = {
  mapFreeplaneIconToEmojiIcon(builtin: string): string;
  toWiseIcon(builtin: string): WiseIcon;
};

/**
 * The Freeplane builtin icons: the SVG files of freeplane/src/viewer/resources/images/icons in
 * Freeplane 1.12.x, without their extension. Emoji icons (emoji-<code points>) are not listed.
 */
const FREEPLANE_BUILTIN_ICONS = [
  '0%',
  '100%',
  '25%',
  '50%',
  '75%',
  'Mail',
  'addition',
  'attach',
  'audio',
  'back',
  'bee',
  'bell',
  'bookmark',
  'broken-line',
  'button_cancel',
  'button_ok',
  'calendar',
  'checked',
  'clanbomber',
  'clock',
  'clock2',
  'closed',
  'decrypted',
  'desktop_new',
  'division',
  'down',
  'edit',
  'encrypted',
  'executable',
  'family',
  'fema',
  'female1',
  'female2',
  'females',
  'flag-black',
  'flag-blue',
  'flag-green',
  'flag-orange',
  'flag-pink',
  'flag-yellow',
  'flag',
  'folder',
  'forward',
  'freemind_butterfly',
  'full-0',
  'full-1',
  'full-2',
  'full-3',
  'full-4',
  'full-5',
  'full-6',
  'full-7',
  'full-8',
  'full-9',
  'go',
  'gohome',
  'group',
  'help',
  'hourglass',
  'idea',
  'image',
  'info',
  'internet',
  'internet_warning',
  'kaddressbook',
  'kmail',
  'knotify',
  'korn',
  'ksmiletris',
  'launch',
  'licq',
  'list',
  'male1',
  'male2',
  'males',
  'messagebox_warning',
  'mindmap',
  'multiplication',
  'narrative',
  'negative',
  'neutral',
  'password',
  'pencil',
  'penguin',
  'positive',
  'prepare',
  'revision-green',
  'revision-pink',
  'revision-red',
  'revision',
  'smiley-angry',
  'smiley-neutral',
  'smiley-oh',
  'smily_bad',
  'stop-sign',
  'stop',
  'subtraction',
  'unchecked',
  'up',
  'user_icon',
  'very_negative',
  'very_positive',
  'video',
  'wizard',
  'xmag',
  'yes',
];

describe('Freeplane icon mapping', () => {
  const mapper = (): IconMapper => new FreeplaneImporter('') as unknown as IconMapper;
  const mapIcon = (builtin: string): string => mapper().mapFreeplaneIconToEmojiIcon(builtin);
  const toWiseIcon = (builtin: string): WiseIcon => mapper().toWiseIcon(builtin);

  test('lists the 106 Freeplane builtin icons', () => {
    expect(new Set(FREEPLANE_BUILTIN_ICONS).size).toBe(106);
  });

  const mappedNames = [...Object.keys(FREEPLANE_ICON_EMOJIS), ...Object.keys(FREEPLANE_SVG_ICONS)];

  test('maps only real Freeplane builtin icons', () => {
    expect(mappedNames.filter((name) => !FREEPLANE_BUILTIN_ICONS.includes(name))).toEqual([]);
  });

  test('maps only icons that FreemindIconConverter does not map first', () => {
    expect(mappedNames.filter((name) => FreemindIconConverter.toWiseIcon(name))).toEqual([]);
  });

  test.each([
    ['bee', '🐝'],
    ['very_positive', '😁'],
    ['positive', '🙂'],
    ['neutral', '😐'],
    ['negative', '🙁'],
    ['very_negative', '😖'],
    ['addition', '➕'],
    ['subtraction', '➖'],
    ['multiplication', '✖️'],
    ['division', '➗'],
    ['checked', '☑️'],
    ['unchecked', '🔲'],
    ['revision', '🔄'],
    ['revision-green', '🔄'],
    ['revision-pink', '🔄'],
    ['revision-red', '🔄'],
    ['audio', '🔊'],
    ['clock2', '⏰'],
    ['executable', '⚙️'],
    ['females', '👭'],
    ['males', '👬'],
    ['image', '🖼️'],
    ['internet', '🌐'],
    ['internet_warning', '⚠️'],
    ['mindmap', '🧠'],
    ['narrative', '💬'],
  ])('imports the Freeplane icon %p as the emoji %p', (builtin, emoji) => {
    expect(toWiseIcon(builtin)).toEqual({ type: 'eicon', id: emoji });
  });

  test.each([
    ['0%', 'task_0'],
    ['25%', 'task_25'],
    ['50%', 'task_50'],
    ['75%', 'task_75'],
    ['100%', 'task_100'],
  ])('imports the Freeplane progress icon %p as the task icon %p', (builtin, svgId) => {
    expect(toWiseIcon(builtin)).toEqual({ type: 'icon', id: svgId });
  });

  test('maps every Freeplane builtin icon but the user icons folder', () => {
    const unmapped = FREEPLANE_BUILTIN_ICONS.filter(
      (name) => !FreemindIconConverter.toWiseIcon(name) && !mappedNames.includes(name),
    );
    expect(unmapped).toEqual(['user_icon']);
    expect(toWiseIcon('user_icon')).toEqual({ type: 'eicon', id: '💡' });
  });

  test('no longer maps names that are not Freeplane icons', () => {
    // flag_red, star_yellow, task_done... were invented: Freeplane has no such icons.
    [
      'flag_red',
      'flag-purple',
      'star_yellow',
      'star',
      'task_done',
      'handshake',
      'smile',
      'money',
    ].forEach((name) => expect(mapIcon(name)).toBe('💡'));
  });

  test('maps a legacy WiseMapping icon id to the emoji that replaced it', () => {
    expect(mapIcon('face_smile')).toBe('😃');
  });

  test('returns the light bulb for an unknown icon', () => {
    expect(mapIcon('unknown-icon')).toBe('💡');
    expect(mapIcon('')).toBe('💡');
  });

  test('leaves the FreeMind builtins Freeplane keeps to FreemindIconConverter', () => {
    const freemindNames = FREEPLANE_BUILTIN_ICONS.filter((name) =>
      FreemindIconConverter.toWiseIcon(name),
    );
    expect(freemindNames).toEqual(expect.arrayContaining(['button_ok', 'full-1', 'idea', 'help']));
  });
});
