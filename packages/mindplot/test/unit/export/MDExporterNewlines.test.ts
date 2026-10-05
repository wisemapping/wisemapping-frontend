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
import NoteModel from '../../../src/components/model/NoteModel';
import TextExporterFactory from '../../../src/components/export/TextExporterFactory';

const buildMindmap = (centralText: string, notes: string[]): Mindmap => {
  const mindmap = new Mindmap('md-newlines');
  const central = mindmap.createNode('CentralTopic', 0);
  central.setText(centralText);
  mindmap.addBranch(central);

  notes.forEach((note, index) => {
    const topic = mindmap.createNode('MainTopic', index + 1);
    topic.setText(`Topic ${index + 1}`);
    topic.addFeature(new NoteModel({ text: note }));
    central.append(topic);
  });
  return mindmap;
};

const exportMd = (mindmap: Mindmap): Promise<string> =>
  TextExporterFactory.create('md', mindmap).export();

describe('MD export newlines', () => {
  it('keeps every footnote definition on its own line', async () => {
    const result = await exportMd(buildMindmap('Central', ['First', 'Second', 'Third']));
    const lines = result.split('\n');

    expect(lines).toContain('[^1]: First');
    expect(lines).toContain('[^2]: Second');
    expect(lines).toContain('[^3]: Third');
  });

  it('flattens every newline of a multi-line note into its footnote', async () => {
    const result = await exportMd(buildMindmap('Central', ['line one\nline two\nline three']));
    const lines = result.split('\n');

    expect(lines).toContain('[^1]: line one line two line three');
  });

  it('flattens every newline of a multi-line central topic into the title', async () => {
    const result = await exportMd(buildMindmap('one\ntwo\nthree', []));

    expect(result.split('\n')[0]).toBe('# one two three');
  });

  it('flattens every newline of a multi-line topic into its list item', async () => {
    const mindmap = buildMindmap('Central', []);
    const central = mindmap.getCentralTopic();
    const topic = mindmap.createNode('MainTopic', 1);
    topic.setText('first line\nsecond line\r\nthird line');
    central.append(topic);

    const lines = (await exportMd(mindmap)).split('\n');

    expect(lines).toContain('- first line second line third line');
    expect(lines).not.toContain('second line');
  });
});
