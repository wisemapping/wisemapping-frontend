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
import XMLSerializerFactory from '../persistence/XMLSerializerFactory';

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

      // Create WiseMapping mindmap
      this.mindmap = new Mindmap(nameMap);
      this.nodeMap = new Map();
      this.positionCounter = 0;
      this.idCounter = 1;

      if (description) {
        this.mindmap.setDescription(description);
      }

      // Get central topic title
      const centralTitle = rootTopic.querySelector('title')?.textContent || 'Central Topic';

      // Create central topic
      const centralTopic = this.mindmap.createNode('CentralTopic', this.generateId());
      centralTopic.setText(centralTitle);
      centralTopic.setPosition(0, 0);
      this.mindmap.addBranch(centralTopic);

      // Convert child topics
      const childTopics = rootTopic.querySelectorAll('topics[type="attached"] > topic');
      childTopics.forEach((childTopic) => {
        const childNode = this.convertXMLTopic(childTopic);
        const position = this.calculatePosition();
        childNode.setPosition(position.x, position.y);

        // Add as branch to mindmap
        this.mindmap.addBranch(childNode);
        this.mindmap.createRelationship(centralTopic.getId(), childNode.getId());
      });

      // Serialize to WiseMapping XML format
      const serializer = XMLSerializerFactory.createFromMindmap(this.mindmap);
      const domMindmap = serializer.toXML(this.mindmap);
      const xmlToString = new XMLSerializer().serializeToString(domMindmap);

      return xmlToString;
    } catch (error) {
      console.error('XML XMind import failed:', error);
      return this.createFallbackMap(nameMap, error as Error);
    }
  }

  private importJSONFormat(nameMap: string, description?: string): string {
    try {
      // Parse the XMind content
      const xmindData = this.parseXMindContent();

      // Create WiseMapping mindmap
      this.mindmap = new Mindmap(nameMap);
      this.nodeMap = new Map();
      this.positionCounter = 0;
      this.idCounter = 1;

      if (description) {
        this.mindmap.setDescription(description);
      }

      // Convert the root topic to central topic
      const centralTopic = this.convertTopic(xmindData.rootTopic, true);
      this.mindmap.addBranch(centralTopic);

      // Serialize to WiseMapping XML format
      const serializer = XMLSerializerFactory.createFromMindmap(this.mindmap);
      const domMindmap = serializer.toXML(this.mindmap);
      const xmlToString = new XMLSerializer().serializeToString(domMindmap);

      return xmlToString;
    } catch (error) {
      console.error('JSON XMind import failed:', error);
      return this.createFallbackMap(nameMap, error as Error);
    }
  }

  private parseXMindContent(): XMindContent {
    try {
      // XMind files are ZIP archives, but the content is passed as a string
      // We need to extract the content.json from the ZIP data
      const contentMatch = this.xmindInput.match(/content\.json\[(.*?)\]/);
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

  private createFallbackMap(nameMap: string, error: Error): string {
    return `
      <map name="${nameMap}">
        <node TEXT="${nameMap}" STYLE="bubble" POSITION="0,0" ID="central-topic">
          <node TEXT="Import Error" STYLE="bubble" POSITION="right" ID="error-note">
            <richcontent TYPE="NOTE">
              <html>
                <head></head>
                <body>
                  <p>XMind import failed: ${error.message}</p>
                  <p>Please check the file format and try again.</p>
                </body>
              </html>
            </richcontent>
          </node>
        </node>
      </map>
    `;
  }
}

export default XMindImporter;
