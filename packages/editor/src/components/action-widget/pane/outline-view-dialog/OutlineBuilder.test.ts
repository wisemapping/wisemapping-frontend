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

import { OutlineBuilder } from './OutlineBuilder';
import INodeModel from '@wisemapping/mindplot/src/components/model/INodeModel';
import ContentType from '@wisemapping/mindplot/src/components/ContentType';
import FeatureModel from '@wisemapping/mindplot/src/components/model/FeatureModel';

// Mock node creation helpers
const createMockNode = (
  id: number,
  text: string,
  options: {
    children?: INodeModel[];
    contentType?: ContentType;
    features?: FeatureModel[];
  } = {},
): INodeModel => {
  return {
    getId: () => id,
    getText: () => text,
    getPlainText: () => text,
    getContentType: () => options.contentType || ContentType.PLAIN,
    getChildren: () => options.children || [],
    getFeatures: () => options.features || [],
  } as INodeModel;
};

describe('OutlineBuilder', () => {
  let builder: OutlineBuilder;

  beforeEach(() => {
    builder = new OutlineBuilder();
  });

  describe('buildOutlineData', () => {
    it('should build basic outline data from a simple node', () => {
      const node = createMockNode(1, 'Test Node');

      const result = builder.buildOutlineData(node, 0);

      expect(result).toEqual({
        id: '1-0',
        text: 'Test Node',
        level: 0,
        children: [],
        iconUrls: [],
        linkUrl: undefined,
        noteText: undefined,
        node,
        isExpanded: true,
      });
    });

    it('should handle nodes with children', () => {
      const child1 = createMockNode(2, 'Child 1');
      const child2 = createMockNode(3, 'Child 2');
      const parent = createMockNode(1, 'Parent', {
        children: [child1, child2],
      });

      const result = builder.buildOutlineData(parent, 0);

      expect(result.children).toHaveLength(2);
      expect(result.children[0].text).toBe('Child 1');
      expect(result.children[0].level).toBe(1);
      expect(result.children[1].text).toBe('Child 2');
      expect(result.children[1].level).toBe(1);
    });

    it('should filter out children with undefined text', () => {
      const child1 = createMockNode(2, 'Child 1');
      const child2 = {
        ...createMockNode(3, ''),
        getText: () => undefined,
      } as unknown as INodeModel;
      const parent = createMockNode(1, 'Parent', {
        children: [child1, child2],
      });

      const result = builder.buildOutlineData(parent, 0);

      expect(result.children).toHaveLength(1);
      expect(result.children[0].text).toBe('Child 1');
    });

    it('should extract link URLs from features', () => {
      const linkFeature = {
        getType: () => 'link',
        getUrl: () => 'https://example.com',
      };
      const node = createMockNode(1, 'Node with link', {
        features: [linkFeature],
      });

      const result = builder.buildOutlineData(node, 0);

      expect(result.linkUrl).toBe('https://example.com');
    });

    it('should extract note text from features', () => {
      const noteFeature = {
        getType: () => 'note',
        getText: () => 'This is a note',
      };
      const node = createMockNode(1, 'Node with note', {
        features: [noteFeature],
      });

      const result = builder.buildOutlineData(node, 0);

      expect(result.noteText).toBe('This is a note');
    });

    it('should handle HTML content type', () => {
      const node = createMockNode(1, 'HTML Node', {
        contentType: ContentType.HTML,
      });
      node.getPlainText = () => 'Plain text version';

      const result = builder.buildOutlineData(node, 0);

      expect(result.text).toBe('Plain text version');
    });

    it('should auto-expand first two levels by default', () => {
      const level0 = createMockNode(1, 'Level 0');
      const level1 = createMockNode(2, 'Level 1');
      const level2 = createMockNode(3, 'Level 2');

      const result0 = builder.buildOutlineData(level0, 0);
      const result1 = builder.buildOutlineData(level1, 1);
      const result2 = builder.buildOutlineData(level2, 2);

      expect(result0.isExpanded).toBe(true);
      expect(result1.isExpanded).toBe(true);
      expect(result2.isExpanded).toBe(false);
    });

    it('should respect custom autoExpandLevels configuration', () => {
      const customBuilder = new OutlineBuilder({ autoExpandLevels: 3 });
      const level2 = createMockNode(1, 'Level 2');
      const level3 = createMockNode(2, 'Level 3');

      const result2 = customBuilder.buildOutlineData(level2, 2);
      const result3 = customBuilder.buildOutlineData(level3, 3);

      expect(result2.isExpanded).toBe(true);
      expect(result3.isExpanded).toBe(false);
    });

    it('should handle nested hierarchy', () => {
      const grandchild = createMockNode(3, 'Grandchild');
      const child = createMockNode(2, 'Child', {
        children: [grandchild],
      });
      const parent = createMockNode(1, 'Parent', {
        children: [child],
      });

      const result = builder.buildOutlineData(parent, 0);

      expect(result.children[0].children).toHaveLength(1);
      expect(result.children[0].children[0].text).toBe('Grandchild');
      expect(result.children[0].children[0].level).toBe(2);
    });

    it('should generate unique IDs based on node ID and level', () => {
      const node1 = createMockNode(5, 'Node');
      const result1 = builder.buildOutlineData(node1, 0);
      const result2 = builder.buildOutlineData(node1, 1);

      expect(result1.id).toBe('5-0');
      expect(result2.id).toBe('5-1');
    });
  });

  describe('buildFromCentralTopic', () => {
    it('should build outline from central topic children', () => {
      const child1 = createMockNode(2, 'Branch 1');
      const child2 = createMockNode(3, 'Branch 2');
      const centralTopic = createMockNode(1, 'Central', {
        children: [child1, child2],
      });

      const result = builder.buildFromCentralTopic(centralTopic);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Branch 1');
      expect(result[0].level).toBe(0);
      expect(result[1].text).toBe('Branch 2');
      expect(result[1].level).toBe(0);
    });

    it('should filter out children with undefined text from central topic', () => {
      const child1 = createMockNode(2, 'Branch 1');
      const child2 = {
        ...createMockNode(3, ''),
        getText: () => undefined,
      } as unknown as INodeModel;
      const centralTopic = createMockNode(1, 'Central', {
        children: [child1, child2],
      });

      const result = builder.buildFromCentralTopic(centralTopic);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Branch 1');
    });

    it('should return empty array if central topic has no children', () => {
      const centralTopic = createMockNode(1, 'Central', {
        children: [],
      });

      const result = builder.buildFromCentralTopic(centralTopic);

      expect(result).toEqual([]);
    });
  });
});
