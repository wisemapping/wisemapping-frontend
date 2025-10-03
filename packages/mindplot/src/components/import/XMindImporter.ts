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
import Importer from './Importer';
import Mindmap from '../model/Mindmap';
import NodeModel from '../model/NodeModel';

// XMind data structures
interface XMindTopic {
  id: string;
  title: string;
  children?: {
    attached?: XMindTopic[];
  };
  style?: {
    id: string;
    properties?: {
      'svg:fill'?: string;
      'border-line-width'?: string;
      'border-line-pattern'?: string;
    };
  };
  labels?: string[];
}

interface XMindContent {
  id: string;
  revisionId: string;
  class: string;
  rootTopic: XMindTopic;
  title: string;
}

class XMindImporter extends Importer {
  private xmindInput: string;

  private mindmap!: Mindmap;

  private nodeMap: Map<string, NodeModel> = new Map();

  private positionCounter = 0;

  private idCounter = 1;

  constructor(map: string) {
    super();
    this.xmindInput = map;
  }

  import(nameMap: string, description?: string): Promise<string> {
    try {
      console.log(`Importing XMind map: ${nameMap}, description: ${description}`);

      // Check if it's XML format (older XMind) or JSON format (newer XMind)
      if (
        this.xmindInput.trim().startsWith('<?xml') ||
        this.xmindInput.trim().startsWith('<xmap-content')
      ) {
        return Promise.resolve(this.importXMLFormat(nameMap, description));
      }
      return Promise.resolve(this.importJSONFormat(nameMap, description));
    } catch (error) {
      console.error('Error importing XMind map:', error);
      // Fallback to basic map with error info
      return Promise.resolve(this.createFallbackMap(nameMap, error as Error));
    }
  }

  private importXMLFormat(nameMap: string, description?: string): string {
    try {
      // Parse XML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.xmindInput, 'text/xml');

      // Find the root topic
      const rootTopic = doc.querySelector('topic');
      if (!rootTopic) {
        throw new Error('No root topic found in XMind file');
      }

      // Reset counters
      this.idCounter = 1;
      this.positionCounter = 0;

      // Generate WiseMapping XML directly from XML structure
      const xmlContent = this.generateWiseMappingXMLFromXML(rootTopic, nameMap, description);

      return xmlContent;
    } catch (error) {
      console.error('XML XMind import failed:', error);
      return this.createFallbackMap(nameMap, error as Error);
    }
  }

  private importJSONFormat(nameMap: string, description?: string): string {
    try {
      // Parse the XMind content
      const xmindData = this.parseXMindContent();

      // Reset counters
      this.idCounter = 1;
      this.positionCounter = 0;

      // Generate WiseMapping XML directly
      const xmlContent = this.generateWiseMappingXML(xmindData.rootTopic, nameMap, description);

      return xmlContent;
    } catch (error) {
      console.error('JSON XMind import failed:', error);
      return this.createFallbackMap(nameMap, error as Error);
    }
  }

  private parseXMindContent(): XMindContent {
    try {
      // XMind files are ZIP archives, but the content is passed as a string
      // We need to extract the content.json from the ZIP data
      // The format is: content.json[{...}] where {...} is the JSON content
      const contentMatch = this.xmindInput.match(/content\.json\[(.*?)\]PK/);
      if (!contentMatch) {
        throw new Error('Could not find content.json in XMind file');
      }

      const contentJson = contentMatch[1];
      const parsedContent = JSON.parse(contentJson);

      return parsedContent;
    } catch (error) {
      console.error('Error parsing XMind content:', error);
      throw new Error(`Failed to parse XMind content: ${(error as Error).message}`);
    }
  }

  private convertXMLTopic(xmlTopic: Element): NodeModel {
    const wiseNode = this.mindmap.createNode('MainTopic', this.generateId());

    // Get title
    const title = xmlTopic.querySelector('title')?.textContent || 'Untitled';
    wiseNode.setText(title);

    // Handle notes
    const notes = xmlTopic.querySelector('notes > plain');
    if (notes) {
      const noteText = notes.textContent || '';
      const noteFeature = wiseNode.createFeature('note', { text: noteText });
      wiseNode.addFeature(noteFeature);
    }

    // Handle markers (priority, etc.)
    const markers = xmlTopic.querySelectorAll('markers > marker');
    if (markers.length > 0) {
      const markerTexts = Array.from(markers).map(
        (marker) => marker.getAttribute('marker-id') || '',
      );
      const markerText = markerTexts.join(', ');
      const markerFeature = wiseNode.createFeature('note', { text: `Markers: ${markerText}` });
      wiseNode.addFeature(markerFeature);
    }

    // Convert child topics
    const childTopics = xmlTopic.querySelectorAll('children > topics[type="attached"] > topic');
    childTopics.forEach((childTopic) => {
      const childNode = this.convertXMLTopic(childTopic);
      const position = this.calculatePosition();
      childNode.setPosition(position.x, position.y);

      // Add child to mindmap and create relationship
      this.mindmap.addBranch(childNode);
      this.mindmap.createRelationship(wiseNode.getId(), childNode.getId());
    });

    return wiseNode;
  }

  private convertTopic(xmindTopic: XMindTopic, isCentral: boolean = false): NodeModel {
    const nodeType = isCentral ? 'CentralTopic' : 'MainTopic';

    const wiseNode = this.mindmap.createNode(nodeType, this.generateId());

    // Set position
    if (isCentral) {
      wiseNode.setPosition(0, 0);
    } else {
      const position = this.calculatePosition();
      wiseNode.setPosition(position.x, position.y);
    }

    // Set text content
    wiseNode.setText(xmindTopic.title);

    // Apply styling if available
    if (xmindTopic.style?.properties) {
      this.applyStyling(wiseNode, xmindTopic.style.properties);
    }

    // Add labels as notes if present
    if (xmindTopic.labels && xmindTopic.labels.length > 0) {
      const labelsText = xmindTopic.labels.join(', ');
      // Create a note feature for labels with more detailed information
      const noteFeature = wiseNode.createFeature('note', {
        text: `XMind Labels: ${labelsText}`,
        type: 'xmind-labels',
      });
      wiseNode.addFeature(noteFeature);
    }

    // Store in node map for reference
    this.nodeMap.set(xmindTopic.id, wiseNode);

    // Convert child topics
    if (xmindTopic.children?.attached) {
      xmindTopic.children.attached.forEach((childTopic) => {
        const childNode = this.convertTopic(childTopic, false);
        // Add child to mindmap and create relationship
        this.mindmap.addBranch(childNode);
        // Create a relationship between parent and child
        this.mindmap.createRelationship(wiseNode.getId(), childNode.getId());
      });
    }

    return wiseNode;
  }

  private applyStyling(node: NodeModel, properties: Record<string, string>): void {
    // Map XMind colors to WiseMapping styles
    if (properties['svg:fill']) {
      const color = properties['svg:fill'];
      // Convert XMind color format to WiseMapping format
      const wiseColor = this.convertXMindColor(color);
      node.setBackgroundColor(wiseColor);
    }

    // Map border properties if available
    if (properties['border-line-width']) {
      // Note: WiseMapping might not support border width directly
      // This could be stored as a feature or style property
    }

    if (properties['border-line-pattern']) {
      // Note: WiseMapping might not support border pattern directly
      // This could be stored as a feature or style property
    }
  }

  private convertXMindColor(xmindColor: string): string {
    // XMind uses RGBA format like #8EDE99FF
    // WiseMapping might expect different format
    if (xmindColor.startsWith('#')) {
      // Remove alpha channel if present (last 2 characters)
      if (xmindColor.length === 9) {
        return xmindColor.substring(0, 7); // Remove alpha
      }
      return xmindColor;
    }
    return xmindColor;
  }

  private generateId(): number {
    return this.idCounter++;
  }

  private calculatePosition(): { x: number; y: number } {
    // Simple positioning algorithm - spread nodes in a circle
    const angle = this.positionCounter * 45 * (Math.PI / 180);
    const radius = 100 + this.positionCounter * 50;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    this.positionCounter++;
    return { x, y };
  }

  private generateWiseMappingXMLFromXML(
    rootTopic: Element,
    nameMap: string,
    description?: string,
  ): string {
    const centralId = this.generateId();
    const centralTitle = rootTopic.querySelector('title')?.textContent || 'Central Topic';

    let xml = `<map name="${nameMap}" version="tango">\n`;

    // Generate central topic
    xml += `    <topic central="true" text="${this.escapeXml(centralTitle)}" id="${centralId}">\n`;

    // Generate child topics recursively
    const childTopics = rootTopic.querySelectorAll('topics[type="attached"] > topic');
    childTopics.forEach((childTopic, index) => {
      xml += this.generateChildTopicXMLFromXML(childTopic, index);
    });

    xml += `    </topic>\n`;
    xml += `</map>`;

    return xml;
  }

  private generateChildTopicXMLFromXML(xmlTopic: Element, order: number): string {
    const topicId = this.generateId();
    const position = this.calculatePosition();
    const title = xmlTopic.querySelector('title')?.textContent || 'Untitled';

    let xml = `        <topic position="${position.x},${position.y}" order="${order}" text="${this.escapeXml(title)}" shape="line" id="${topicId}">\n`;

    // Handle notes
    const notes = xmlTopic.querySelector('notes > plain');
    if (notes) {
      const noteText = notes.textContent || '';
      xml += `            <note><![CDATA[${noteText}]]></note>\n`;
    }

    // Handle markers
    const markers = xmlTopic.querySelectorAll('markers > marker');
    if (markers.length > 0) {
      const markerTexts = Array.from(markers).map(
        (marker) => marker.getAttribute('marker-id') || 'unknown',
      );
      xml += `            <note><![CDATA[Markers: ${markerTexts.join(', ')}]]></note>\n`;
    }

    // Recursively generate child topics
    const childTopics = xmlTopic.querySelectorAll('topics[type="attached"] > topic');
    childTopics.forEach((childTopic, index) => {
      xml += this.generateChildTopicXMLFromXML(childTopic, index);
    });

    xml += `        </topic>\n`;
    return xml;
  }

  private generateWiseMappingXML(
    rootTopic: XMindTopic,
    nameMap: string,
    description?: string,
  ): string {
    const centralId = this.generateId();
    let xml = `<map name="${nameMap}" version="tango">\n`;

    // Generate central topic
    xml += `    <topic central="true" text="${this.escapeXml(rootTopic.title)}" id="${centralId}">\n`;

    // Generate child topics recursively
    if (rootTopic.children?.attached) {
      xml += this.generateChildTopicsXML(rootTopic.children.attached, 0);
    }

    xml += `    </topic>\n`;
    xml += `</map>`;

    return xml;
  }

  private generateChildTopicsXML(topics: XMindTopic[], order: number): string {
    let xml = '';

    topics.forEach((topic, index) => {
      const topicId = this.generateId();
      const position = this.calculatePosition();
      const bgColor = this.extractBackgroundColor(topic);

      xml += `        <topic position="${position.x},${position.y}" order="${order}" text="${this.escapeXml(topic.title)}" shape="line" id="${topicId}"`;

      if (bgColor) {
        xml += ` bgColor="${bgColor}"`;
      }

      xml += `>\n`;

      // Add notes if present
      if (topic.labels && topic.labels.length > 0) {
        const noteText = `XMind Labels: ${topic.labels.join(', ')}`;
        xml += `            <note><![CDATA[${noteText}]]></note>\n`;
      }

      // Recursively generate child topics
      if (topic.children?.attached) {
        xml += this.generateChildTopicsXML(topic.children.attached, index);
      }

      xml += `        </topic>\n`;
    });

    return xml;
  }

  private extractBackgroundColor(topic: XMindTopic): string | null {
    if (topic.style?.properties?.['svg:fill']) {
      return this.convertXMindColor(topic.style.properties['svg:fill']);
    }
    return null;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private createFallbackMap(nameMap: string, error: Error): string {
    return `<map name="${nameMap}" version="tango">
    <topic central="true" text="${nameMap}" id="1">
        <topic position="200,0" order="0" text="Import Error" shape="line" id="2">
            <note><![CDATA[XMind import failed: ${error.message}. Please check the file format and try again.]]></note>
        </topic>
    </topic>
</map>`;
  }
}

export default XMindImporter;
