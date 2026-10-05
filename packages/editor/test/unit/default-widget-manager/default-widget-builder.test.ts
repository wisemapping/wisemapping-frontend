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

/**
 * @jest-environment jsdom
 */
import type { ReactElement } from 'react';
import type { Topic } from '@wisemapping/mindplot';
import type NodeProperty from '../../../src/classes/model/node-property';
import DefaultWidgetBuilder from '../../../src/classes/default-widget-manager';

jest.mock('@wisemapping/mindplot', () => ({
  WidgetBuilder: class {},
}));

const linkModelOf = (topic: Topic): NodeProperty<string> => {
  const editor = new DefaultWidgetBuilder().buildEditorForLink(topic) as ReactElement<{
    urlModel: NodeProperty<string>;
  }>;
  return editor.props.urlModel;
};

describe('DefaultWidgetBuilder link editor', () => {
  it('reads an empty link when the topic has none', () => {
    const topic = { getLinkValue: () => undefined } as unknown as Topic;

    expect(linkModelOf(topic).getValue()).toBe('');
  });

  it('reads the topic link', () => {
    const topic = { getLinkValue: () => 'https://www.wisemapping.com' } as unknown as Topic;

    expect(linkModelOf(topic).getValue()).toBe('https://www.wisemapping.com');
  });
});
