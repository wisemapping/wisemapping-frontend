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
import { describe, expect, it } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import LinkModel from '../../../src/components/model/LinkModel';
import ContentType from '../../../src/components/ContentType';
import TextExporterFactory from '../../../src/components/export/TextExporterFactory';

const buildMindmap = (): { mindmap: Mindmap; central: NodeModel } => {
  const mindmap = new Mindmap('md-content');
  const central = mindmap.createNode('CentralTopic', 0);
  central.setText('Central');
  mindmap.addBranch(central);
  return { mindmap, central };
};

let nextId = 1;
const addTopic = (parent: NodeModel, text: string | undefined): NodeModel => {
  const topic = parent.getMindmap().createNode('MainTopic', nextId++);
  topic.setText(text);
  parent.append(topic);
  return topic;
};

const exportLines = async (mindmap: Mindmap): Promise<string[]> =>
  (await TextExporterFactory.create('md', mindmap).export()).split('\n');

describe('MD export of topics without text', () => {
  it('skips a topic whose text was never set', async () => {
    const { mindmap, central } = buildMindmap();
    addTopic(central, 'Before');
    addTopic(central, undefined);
    addTopic(central, 'After');

    const lines = await exportLines(mindmap);

    expect(lines).toEqual(['# Central', '', '- Before', '- After', '', '']);
  });

  it('skips a topic whose text is empty', async () => {
    const { mindmap, central } = buildMindmap();
    addTopic(central, 'Before');
    addTopic(central, '');
    addTopic(central, 'After');

    const lines = await exportLines(mindmap);

    expect(lines).toEqual(['# Central', '', '- Before', '- After', '', '']);
  });

  it('skips a topic whose text is only whitespace', async () => {
    const { mindmap, central } = buildMindmap();
    addTopic(central, ' \n ');

    const lines = await exportLines(mindmap);

    expect(lines).toEqual(['# Central', '', '', '']);
  });

  it('skips an HTML topic without visible text', async () => {
    const { mindmap, central } = buildMindmap();
    const topic = addTopic(central, '<p></p>');
    topic.setContentType(ContentType.HTML);

    const lines = await exportLines(mindmap);

    expect(lines).toEqual(['# Central', '', '', '']);
  });

  it('keeps a textless topic as an empty item when it has children with text', async () => {
    const { mindmap, central } = buildMindmap();
    const parent = addTopic(central, undefined);
    addTopic(parent, 'Child');
    const emptyParent = addTopic(central, '');
    addTopic(emptyParent, 'Other child');

    const lines = await exportLines(mindmap);

    expect(lines).toEqual(['# Central', '', '- ', '\t- Child', '- ', '\t- Other child', '', '']);
  });

  it('keeps a textless topic that has a link', async () => {
    const { mindmap, central } = buildMindmap();
    const topic = addTopic(central, undefined);
    topic.addFeature(new LinkModel({ url: 'https://example.com' }));

    const lines = await exportLines(mindmap);

    expect(lines).toContain('-  ( [link](https://example.com) )');
  });
});

describe('MD export of links', () => {
  const exportLink = async (url: string): Promise<string> => {
    const { mindmap, central } = buildMindmap();
    const topic = addTopic(central, 'Topic');
    topic.addFeature(new LinkModel({ url }));
    const lines = await exportLines(mindmap);
    return lines[2];
  };

  it('keeps a plain url as is', async () => {
    expect(await exportLink('https://www.wisemapping.com/c/maps?id=1#top')).toBe(
      '- Topic ( [link](https://www.wisemapping.com/c/maps?id=1#top) )',
    );
  });

  it('encodes parentheses so they do not close the link', async () => {
    expect(await exportLink('https://en.wikipedia.org/wiki/Mind_map_(disambiguation)')).toBe(
      '- Topic ( [link](https://en.wikipedia.org/wiki/Mind_map_%28disambiguation%29) )',
    );
  });

  it('encodes spaces so they do not end the link destination', async () => {
    expect(await exportLink('https://example.com/a file.pdf')).toBe(
      '- Topic ( [link](https://example.com/a%20file.pdf) )',
    );
  });

  it('encodes angle brackets and line breaks', async () => {
    expect(await exportLink('https://example.com/<x>\ny')).toBe(
      '- Topic ( [link](https://example.com/%3Cx%3E%0Ay) )',
    );
  });

  it('does not encode an already percent-encoded url twice', async () => {
    expect(await exportLink('https://example.com/a%20b')).toBe(
      '- Topic ( [link](https://example.com/a%20b) )',
    );
  });
});
