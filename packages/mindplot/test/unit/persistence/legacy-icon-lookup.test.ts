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

/* eslint-disable import/no-extraneous-dependencies */
import { describe, expect, test } from '@jest/globals';
import XMLSerializerTango from '../../../src/components/persistence/XMLSerializerTango';

const loadTango = (icons: string[]) => {
  const xml =
    '<map name="map" version="tango"><topic central="true" id="1" text="c">' +
    `${icons.map((id) => `<icon id="${id}"/>`).join('')}</topic></map>`;
  const dom = new DOMParser().parseFromString(xml, 'text/xml');
  const mindmap = new XMLSerializerTango().loadFromDom(dom, 'map');
  return mindmap.getBranches()[0].getFeatures();
};

describe('XMLSerializerTango legacy icons', () => {
  test('migrates the legacy WiseMapping icon ids to their emoji', () => {
    const features = loadTango(['face_smile', 'bulb_light_on', 'thumb_thumb_up']);

    expect(features.map((f) => f.getType())).toEqual(['eicon', 'eicon', 'eicon']);
    expect(features.map((f) => f.getAttribute('id'))).toEqual(['😃', '💡', '👍']);
  });

  test('keeps an id that only matches an Object.prototype member as an icon', () => {
    // A plain object lookup found Object.prototype.constructor and turned it into an emoji.
    const features = loadTango(['constructor', 'toString']);

    expect(features.map((f) => f.getType())).toEqual(['icon', 'icon']);
    expect(features.map((f) => f.getAttribute('id'))).toEqual(['constructor', 'toString']);
  });
});
