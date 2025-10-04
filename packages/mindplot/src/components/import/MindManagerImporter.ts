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
import SecureXmlParser from '../security/SecureXmlParser';

interface MindManagerTopic {
  id: string;
  text: string;
  notes?: string;
  hyperlink?: string;
  children?: MindManagerTopic[];
}

class MindManagerImporter extends Importer {
  private mindManagerInput: string;

  private idCounter: number = 1;

  constructor(map: string) {
    super();
    this.mindManagerInput = map;
  }

  private generateId(): string {
    return (this.idCounter++).toString();
  }

  private calculatePosition(order: number): { x: number; y: number } {
    // Even orders go to the right, odd orders go to the left
    const side = order % 2 === 0 ? 1 : -1;
    const sideIndex = Math.floor(order / 2);

    const x = side * (200 + sideIndex * 100);
    const y = sideIndex * 75;

    return { x, y };
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildNoteContent(notes?: string): string {
    if (!notes) return '';
    return notes.trim();
  }

  private generateWiseMappingXML(
    rootTopic: MindManagerTopic,
    nameMap: string,
    _description?: string,
  ): string {
    const centralId = this.generateId();
    let xml = `<map name='${nameMap}' version='tango' theme='prism'>\n`;

    // Generate central topic
    xml += `    <topic central='true' text='${this.escapeXml(rootTopic.text)}' id='${centralId}'>\n`;

    // Generate child topics recursively
    if (rootTopic.children && rootTopic.children.length > 0) {
      xml += this.generateChildTopicsXML(rootTopic.children, 0);
    }

    xml += '    </topic>\n';
    xml += '</map>';

    return xml;
  }

  private generateChildTopicsXML(topics: MindManagerTopic[], depth: number): string {
    let xml = '';

    topics.forEach((topic, index) => {
      const topicId = this.generateId();
      const position = this.calculatePosition(index);

      xml += `        <topic position='${position.x},${position.y}' order='${index}' text='${this.escapeXml(topic.text)}' shape='line' id='${topicId}'>\n`;

      // Add notes if present
      const noteContent = this.buildNoteContent(topic.notes);
      if (noteContent) {
        xml += `            <note><![CDATA[${noteContent}]]></note>\n`;
      }

      // Add hyperlink if present
      if (topic.hyperlink) {
        xml += `            <link url='${this.escapeXml(topic.hyperlink)}'/>\n`;
      }

      // Generate child topics recursively
      if (topic.children && topic.children.length > 0) {
        xml += this.generateChildTopicsXML(topic.children, depth + 1);
      }

      xml += '        </topic>\n';
    });

    return xml;
  }

  private parseMindManagerXML(xmlContent: string): MindManagerTopic {
    const doc = SecureXmlParser.parseSecureXml(xmlContent);
    if (!doc) {
      throw new Error('Failed to parse MindManager XML - content may be unsafe');
    }

    const mapElement = doc.querySelector('Map');
    if (!mapElement) {
      throw new Error('Invalid MindManager XML: missing Map element');
    }

    const rootTopic = mapElement.querySelector('Topic');
    if (!rootTopic) {
      throw new Error('Invalid MindManager XML: missing root Topic');
    }

    return this.parseTopic(rootTopic);
  }

  private parseTopic(topicElement: Element): MindManagerTopic {
    const id = topicElement.getAttribute('ID') || this.generateId();
    const text = topicElement.getAttribute('Text') || 'Untitled';

    const topic: MindManagerTopic = {
      id,
      text,
    };

    // Parse notes
    const notesElement = topicElement.querySelector('Notes');
    if (notesElement) {
      topic.notes = notesElement.textContent || '';
    }

    // Parse hyperlink
    const hyperlinkElement = topicElement.querySelector('Hyperlink');
    if (hyperlinkElement) {
      topic.hyperlink = hyperlinkElement.getAttribute('URL') || '';
    }

    // Parse child topics
    const childTopics = topicElement.querySelectorAll(':scope > Topic');
    if (childTopics.length > 0) {
      topic.children = Array.from(childTopics).map((child) => this.parseTopic(child));
    }

    return topic;
  }

  public import(nameMap: string, _description?: string): Promise<string> {
    try {
      console.log(`Importing MindManager map: ${nameMap}, description: ${_description}`);

      const rootTopic = this.parseMindManagerXML(this.mindManagerInput);
      const xml = this.generateWiseMappingXML(rootTopic, nameMap, _description);

      return Promise.resolve(xml);
    } catch (error) {
      console.error('MindManager import failed:', error);
      return Promise.resolve(
        '<map name="MindManager Import" version="tango" theme="prism">\n' +
          '    <topic central="true" text="Import Error" id="1">\n' +
          `      <note><![CDATA[MindManager import failed: ${(error as Error).message}]]></note>\n` +
          '    </topic>\n' +
          '</map>',
      );
    }
  }
}

export default MindManagerImporter;
