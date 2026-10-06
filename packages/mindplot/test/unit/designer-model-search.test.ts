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

import { expect, describe, it } from '@jest/globals';
import DesignerModel from '../../src/components/DesignerModel';
import type Topic from '../../src/components/Topic';

/**
 * `plainText` is what the model stores; `renderedText` is what the theme puts
 * on screen when nothing was ever typed. Search must consider both.
 */
let nextTopicId = 0;

const topicStub = (plainText: string, renderedText = plainText): Topic => {
  // addTopic() asserts on a numeric id, so the stub has to carry one.
  const id = nextTopicId;
  nextTopicId += 1;
  return {
    getId: () => id,
    getModel: () => ({ getPlainText: () => plainText }),
    getText: () => renderedText,
  } as unknown as Topic;
};

const modelWith = (...topics: Topic[]): DesignerModel => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = new DesignerModel({ zoom: 1 } as any);
  topics.forEach((t) => model.addTopic(t));
  return model;
};

describe('DesignerModel.findTopicsByText', () => {
  it('matches a substring regardless of case', () => {
    const target = topicStub('Mind Mapping');
    const model = modelWith(target, topicStub('Productivity'));

    expect(model.findTopicsByText('mind')).toEqual([target]);
    expect(model.findTopicsByText('MAPPING')).toEqual([target]);
  });

  it('returns every topic that matches', () => {
    const first = topicStub('Try it Now!');
    const second = topicStub('Now or never');
    const model = modelWith(first, second, topicStub('Unrelated'));

    expect(model.findTopicsByText('now')).toEqual([first, second]);
  });

  it('matches nothing for an empty or whitespace-only query', () => {
    const model = modelWith(topicStub('Mind Mapping'), topicStub('Productivity'));

    expect(model.findTopicsByText('')).toEqual([]);
    expect(model.findTopicsByText('   ')).toEqual([]);
  });

  it('ignores surrounding whitespace in the query', () => {
    const target = topicStub('Mind Mapping');
    const model = modelWith(target);

    expect(model.findTopicsByText('  mapping  ')).toEqual([target]);
  });

  it('returns an empty list when nothing matches', () => {
    const model = modelWith(topicStub('Mind Mapping'));

    expect(model.findTopicsByText('nonexistent')).toEqual([]);
  });

  it('finds topics that only have the theme default text', () => {
    // An untouched topic stores no text but still renders "Main Topic".
    const untouched = topicStub('', 'Main Topic');
    const model = modelWith(untouched, topicStub('Mind Mapping'));

    expect(model.findTopicsByText('main topic')).toEqual([untouched]);
  });

  it('matches the stripped text of an HTML topic, not its markup', () => {
    const html = topicStub('Bold idea', '<b>Bold</b> idea');
    const model = modelWith(html);

    expect(model.findTopicsByText('bold idea')).toEqual([html]);
    expect(model.findTopicsByText('<b>')).toEqual([]);
  });
});
