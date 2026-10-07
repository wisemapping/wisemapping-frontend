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
import { describe, expect, test } from '@jest/globals';
import XMindImporter, {
  XMIND_MARKER_EMOJIS,
  XMIND_MARKER_SVG_ICONS,
} from '../../../src/components/import/XMindImporter';
import NodeModel from '../../../src/components/model/NodeModel';
import Mindmap from '../../../src/components/model/Mindmap';
import { ownEntry } from '../../../src/components/import/support/IconEmoji';

// The private icon mappers under test.
type IconMapper = {
  mapXMindIconToEmojiIcon(iconId: string): string;
  addIcon(topic: NodeModel, iconId: string): void;
};

/**
 * The XMind marker ids: the markers of xmind-sdk-js (src/common/constants/marker.ts), in its
 * order, hidden ones included, which XMind 8 and XMind Zen write.
 */
const XMIND_MARKER_IDS = [
  'priority-1',
  'priority-2',
  'priority-3',
  'priority-4',
  'priority-5',
  'priority-6',
  'priority-7',
  'priority-8',
  'priority-9',
  'smiley-laugh',
  'smiley-smile',
  'smiley-cry',
  'smiley-surprise',
  'smiley-boring',
  'smiley-angry',
  'smiley-embarrass',
  'task-start',
  'task-oct',
  'task-quarter',
  'task-3oct',
  'task-half',
  'task-5oct',
  'task-3quar',
  'task-7oct',
  'task-done',
  'task-pause',
  'flag-red',
  'flag-orange',
  'flag-yellow',
  'flag-dark-blue',
  'flag-purple',
  'flag-green',
  'flag-blue',
  'flag-gray',
  'flag-dark-green',
  'flag-dark-gray',
  'star-red',
  'star-orange',
  'star-dark-blue',
  'star-purple',
  'star-green',
  'star-blue',
  'star-gray',
  'star-yellow',
  'star-dark-green',
  'star-dark-gray',
  'people-red',
  'people-orange',
  'people-yellow',
  'people-dark-blue',
  'people-purple',
  'people-green',
  'people-blue',
  'people-gray',
  'people-dark-green',
  'people-dark-gray',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-down',
  'arrow-left-right',
  'arrow-up-down',
  'arrow-refresh',
  'arrow-up-right',
  'arrow-down-right',
  'arrow-down-left',
  'arrow-up-left',
  'c_symbol_heart',
  'c_symbol_dislike',
  'c_symbol_like',
  'c_symbol_music',
  'c_symbol_lock',
  'c_symbol_hourglass',
  'c_symbol_broken_heart',
  'c_symbol_quote',
  'c_symbol_apostrophe',
  'symbol-question',
  'symbol-attention',
  'symbol-wrong',
  'symbol-pause',
  'symbol-no-entry',
  'symbol-plus',
  'symbol-minus',
  'symbol-info',
  'symbol-divide',
  'symbol-equality',
  'symbol-right',
  'symbol-code',
  'c_symbol_contact',
  'c_symbol_telephone',
  'c_symbol_pen',
  'c_symbol_money',
  'c_symbol_bar_chart',
  'c_symbol_pie_chart',
  'c_symbol_line_graph',
  'c_symbol_shopping_cart',
  'c_symbol_medals',
  'c_symbol_trophy',
  'symbol-image',
  'c_symbol_exercise',
  'c_symbol_flight',
  'symbol-pin',
  'symbol-exclam',
  'c_simbol-plus',
  'c_simbol-minus',
  'c_simbol-question',
  'c_simbol-exclam',
  'c_simbol-info',
  'c_simbol-wrong',
  'c_simbol-right',
  'c_simbol-pause',
  'c_symbol_thermometer',
  'month-jan',
  'month-feb',
  'month-mar',
  'month-apr',
  'month-may',
  'month-jun',
  'month-jul',
  'month-aug',
  'month-sep',
  'month-oct',
  'month-nov',
  'month-dec',
  'week-sun',
  'week-mon',
  'week-tue',
  'week-wed',
  'week-thu',
  'week-fri',
  'week-sat',
  'half-star-green',
  'half-star-red',
  'half-star-yellow',
  'half-star-purple',
  'half-star-blue',
  'half-star-gray',
  'other-calendar',
  'other-email',
  'other-phone',
  'other-phone2',
  'other-fax',
  'other-people',
  'other-people2',
  'other-clock',
  'other-coffee-cup',
  'other-question',
  'other-exclam',
  'other-lightbulb',
  'other-businesscard',
  'other-social',
  'other-chat',
  'other-note',
  'other-lock',
  'other-unlock',
  'other-yes',
  'other-no',
  'other-bomb',
];

describe('XMind marker mapping', () => {
  const mapper = (): IconMapper => new XMindImporter('') as unknown as IconMapper;
  const mapIcon = (iconId: string): string => mapper().mapXMindIconToEmojiIcon(iconId);

  // The icon feature a marker is imported as.
  const importedIcon = (iconId: string): { type: string; id: unknown } => {
    const topic = new NodeModel('MainTopic', new Mindmap('icons'), 1);
    mapper().addIcon(topic, iconId);
    const features = topic.getFeatures();
    expect(features).toHaveLength(1);
    const [feature] = features;
    return { type: feature?.getType() ?? '', id: feature?.getAttribute('id') };
  };

  test('lists the 158 XMind markers', () => {
    expect(new Set(XMIND_MARKER_IDS).size).toBe(158);
  });

  test('maps only real XMind markers', () => {
    const mapped = [...Object.keys(XMIND_MARKER_EMOJIS), ...Object.keys(XMIND_MARKER_SVG_ICONS)];
    expect(mapped.filter((id) => !XMIND_MARKER_IDS.includes(id))).toEqual([]);
  });

  test('maps every XMind marker but the apostrophe, which has no emoji', () => {
    expect(XMIND_MARKER_IDS.filter((id) => !ownEntry(XMIND_MARKER_EMOJIS, id))).toEqual([
      'c_symbol_apostrophe',
    ]);
    expect(importedIcon('c_symbol_apostrophe')).toEqual({ type: 'eicon', id: '💡' });
  });

  test('maps every marker to a single emoji', () => {
    expect(
      Object.values(XMIND_MARKER_EMOJIS).filter(
        (emoji) => !/^(\p{Extended_Pictographic}|[0-9]️⃣|ℹ)️?$/u.test(emoji),
      ),
    ).toEqual([]);
  });

  test.each([
    ['priority-1', '🔴'],
    ['priority-5', '🟣'],
    ['priority-6', '6️⃣'],
    ['priority-9', '9️⃣'],
    ['smiley-laugh', '😆'],
    ['smiley-smile', '🙂'],
    ['smiley-cry', '😢'],
    ['smiley-surprise', '😮'],
    ['smiley-boring', '😑'],
    ['smiley-angry', '😠'],
    ['smiley-embarrass', '😳'],
    ['task-pause', '⏸️'],
    ['flag-red', '🚩'],
    ['flag-gray', '🏳️'],
    ['flag-dark-gray', '🏴'],
    ['star-red', '⭐'],
    ['half-star-blue', '⭐'],
    ['people-green', '👤'],
    ['arrow-left-right', '↔️'],
    ['arrow-refresh', '🔄'],
    ['arrow-up-left', '↖️'],
    ['c_symbol_heart', '❤️'],
    ['c_symbol_like', '👍'],
    ['c_symbol_line_graph', '📈'],
    ['c_symbol_trophy', '🏆'],
    ['symbol-question', '❓'],
    ['c_simbol-question', '❓'],
    ['symbol-attention', '⚠️'],
    ['symbol-wrong', '❌'],
    ['symbol-right', '✅'],
    ['symbol-no-entry', '⛔'],
    ['symbol-equality', '🟰'],
    ['symbol-pin', '📌'],
    ['month-jan', '📅'],
    ['week-sun', '📅'],
    ['other-email', '📧'],
    ['other-fax', '📠'],
    ['other-people2', '👥'],
    ['other-coffee-cup', '☕'],
    ['other-lightbulb', '💡'],
    ['other-yes', '✔️'],
    ['other-no', '✖️'],
    ['other-bomb', '💣'],
  ])('imports the marker %p as the emoji %p', (iconId, emoji) => {
    expect(importedIcon(iconId)).toEqual({ type: 'eicon', id: emoji });
  });

  test.each([
    ['task-start', 'task_0'],
    ['task-oct', 'task_0'],
    ['task-quarter', 'task_25'],
    ['task-3oct', 'task_25'],
    ['task-half', 'task_50'],
    ['task-5oct', 'task_50'],
    ['task-3quar', 'task_75'],
    ['task-7oct', 'task_75'],
    ['task-done', 'task_100'],
    ['flag-orange', 'flag_orange'],
    ['flag-yellow', 'flag_yellow'],
    ['flag-green', 'flag_green'],
    ['flag-dark-green', 'flag_green'],
    ['flag-blue', 'flag_blue'],
    ['flag-dark-blue', 'flag_blue'],
    ['flag-purple', 'flag_purple'],
    ['c_symbol_pie_chart', 'chart_pie'],
  ])('imports the marker %p as the SVG icon %p', (iconId, svgId) => {
    expect(importedIcon(iconId)).toEqual({ type: 'icon', id: svgId });
  });

  test('ignores the case of the marker id', () => {
    expect(importedIcon('PRIORITY-1')).toEqual({ type: 'eicon', id: '🔴' });
    expect(importedIcon('Task-Done')).toEqual({ type: 'icon', id: 'task_100' });
  });

  test('no longer maps names that are not XMind markers', () => {
    // star, smile, task, 1, a, dog, coffee... were invented: XMind has no such markers.
    ['star', 'smile', 'happy', 'task', 'task-stop', '1', 'a', 'dog', 'coffee', 'computer'].forEach(
      (name) => expect(mapIcon(name)).toBe('💡'),
    );
  });

  test('returns the light bulb for an unknown marker', () => {
    expect(mapIcon('unknown-icon')).toBe('💡');
    expect(mapIcon('')).toBe('💡');
    expect(mapIcon('constructor')).toBe('💡');
  });
});
