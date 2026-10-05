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
import fs from 'fs';
import path from 'path';
import { describe, expect, test } from '@jest/globals';
import { strFromU8, unzipSync } from 'fflate';
import { exporterAssert } from './Helper';
import TextImporterFactory from '../../../src/components/import/TextImporterFactory';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import NoteModel from '../../../src/components/model/NoteModel';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import { StrokeStyle } from '../../../src/components/model/RelationshipModel';
import ContentType from '../../../src/components/ContentType';

// .mmap files saved by MindManager itself: see input/mindmanager/real/README.md.
const REAL_FILES = ['blumind-mm8', 'mmap2json-2017'];

const readArchive = (name: string): ArrayBuffer => {
  const buffer = fs.readFileSync(path.resolve(__dirname, `./input/mindmanager/real/${name}.mmap`));
  // The webapp reads .mmap files with FileReader.readAsArrayBuffer.
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
};

const importReal = async (name: string): Promise<Mindmap> => {
  const xml = await TextImporterFactory.create('mmap', readArchive(name)).import(name, '');
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, name);
};

const emojis = (node: NodeModel): string[] =>
  node.findFeatureByType('eicon').map((icon) => (icon as EmojiIconModel).getIconType());

const side = (node: NodeModel): number => Math.sign(node.getPosition()?.x ?? 0);

const centralOf = (mindmap: Mindmap): NodeModel => mindmap.getCentralTopic() as NodeModel;

describe('MindManager real files', () => {
  test.each(REAL_FILES)('imports %p as expected', async (name) => {
    await exporterAssert(
      `mindmanager-real-${name}`,
      TextImporterFactory.create('mmap', readArchive(name)),
    );
    // exporterAssert passes when there is no expected file.
    expect(fs.existsSync(path.resolve(__dirname, `./expected/mindmanager-real-${name}.wxml`))).toBe(
      true,
    );
  });
});

describe('MindManager 8 file (blumind-mm8)', () => {
  test('a topic without ap:Text takes the default text of its level from the StyleGroup', async () => {
    const mindmap = await importReal('blumind-mm8');

    const central = centralOf(mindmap);
    expect(central.getText()).toBe('Central Topic');
    expect(central.getChildren().map((child) => child.getText())).toEqual([
      'Main Topic',
      'Main Topic',
      'Main Topic',
    ]);
  });

  test('main topics are on the side of their Offset: the smiley topic is on the left', async () => {
    const mindmap = await importReal('blumind-mm8');
    const [noted, plain, smiley] = centralOf(mindmap).getChildren();

    expect([side(noted), side(plain), side(smiley)]).toEqual([1, 1, -1]);
    // Right side orders are even and continuous, left side ones odd.
    expect([noted.getOrder(), plain.getOrder(), smiley.getOrder()]).toEqual([0, 2, 1]);
  });

  test('imports the note, the icons and the relationship', async () => {
    const mindmap = await importReal('blumind-mm8');
    const central = centralOf(mindmap);
    const [noted, plain, smiley] = central.getChildren();

    const note = noted.findFeatureByType('note')[0] as NoteModel;
    expect(note.getContentType()).toBe(ContentType.HTML);
    expect(note.getText()).toBe('<p>Hello, World</p>');

    expect(emojis(central)).toEqual(['🟢']);
    expect(emojis(smiley)).toEqual(['😃']);
    expect(emojis(noted)).toEqual([]);
    // The marker sets (MarkersSetGroup) only declare the available icons and priorities.
    expect(emojis(plain)).toEqual([]);

    const relationships = mindmap.getRelationships();
    expect(relationships).toHaveLength(1);
    expect(relationships[0].getFromNode()).toBe(central.getId());
    expect(relationships[0].getToNode()).toBe(noted.getId());
    // RelationshipDefaultsGroup/DefaultLineStyle LineDashStyle="urn:mindjet:Dash"
    expect(relationships[0].getStrokeStyle()).toBe(StrokeStyle.DASHED);
  });
});

describe('MindManager 2017 file (mmap2json-2017)', () => {
  test('imports the hierarchy in document order', async () => {
    const mindmap = await importReal('mmap2json-2017');
    const central = centralOf(mindmap);
    const texts = (node: NodeModel) => node.getChildren().map((child) => child.getText());

    expect(central.getText()).toBe('A');
    expect(texts(central)).toEqual(['B', 'C']);
    const [b, c] = central.getChildren();
    expect(texts(b)).toEqual(['D', 'E', 'F']);
    expect(texts(c)).toEqual([]);
    expect(b.getChildren().map((child) => child.getOrder())).toEqual([0, 1, 2]);
    expect(texts(b.getChildren()[1])).toEqual(['G']);
  });

  test('B and C, both with Offset CX="30." CY="0.", are on the right, in order and apart', async () => {
    const mindmap = await importReal('mmap2json-2017');
    const [b, c] = centralOf(mindmap).getChildren();

    expect([side(b), side(c)]).toEqual([1, 1]);
    expect([b.getOrder(), c.getOrder()]).toEqual([0, 2]);
    expect(b.getPosition()).not.toEqual(c.getPosition());
    // The Offset is a layout hint, not a position: B is above C, as in SubTopics.
    expect(b.getPosition()!.y).toBeLessThan(c.getPosition()!.y);
  });

  test('the sub-topics of a branch are on the side of the branch', async () => {
    const mindmap = await importReal('mmap2json-2017');
    const b = centralOf(mindmap).getChildren()[0];
    const [d, e, f] = b.getChildren();

    expect([side(d), side(e), side(f), side(e.getChildren()[0])]).toEqual([1, 1, 1, 1]);
  });

  test('has no relationships, notes or icons', async () => {
    const mindmap = await importReal('mmap2json-2017');
    const nodes = (node: NodeModel): NodeModel[] => [node, ...node.getChildren().flatMap(nodes)];

    expect(mindmap.getRelationships()).toHaveLength(0);
    const all = nodes(centralOf(mindmap));
    expect(all).toHaveLength(7);
    all.forEach((node) => expect(node.getFeatures()).toEqual([]));
  });
});

describe('MindManager stock icons of the real files', () => {
  // Every stock icon and task priority the marker sets of the real files offer.
  const stockIcons = (name: string): string[] => {
    const files = unzipSync(new Uint8Array(readArchive(name)), {
      filter: (file) => file.name === 'Document.xml',
    });
    const xml = strFromU8(files['Document.xml']);
    return Array.from(xml.matchAll(/(?:IconType|TaskPriority)="urn:mindjet:([A-Za-z0-9]+)"/g)).map(
      (match) => match[1],
    );
  };
  const used = Array.from(new Set(REAL_FILES.flatMap(stockIcons))).sort();

  test('the real files declare the expected stock icons', () => {
    expect(used.length).toBeGreaterThan(20);
  });

  test.each(used)('maps urn:mindjet:%s to its own emoji, not the fallback', async (icon) => {
    const attribute = icon.startsWith('Prio')
      ? `<ap:Task TaskPriority="urn:mindjet:${icon}"/>`
      : `<ap:IconsGroup><ap:Icons><ap:Icon IconType="urn:mindjet:${icon}"/></ap:Icons></ap:IconsGroup>`;
    const xml = `<ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003">
      <ap:OneTopic><ap:Topic OId="t1"><ap:Text PlainText="Central"/>${attribute}</ap:Topic></ap:OneTopic>
    </ap:Map>`;
    const result = await TextImporterFactory.create('mmap', xml).import('icons', '');
    const doc = new DOMParser().parseFromString(result, 'text/xml');
    const central = centralOf(
      XMLSerializerFactory.createFromDocument(doc).loadFromDom(doc, 'icons'),
    );

    expect(emojis(central)).toHaveLength(1);
    expect(emojis(central)[0]).not.toBe('💡');
  });
});
