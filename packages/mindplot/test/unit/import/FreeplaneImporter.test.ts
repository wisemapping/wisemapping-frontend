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
import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import NoteModel from '../../../src/components/model/NoteModel';
import LinkModel from '../../../src/components/model/LinkModel';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import ContentType from '../../../src/components/ContentType';

const loadMindmap = (xml: string): Mindmap => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'test');
};

const centralOf = (mindmap: Mindmap): NodeModel => mindmap.getCentralTopic() as NodeModel;

const noteOf = (node: NodeModel): NoteModel | undefined =>
  node.findFeatureByType('note')[0] as NoteModel | undefined;

describe('FreeplaneImporter big notes', () => {
  test('a note over 100 KB is truncated, it does not fail the import', async () => {
    const big = 'x'.repeat(150_000);
    const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="Big" ID="ID_2">
      <richcontent TYPE="NOTE"><html><body><p>${big}</p></body></html></richcontent>
    </node>
    <node TEXT="Next" ID="ID_3"/>
  </node>
</map>`;

    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const [bigNode, next] = centralOf(mindmap).getChildren();
    expect(next.getText()).toBe('Next');
    const note = noteOf(bigNode)!.getText();
    expect(note.startsWith('<p>xxx')).toBe(true);
    expect(note.length).toBeGreaterThan(90_000);
    expect(note.length).toBeLessThanOrEqual(100_010);
  });
});

describe('FreeplaneImporter notes', () => {
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="A" ID="ID_2">
      <richcontent TYPE="NOTE">
        <html><head></head><body><p>Hello <b>world</b></p><img src="x" onerror="alert(1)"/></body></html>
      </richcontent>
    </node>
  </node>
</map>`;

  test('imports the note as sanitized HTML', async () => {
    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const note = noteOf(centralOf(mindmap).getChildren()[0]);
    expect(note).toBeDefined();
    expect(note!.getContentType()).toBe(ContentType.HTML);
    expect(note!.getText()).toContain('<p>Hello <b>world</b></p>');
    expect(note!.getText()).not.toContain('onerror');
    expect(note!.getText()).not.toContain('<html');
  });
});

describe('FreeplaneImporter central topic', () => {
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1" LINK="https://example.com/root">
    <icon BUILTIN="idea"/>
    <richcontent TYPE="NOTE"><html><body><p>Root note</p></body></html></richcontent>
    <node TEXT="A" ID="ID_2"/>
  </node>
</map>`;

  test('imports the notes, icons and links of the central topic', async () => {
    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const central = centralOf(mindmap);
    expect(noteOf(central)?.getText()).toContain('Root note');
    expect(
      central.findFeatureByType('eicon').map((icon) => (icon as EmojiIconModel).getIconType()),
    ).toEqual(['💡']);
    expect((central.findFeatureByType('link')[0] as LinkModel | undefined)?.getUrl()).toBe(
      'https://example.com/root',
    );
  });
});

const iconsOf = (node: NodeModel): string[] =>
  node.findFeatureByType('eicon').map((icon) => (icon as EmojiIconModel).getIconType());

describe('FreeplaneImporter legacy WiseMapping icons', () => {
  // Maps exported by older WiseMapping versions, then saved by Freeplane, keep the legacy ids.
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="A" ID="ID_2">
      <icon BUILTIN="face_smile"/>
      <icon BUILTIN="thumb_thumb_up"/>
      <icon BUILTIN="idea"/>
      <icon BUILTIN="unknown-icon"/>
    </node>
  </node>
</map>`;

  test('maps the legacy ids to the emoji that replaced them', async () => {
    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    expect(iconsOf(centralOf(mindmap).getChildren()[0])).toEqual(['😃', '👍', '💡', '💡']);
  });
});

describe('FreeplaneImporter node ids', () => {
  test('a node without an ID does not take the place of a node with a real ID', async () => {
    // "No id" is the third topic: the old fallback key was ID_4, the ID of "Target".
    const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="Target" ID="ID_4"/>
    <node TEXT="No id"/>
    <node TEXT="Source" ID="ID_9">
      <arrowlink DESTINATION="ID_4"/>
    </node>
  </node>
</map>`;

    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const byText = (text: string): NodeModel =>
      centralOf(mindmap)
        .getChildren()
        .find((node) => node.getText() === text)!;
    const relationships = mindmap.getRelationships();
    expect(relationships).toHaveLength(1);
    expect(relationships[0].getFromNode()).toBe(byText('Source').getId());
    expect(relationships[0].getToNode()).toBe(byText('Target').getId());
  });

  test('a central node without an ID does not take the place of a node with ID_1', async () => {
    const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root">
    <node TEXT="Target" ID="ID_1"/>
    <node TEXT="Source" ID="ID_2">
      <arrowlink DESTINATION="ID_1"/>
    </node>
  </node>
</map>`;

    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const target = centralOf(mindmap)
      .getChildren()
      .find((node) => node.getText() === 'Target')!;
    expect(mindmap.getRelationships().map((r) => r.getToNode())).toEqual([target.getId()]);
  });
});

describe('FreeplaneImporter builtin and emoji icons (BL5-112)', () => {
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="A" ID="ID_2">
      <icon BUILTIN="button_ok"/>
      <icon BUILTIN="full-3"/>
      <icon BUILTIN="help"/>
      <icon BUILTIN="messagebox_warning"/>
      <icon BUILTIN="emoji-1F984"/>
      <icon BUILTIN="emoji-1F468-200D-1F4BB"/>
      <icon BUILTIN="emoji-2764"/>
      <icon BUILTIN="flag-green"/>
      <icon BUILTIN="tag_blue"/>
      <icon BUILTIN="emoji-ZZZZ"/>
    </node>
  </node>
</map>`;

  test('imports the FreeMind builtins, the Freeplane emoji and the WiseMapping icons', async () => {
    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const topic = centralOf(mindmap).getChildren()[0];
    expect(iconsOf(topic)).toEqual(['✅', '3️⃣', '❓', '⚠️', '🦄', '👨‍💻', '❤️', '💡']);
    expect(topic.findFeatureByType('icon').map((icon) => icon.getAttribute('id'))).toEqual([
      'flag_green',
      'tag_blue',
    ]);
  });
});

describe('FreeplaneImporter node style (BL5-112)', () => {
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1" STYLE="oval">
    <node TEXT="A" ID="ID_2" STYLE="rectangle" BACKGROUND_COLOR="#ff0080" COLOR="#00ff00" FOLDED="true">
      <font NAME="Verdana" SIZE="24" BOLD="true" ITALIC="true"/>
      <edge COLOR="#0000ff"/>
      <node TEXT="A1" ID="ID_3"/>
    </node>
    <node TEXT="B" ID="ID_4" STYLE="bubble">
      <font SIZE="12" ITALIC="true"/>
    </node>
    <node TEXT="C" ID="ID_5" BACKGROUND_COLOR="#ffff00"/>
    <node TEXT="D" ID="ID_6" STYLE="fork"/>
    <node ID="ID_7">
      <richcontent TYPE="NODE"><html><head></head><body><p>Rich <b>first</b></p><p>second</p></body></html></richcontent>
    </node>
  </node>
</map>`;

  test('imports shapes, colors, fonts, the collapsed state and rich node text', async () => {
    const mindmap = loadMindmap(await new FreeplaneImporter(freeplane).import('test'));

    const central = centralOf(mindmap);
    expect(central.getShapeType()).toBe('elipse');
    const [a, b, c, d, rich] = central.getChildren();

    expect(a.getShapeType()).toBe('rectangle');
    expect(a.getBackgroundColor()).toBe('#ff0080');
    expect(a.getFontColor()).toBe('#00ff00');
    expect(a.getConnectionColor()).toBe('#0000ff');
    expect(a.getFontFamily()).toBe('Verdana');
    expect(a.getFontSize()).toBe(15);
    expect(a.getFontWeight()).toBe('bold');
    expect(a.getFontStyle()).toBe('italic');
    expect(a.areChildrenShrunken()).toBe(true);

    expect(b.getShapeType()).toBe('rounded rectangle');
    // 12 is the FreeMind default size, written with any font: the theme size is kept.
    expect(b.getFontSize()).toBeUndefined();
    expect(b.getFontStyle()).toBe('italic');
    expect(b.areChildrenShrunken()).toBe(false);

    // A background is only drawn by a shape.
    expect(c.getShapeType()).toBe('rectangle');
    expect(c.getBackgroundColor()).toBe('#ffff00');
    expect(d.getShapeType()).toBe('line');

    expect(rich.getText()).toBe('Rich first\nsecond');
  });
});
