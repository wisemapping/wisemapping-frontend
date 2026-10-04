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
import XMindImporter from '../../../src/components/import/XMindImporter';
import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';
import MindManagerImporter from '../../../src/components/import/MindManagerImporter';

// Importers must only read the data that belongs to a topic, not the data of its descendants.

const parse = (xml: string): Document => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return doc;
};

const topicByText = (doc: Document, text: string): Element => {
  const result = Array.from(doc.getElementsByTagName('topic')).find(
    (t) => t.getAttribute('text') === text,
  );
  if (!result) {
    throw new Error(`Topic ${text} not found`);
  }
  return result;
};

const ownChildren = (topic: Element, tagName: string): Element[] =>
  Array.from(topic.children).filter((c) => c.tagName === tagName);

describe('XMindImporter (XML format) reads only the topic own data', () => {
  const xmind = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" version="2.0">
  <sheet id="sheet1">
    <topic id="root">
      <title>Root</title>
      <children>
        <topics type="attached">
          <topic id="parent">
            <title>Parent</title>
            <marker-refs><marker-ref marker-id="priority-1"/></marker-refs>
            <children>
              <topics type="attached">
                <topic id="child">
                  <title>Child</title>
                  <marker-refs><marker-ref marker-id="people"/></marker-refs>
                  <notes><plain>Child note</plain></notes>
                  <markers><marker marker-id="child-marker"/></markers>
                </topic>
              </topics>
            </children>
          </topic>
          <topic id="untitled">
            <children>
              <topics type="attached">
                <topic id="titled-child"><title>Titled child</title></topic>
              </topics>
            </children>
          </topic>
        </topics>
      </children>
    </topic>
  </sheet>
</xmap-content>`;

  test('markers and notes of a child are not copied to the parent', async () => {
    const doc = parse(await new XMindImporter(xmind).import('test'));

    const parent = topicByText(doc, 'Parent');
    expect(ownChildren(parent, 'eicon')).toHaveLength(1);
    expect(ownChildren(parent, 'note')).toHaveLength(0);

    const child = topicByText(doc, 'Child');
    expect(ownChildren(child, 'eicon')).toHaveLength(1);
    expect(ownChildren(child, 'note')).toHaveLength(1);
    expect(ownChildren(child, 'note')[0].textContent).toContain('Child note');
    expect(ownChildren(child, 'note')[0].textContent).toContain('child-marker');
  });

  test('a topic without title does not take the title of a child', async () => {
    const doc = parse(await new XMindImporter(xmind).import('test'));

    expect(doc.querySelectorAll('topic[text="Titled child"]')).toHaveLength(1);
    expect(doc.querySelectorAll('topic[text="Untitled"]')).toHaveLength(1);
  });

  test('a central topic without title does not take the title of a child', async () => {
    const noRootTitle = xmind.replace('<title>Root</title>', '');
    const doc = parse(await new XMindImporter(noRootTitle).import('test'));

    const central = doc.querySelector('topic[central="true"]')!;
    expect(central.getAttribute('text')).toBe('Central Topic');
  });
});

describe('FreeplaneImporter reads only the node own data', () => {
  const freeplane = `<map version="freeplane 1.9.13">
  <node TEXT="Root" ID="ID_1">
    <node TEXT="Parent" ID="ID_2">
      <icon BUILTIN="star"/>
      <node TEXT="Child" ID="ID_3">
        <icon BUILTIN="flag_red"/>
        <richcontent TYPE="NOTE"><html><head/><body><p>Child note</p></body></html></richcontent>
      </node>
    </node>
  </node>
</map>`;

  test('icons and notes of a child are not copied to the parent', async () => {
    const doc = parse(await new FreeplaneImporter(freeplane).import('test'));

    const parent = topicByText(doc, 'Parent');
    expect(ownChildren(parent, 'eicon')).toHaveLength(1);
    expect(ownChildren(parent, 'note')).toHaveLength(0);

    const child = topicByText(doc, 'Child');
    expect(ownChildren(child, 'eicon')).toHaveLength(1);
    expect(ownChildren(child, 'note')).toHaveLength(1);
  });
});

describe('MindManagerImporter reads only the topic own data', () => {
  const mindManager = `<?xml version="1.0" encoding="UTF-8"?>
<Map xmlns="http://www.mindjet.com/MindManager/MindMapXML/1.0">
  <Topic ID="1" Text="Root">
    <Topic ID="2" Text="Parent">
      <Topic ID="3" Text="Child">
        <Icon Name="people"/>
        <Notes>Child note</Notes>
        <Hyperlink URL="https://example.com"/>
        <Color Value="#ff0000"/>
      </Topic>
    </Topic>
  </Topic>
</Map>`;

  test('icon, notes, hyperlink and color of a child are not copied to the parent', async () => {
    const doc = parse(await new MindManagerImporter(mindManager).import('test'));

    const central = doc.querySelector('topic[central="true"]')!;
    expect(ownChildren(central, 'note')).toHaveLength(0);

    const parent = topicByText(doc, 'Parent');
    expect(ownChildren(parent, 'eicon')).toHaveLength(0);
    expect(ownChildren(parent, 'note')).toHaveLength(0);
    expect(ownChildren(parent, 'link')).toHaveLength(0);
    expect(parent.getAttribute('bgColor')).toBeNull();

    const child = topicByText(doc, 'Child');
    expect(ownChildren(child, 'eicon')).toHaveLength(1);
    expect(ownChildren(child, 'note')).toHaveLength(1);
    expect(ownChildren(child, 'link')).toHaveLength(1);
    expect(child.getAttribute('bgColor')).toBe('#ff0000');
  });
});

describe('XMindImporter (XML format) relationships', () => {
  test('imports relationships without title', async () => {
    const xmind = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" version="2.0">
  <sheet id="sheet1">
    <topic id="root">
      <title>Root</title>
      <children>
        <topics type="attached">
          <topic id="a"><title>A</title></topic>
          <topic id="b"><title>B</title></topic>
        </topics>
      </children>
    </topic>
    <relationships>
      <relationship id="r1" end1="a" end2="b"/>
      <relationship id="r2" end1="b" end2="a"><title>Labelled</title></relationship>
    </relationships>
  </sheet>
</xmap-content>`;

    const doc = parse(await new XMindImporter(xmind).import('test'));

    const a = topicByText(doc, 'A').getAttribute('id');
    const b = topicByText(doc, 'B').getAttribute('id');
    const relationships = Array.from(doc.getElementsByTagName('relationship'));
    expect(relationships).toHaveLength(2);
    expect(relationships[0].getAttribute('srcTopicId')).toBe(a);
    expect(relationships[0].getAttribute('destTopicId')).toBe(b);
    expect(relationships[1].getAttribute('srcTopicId')).toBe(b);
    expect(relationships[1].getAttribute('destTopicId')).toBe(a);
  });
});
