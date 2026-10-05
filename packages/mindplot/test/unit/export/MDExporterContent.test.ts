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
import NoteModel from '../../../src/components/model/NoteModel';
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

describe('MD export of a central topic without text (BL5-01)', () => {
  it.each([undefined, '', '  '])(
    'exports the branches under a placeholder title (%p)',
    async (text) => {
      const { mindmap, central } = buildMindmap();
      central.setText(text);
      addTopic(central, 'Child');

      const lines = await exportLines(mindmap);

      expect(lines).toEqual(['# Untitled', '', '- Child', '', '']);
    },
  );

  it('uses the placeholder for an HTML central topic without visible text', async () => {
    const { mindmap, central } = buildMindmap();
    central.setText('<p></p>');
    central.setContentType(ContentType.HTML);
    addTopic(central, 'Child');

    const lines = await exportLines(mindmap);

    expect(lines.slice(0, 3)).toEqual(['# Untitled', '', '- Child']);
  });
});

describe('MD export escaping (BL5-02)', () => {
  const exportTopic = async (text: string): Promise<string> => {
    const { mindmap, central } = buildMindmap();
    addTopic(central, text);
    const lines = await exportLines(mindmap);
    return lines[2];
  };

  it.each([
    ['# not a heading', '- \\# not a heading'],
    ['> not a quote', '- \\> not a quote'],
    ['1. not a list', '- 1\\. not a list'],
    ['2024) not a list', '- 2024\\) not a list'],
    ['- not a list', '- \\- not a list'],
    ['+ not a list', '- \\+ not a list'],
    ['*bold* and _em_', '- \\*bold\\* and \\_em\\_'],
    ['[text](http://x)', '- \\[text\\](http://x)'],
    ['see [^1]', '- see \\[^1\\]'],
    ['`code`', '- \\`code\\`'],
    ['<b>tag</b>', '- \\<b\\>tag\\</b\\>'],
    ['~~gone~~', '- \\~\\~gone\\~\\~'],
    ['a \\ b', '- a \\\\ b'],
    ['a | b', '- a \\| b'],
    ['&amp; &#169;', '- \\&amp; \\&#169;'],
  ])('escapes %p so it renders literally', async (text, expected) => {
    expect(await exportTopic(text)).toBe(expected);
  });

  it('keeps plain text, inner hashes and ampersands readable', async () => {
    expect(await exportTopic('C# & R&D 2.0 (draft)')).toBe('- C# & R&D 2.0 (draft)');
  });

  it('escapes a trailing hash sequence of the title', async () => {
    const { mindmap, central } = buildMindmap();
    central.setText('Plan #');

    expect((await exportLines(mindmap))[0]).toBe('# Plan \\#');
  });

  it('escapes the note of a footnote', async () => {
    const { mindmap, central } = buildMindmap();
    addTopic(central, 'Topic').addFeature(new NoteModel({ text: '*see* [^2]' }));

    expect(await exportLines(mindmap)).toContain('[^1]: \\*see\\* \\[^2\\]');
  });
});

describe('MD export of empty notes (BL5-03)', () => {
  it.each([
    ['plain', ' ', undefined],
    ['html', '<p> </p>', ContentType.HTML],
  ])('adds no footnote for an empty %s note', async (_kind, text, contentType) => {
    const { mindmap, central } = buildMindmap();
    const note = new NoteModel({ text });
    if (contentType) note.setContentType(contentType);
    addTopic(central, 'Topic').addFeature(note);

    const lines = await exportLines(mindmap);

    expect(lines).toEqual(['# Central', '', '- Topic', '', '']);
  });

  it('numbers footnotes without gaps when an empty note is skipped', async () => {
    const { mindmap, central } = buildMindmap();
    addTopic(central, 'A').addFeature(new NoteModel({ text: ' ' }));
    addTopic(central, 'B').addFeature(new NoteModel({ text: 'Note' }));

    const lines = await exportLines(mindmap);

    expect(lines).toContain('- B[^1] ');
    expect(lines).toContain('[^1]: Note');
    expect(lines.filter((line) => line.startsWith('[^'))).toHaveLength(1);
  });

  it('skips a textless topic whose only feature is an empty note', async () => {
    const { mindmap, central } = buildMindmap();
    addTopic(central, undefined).addFeature(new NoteModel({ text: ' ' }));

    expect(await exportLines(mindmap)).toEqual(['# Central', '', '', '']);
  });
});
