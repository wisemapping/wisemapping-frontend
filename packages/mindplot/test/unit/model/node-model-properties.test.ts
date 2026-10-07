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
import { afterEach, describe, expect, jest, test } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import type NodeModel from '../../../src/components/model/NodeModel';

const createTopic = (): NodeModel => new Mindmap('map').createNode('MainTopic');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('NodeModel typed property bag (T4)', () => {
  test('getPosition reads the stored value without parsing it', () => {
    const topic = createTopic();
    topic.setPosition(10, -20);

    const parse = jest.spyOn(JSON, 'parse');
    for (let i = 0; i < 1000; i++) {
      expect(topic.getPosition()).toEqual({ x: 10, y: -20 });
    }
    expect(parse).not.toHaveBeenCalled();
  });

  test('stores the position and image size as values, not strings', () => {
    const topic = createTopic();
    topic.setPosition(1, 2);
    topic.setImageSize(30, 40);

    expect(topic.getProperty('position')).toEqual({ x: 1, y: 2 });
    expect(topic.getProperty('imageSize')).toEqual({ width: 30, height: 40 });
  });

  test('returns copies, so changing them does not change the model or its copies', () => {
    const topic = createTopic();
    topic.setPosition(1, 2);
    topic.setImageSize(30, 40);

    // The types are read-only: cast them away to check a caller changing them does no harm.
    const position = topic.getPositionOrThrow() as { x: number; y: number };
    position.x = 99;
    const size: { width: number; height: number } | undefined = topic.getImageSize();
    if (size) size.width = 99;
    expect(topic.getPosition()).toEqual({ x: 1, y: 2 });
    expect(topic.getImageSize()).toEqual({ width: 30, height: 40 });

    // deepCopy shares the stored values: setPosition replaces them instead of changing them.
    const copy = topic.deepCopy();
    copy.setPosition(5, 6);
    expect(topic.getPosition()).toEqual({ x: 1, y: 2 });
    expect(copy.getPosition()).toEqual({ x: 5, y: 6 });
  });

  test('copyTo copies every property with its value', () => {
    const source = createTopic();
    source.setPosition(7, 8);
    source.setFontSize(12);
    source.setChildrenShrunken(true);
    source.setText('text');

    const target = createTopic();
    source.copyTo(target);

    expect(target.getProperties()).toEqual(source.getProperties());
  });

  test('getProperty and putProperty are typed by key', () => {
    const topic = createTopic();
    topic.setFontSize(12);

    // ts-jest type-checks the tests: each line fails to compile with a string-keyed bag.
    const size: number | undefined = topic.getProperty('fontSize');
    expect(size).toBe(12);
    // @ts-expect-error the font size is a number
    const text: string | undefined = topic.getProperty('fontSize');
    expect(text).toBe(12);
    // @ts-expect-error the position is a value, not a string
    topic.putProperty('position', '{x:1,y:2}');
    // @ts-expect-error unknown property
    topic.putProperty('positon', { x: 1, y: 2 });
  });
});
