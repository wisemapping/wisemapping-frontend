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
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import fs from 'fs';
import path from 'path';
import { MATERIAL_ICON_CODEPOINTS } from '../../../src/components/ImageSVGFeature';

// The gallery icons are drawn with the 'Material Icons' font (MindplotWebComponent loads
// https://fonts.googleapis.com/icon?family=Material+Icons). MaterialIcons-Regular.codepoints is
// that font's official list, copied from google/material-design-icons
// (font/MaterialIcons-Regular.codepoints, last changed upstream in f7bd4f25).
const official = new Map(
  fs
    .readFileSync(path.join(__dirname, 'MaterialIcons-Regular.codepoints'), 'utf8')
    .trim()
    .split('\n')
    .map((line) => line.split(' ') as [string, string]),
);

// Gallery names that are not Material Icons names, and the icon they stand for: the one the
// editor's image picker shows for them (its @mui/icons-material component).
const ALIASES: Record<string, string> = {
  'thumbs-up': 'thumb_up',
  flash: 'flash_on',
  play: 'play_arrow',
  money: 'attach_money',
  location: 'location_on',
  car: 'directions_car',
  bike: 'directions_bike',
  walk: 'directions_walk',
  'grocery-store': 'local_grocery_store',
  hospital: 'local_hospital',
  soccer: 'sports_soccer',
  basketball: 'sports_basketball',
  tennis: 'sports_tennis',
  fitness: 'fitness_center',
  music: 'music_note',
  'auto-fix': 'auto_fix_high',
  sunny: 'wb_sunny',
  snow: 'ac_unit',
  fire: 'whatshot',
  'ice-cream': 'icecream',
  bakery: 'bakery_dining',
  'health-safety': 'health_and_safety',
  'arrow-down': 'keyboard_arrow_down',
  'arrow-up': 'keyboard_arrow_up',
  'arrow-left': 'keyboard_arrow_left',
  'arrow-right': 'keyboard_arrow_right',
  pdf: 'picture_as_pdf',
  'sticky-note': 'sticky_note_2',
  table: 'table_chart',
  'view-ar': 'view_in_ar',
  query: 'query_stats',
  'bar-chart-outlined': 'bar_chart',
  'real-estate': 'real_estate_agent',
  'school-outlined': 'school',
  theater: 'theater_comedy',
  'local-cafe-outlined': 'local_cafe',
};

// Brand icons the picker offers that the font does not have (follow-up: draw them another way).
const NOT_IN_FONT = ['twitter', 'instagram', 'linkedin', 'youtube', 'whatsapp'];

const officialName = (name: string): string => ALIASES[name] ?? name.replace(/-/g, '_');

const hex = (value: string): string => value.codePointAt(0)!.toString(16);

describe('Material Icons gallery codepoints', () => {
  const names = Object.keys(MATERIAL_ICON_CODEPOINTS);

  it('reads the official codepoints file', () => {
    expect(official.size).toBeGreaterThan(2000);
    expect(official.get('star')).toBe('e838');
    expect(names.length).toBeGreaterThan(300);
  });

  it('maps every name to the official codepoint of its icon', () => {
    const wrong = names
      .filter((name) => !NOT_IN_FONT.includes(name))
      .filter((name) => official.get(officialName(name)) !== hex(MATERIAL_ICON_CODEPOINTS[name]))
      .map(
        (name) =>
          `${name}: ${hex(MATERIAL_ICON_CODEPOINTS[name])}, ${officialName(name)} is ${official.get(officialName(name))}`,
      );
    expect(wrong).toEqual([]);
  });

  it('every alias names a real Material icon of the table', () => {
    Object.entries(ALIASES).forEach(([name, icon]) => {
      expect(names).toContain(name);
      expect(official.has(icon)).toBe(true);
    });
  });

  it('only the brand icons are missing from the font', () => {
    const missing = names.filter((name) => !official.has(officialName(name)));
    expect(missing).toEqual(NOT_IN_FONT);
  });
});
