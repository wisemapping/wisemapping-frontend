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

import path from 'path';
import Mindmap from '../../../src/components/model/Mindmap';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import { parseXMLFile } from '../export/Helper';

describe('Shape Type Persistence Test', () => {
  test('should distinguish between undefined and none shape types', () => {
    // Load the test map
    const mapPath = path.resolve(__dirname, '../export/input/shape-none-test.wxml');
    const mapDocument = parseXMLFile(mapPath, 'text/xml');
    
    // Parse the mindmap
    const serializer = XMLSerializerFactory.createFromDocument(mapDocument);
    const mindmap = serializer.loadFromDom(mapDocument, 'shape-none-test');
    
    // Get topics
    const centralTopic = mindmap.getCentralTopic();
    const topics = centralTopic!.getChildren();
    
    // Topic 0: undefined shape (no shape attribute in XML)
    const topicUndefined = topics[0];
    expect(topicUndefined.getShapeType()).toBeUndefined();
    
    // Topic 1: explicit "none" shape
    const topicNone = topics[1];
    expect(topicNone.getShapeType()).toBe('none');
    
    // Topic 2: "line" shape
    const topicLine = topics[2];
    expect(topicLine.getShapeType()).toBe('line');
    
    // Topic 3: "rectangle" shape
    const topicRectangle = topics[3];
    expect(topicRectangle.getShapeType()).toBe('rectangle');
    
    // Serialize back to XML
    const xmlDocument = serializer.toXML(mindmap);
    const xmlString = new XMLSerializer().serializeToString(xmlDocument);
    
    // Verify undefined topic has no shape attribute
    const topicUndefinedXml = xmlString.match(/<topic[^>]*id="2"[^>]*>/);
    expect(topicUndefinedXml).toBeDefined();
    expect(topicUndefinedXml![0]).not.toContain('shape=');
    
    // Verify "none" topic has shape="none"
    const topicNoneXml = xmlString.match(/<topic[^>]*id="3"[^>]*>/);
    expect(topicNoneXml).toBeDefined();
    expect(topicNoneXml![0]).toContain('shape="none"');
    
    // Verify "line" topic has shape="line"
    const topicLineXml = xmlString.match(/<topic[^>]*id="4"[^>]*>/);
    expect(topicLineXml).toBeDefined();
    expect(topicLineXml![0]).toContain('shape="line"');
    
    // Verify "rectangle" topic has shape="rectangle"
    const topicRectangleXml = xmlString.match(/<topic[^>]*id="5"[^>]*>/);
    expect(topicRectangleXml).toBeDefined();
    expect(topicRectangleXml![0]).toContain('shape="rectangle"');
  });
  
  test('should persist none shape type when set programmatically', () => {
    // Create a new mindmap with central topic
    const mindmap = Mindmap.buildEmpty('test-none-shape');
    const centralTopic = mindmap.getCentralTopic();
    
    // Add a topic with undefined shape
    const topicUndefined = mindmap.createNode('MainTopic', 2);
    topicUndefined.setText('Undefined Shape');
    topicUndefined.setPosition(200, 0);
    // Don't set shape - should remain undefined
    centralTopic!.append(topicUndefined);
    
    // Add a topic with explicit "none" shape
    const topicNone = mindmap.createNode('MainTopic', 3);
    topicNone.setText('None Shape');
    topicNone.setPosition(200, 100);
    topicNone.setShapeType('none');
    centralTopic!.append(topicNone);
    
    // Serialize to XML
    const serializer = XMLSerializerFactory.createFromMindmap(mindmap);
    const xmlDocument = serializer.toXML(mindmap);
    const xmlString = new XMLSerializer().serializeToString(xmlDocument);
    
    // Verify undefined topic has no shape attribute
    const topicUndefinedXml = xmlString.match(/<topic[^>]*id="2"[^>]*>/);
    expect(topicUndefinedXml).toBeDefined();
    expect(topicUndefinedXml![0]).not.toContain('shape=');
    
    // Verify "none" topic has shape="none"
    const topicNoneXml = xmlString.match(/<topic[^>]*id="3"[^>]*>/);
    expect(topicNoneXml).toBeDefined();
    expect(topicNoneXml![0]).toContain('shape="none"');
    
    // Verify the distinction is preserved
    expect(topicUndefined.getShapeType()).toBeUndefined();
    expect(topicNone.getShapeType()).toBe('none');
  });
});

