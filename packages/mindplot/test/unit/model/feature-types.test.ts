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
import Mindmap from '../../../src/components/model/Mindmap';
import type FeatureModel from '../../../src/components/model/FeatureModel';
import FeatureModelFactory from '../../../src/components/model/FeatureModelFactory';
import LinkModel from '../../../src/components/model/LinkModel';
import NoteModel from '../../../src/components/model/NoteModel';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import SvgIconModel from '../../../src/components/model/SvgIconModel';

// ts-jest type-checks the tests: the typed assignments below fail to compile when the lookups
// return plain FeatureModel.
describe('features typed by their type (T4)', () => {
  test('createModel returns the model class of the type', () => {
    const link: LinkModel = FeatureModelFactory.createModel('link', { url: 'http://a.com' });
    const note: NoteModel = FeatureModelFactory.createModel('note', { text: 'note' });
    const icon: SvgIconModel = FeatureModelFactory.createModel('icon', { id: 'flag_blue' });
    const emoji: EmojiIconModel = FeatureModelFactory.createModel('eicon', { id: '😀' });

    expect([link, note, icon, emoji].map((f) => f.constructor)).toEqual([
      LinkModel,
      NoteModel,
      SvgIconModel,
      EmojiIconModel,
    ]);
  });

  test('findFeatureByType returns the model class of the type', () => {
    const topic = new Mindmap('map').createNode('MainTopic');
    topic.addFeature(FeatureModelFactory.createModel('link', { url: 'http://a.com' }));
    topic.addFeature(FeatureModelFactory.createModel('note', { text: 'a note' }));

    const links: LinkModel[] = topic.findFeatureByType('link');
    const notes: NoteModel[] = topic.findFeatureByType('note');
    expect(links.map((l) => l.getUrl())).toEqual(['http://a.com']);
    expect(notes.map((n) => n.getText())).toEqual(['a note']);
    expect(topic.findFeatureByType('eicon')).toEqual([]);
  });

  test('an unknown feature type does not compile', () => {
    const topic = new Mindmap('map').createNode('MainTopic');
    topic.addFeature(FeatureModelFactory.createModel('icon', { id: 'flag_blue' }));

    // The removed Beta writer looked up 'icons' and 'links', which no feature has.
    // @ts-expect-error 'icons' is not a feature type
    expect(topic.findFeatureByType('icons')).toEqual([]);
    // @ts-expect-error 'links' is not a feature type
    expect(topic.findFeatureByType('links')).toEqual([]);
  });

  test('isOfType narrows a feature to its model class', () => {
    const feature: FeatureModel = FeatureModelFactory.createModel('link', { url: 'http://a.com' });

    expect(feature.isOfType('note')).toBe(false);
    if (!feature.isOfType('link')) {
      throw new Error('expected a link');
    }
    expect(feature.getUrl()).toBe('http://a.com');
  });
});
