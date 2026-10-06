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

import type { CommandDispatcher } from '../../../src/components/ActionDispatcher';
import ActionDispatcher from '../../../src/components/ActionDispatcher';
import { buildTopics, stubSvgMeasurement } from './Helper';

type DispatcherMock = {
  addFeatureToTopic: jest.Mock;
  changeFeatureToTopic: jest.Mock;
  removeFeatureFromTopic: jest.Mock;
};

let dispatcher: DispatcherMock;

beforeAll(() => {
  stubSvgMeasurement();
});

beforeEach(() => {
  dispatcher = {
    addFeatureToTopic: jest.fn(),
    changeFeatureToTopic: jest.fn(),
    removeFeatureFromTopic: jest.fn(),
  };
  ActionDispatcher.setInstance(dispatcher as unknown as CommandDispatcher);
});

describe('Topic.setLinkValue', () => {
  it('does nothing when clearing the link of a topic that has none', () => {
    const { child } = buildTopics();

    expect(() => child.setLinkValue(undefined)).not.toThrow();
    expect(dispatcher.addFeatureToTopic).not.toHaveBeenCalled();
    expect(dispatcher.removeFeatureFromTopic).not.toHaveBeenCalled();
  });

  it('removes the existing link when cleared', () => {
    const { child } = buildTopics();
    const model = child.getModel();
    const link = model.createFeature('link', { url: 'https://example.com' });
    model.addFeature(link);

    child.setLinkValue(undefined);
    expect(dispatcher.removeFeatureFromTopic).toHaveBeenCalledWith(child.getId(), link.getId());
  });

  it('adds a link when the topic has none', () => {
    const { child } = buildTopics();

    child.setLinkValue('https://example.com');
    expect(dispatcher.addFeatureToTopic).toHaveBeenCalledWith([child.getId()], 'link', {
      url: 'https://example.com',
    });
  });
});

describe('Topic.getLinkValue (BL4-56)', () => {
  it('is typed and returns undefined when the topic has no link', () => {
    const { child } = buildTopics();

    // Compile-time check: the declared type must admit undefined.
    const typed: [string | undefined] extends [ReturnType<typeof child.getLinkValue>]
      ? true
      : false = true;
    expect(typed).toBe(true);
    expect(child.getLinkValue()).toBeUndefined();
  });

  it('returns the url of the link', () => {
    const { child } = buildTopics();
    const model = child.getModel();
    model.addFeature(model.createFeature('link', { url: 'https://example.com' }));

    expect(child.getLinkValue()).toBe('https://example.com');
  });
});

describe('Topic.setNoteValue', () => {
  it('does not add a blank note when clearing a topic that has none', () => {
    const { child } = buildTopics();

    child.setNoteValue(undefined);
    expect(dispatcher.addFeatureToTopic).not.toHaveBeenCalled();
    expect(dispatcher.removeFeatureFromTopic).not.toHaveBeenCalled();
  });

  it('removes the existing note when cleared', () => {
    const { child } = buildTopics();
    const model = child.getModel();
    const note = model.createFeature('note', { text: 'hello' });
    model.addFeature(note);

    child.setNoteValue(undefined);
    expect(dispatcher.removeFeatureFromTopic).toHaveBeenCalledWith(child.getId(), note.getId());
  });

  it('adds a note when the topic has none', () => {
    const { child } = buildTopics();

    child.setNoteValue('<p>hello</p>');
    expect(dispatcher.addFeatureToTopic).toHaveBeenCalledWith([child.getId()], 'note', {
      text: '<p>hello</p>',
      contentType: 'html',
    });
  });
});

// BL5-38: clearing a value the topic doesn't have needs no dispatcher, so it must not
// fail when there is none (no live designer).
describe('Clearing a missing link or note without an ActionDispatcher', () => {
  beforeEach(() => {
    ActionDispatcher.clearInstance(dispatcher as unknown as CommandDispatcher);
  });

  it('setLinkValue(undefined) does nothing', () => {
    const { child } = buildTopics();
    expect(() => child.setLinkValue(undefined)).not.toThrow();
  });

  it('setNoteValue(undefined) does nothing', () => {
    const { child } = buildTopics();
    expect(() => child.setNoteValue(undefined)).not.toThrow();
  });
});
