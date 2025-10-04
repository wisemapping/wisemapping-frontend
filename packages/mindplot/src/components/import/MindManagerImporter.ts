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
  icon?: string;
  color?: string;
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

  private mapMindManagerIconToEmojiIcon(iconId: string): string {
    // MindManager icon mapping to WiseMapping EmojiIcons
    const iconMappings: { [key: string]: string } = {
      // Priority icons
      'priority-1': '🔴',
      'priority-2': '🟡',
      'priority-3': '🟢',
      'priority-4': '🔵',
      'priority-5': '🟣',

      // Task icons
      'task-start': '🟡',
      'task-done': '✅',
      'task-pause': '⏸️',
      'task-cancel': '❌',

      // Star icons
      star: '⭐',
      'star-empty': '☆',
      'star-half': '⭐',

      // Arrow icons
      'arrow-up': '⬆️',
      'arrow-down': '⬇️',
      'arrow-left': '⬅️',
      'arrow-right': '➡️',

      // Number icons
      1: '1️⃣',
      2: '2️⃣',
      3: '3️⃣',
      4: '4️⃣',
      5: '5️⃣',
      6: '6️⃣',
      7: '7️⃣',
      8: '8️⃣',
      9: '9️⃣',
      10: '🔟',

      // Letter icons
      A: '🅰️',
      B: '🅱️',
      C: '🅲',
      D: '🅳',
      E: '🅴',
      F: '🅵',
      G: '🅶',
      H: '🅷',
      I: '🅸',
      J: '🅹',
      K: '🅺',
      L: '🅻',
      M: '🅼',
      N: '🅽',
      O: '🅾️',
      P: '🅿️',
      Q: '🆀',
      R: '🆁',
      S: '🆂',
      T: '🆃',
      U: '🆄',
      V: '🆅',
      W: '🆆',
      X: '🆇',
      Y: '🆈',
      Z: '🆉',

      // Emotion icons
      smile: '😊',
      happy: '😃',
      sad: '😢',
      angry: '😠',
      thinking: '🤔',
      surprised: '😲',

      // Technology icons
      computer: '💻',
      phone: '📱',
      email: '📧',
      internet: '🌐',

      // Default fallback
    };

    return iconMappings[iconId.toLowerCase()] || '💡';
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

      xml += `        <topic position='${position.x},${position.y}' order='${index}' text='${this.escapeXml(topic.text)}' shape='line' id='${topicId}'`;

      // Add color if present
      if (topic.color) {
        xml += ` bgColor='${topic.color}' brColor='${topic.color}'`;
      }

      xml += '>\n';

      // Add icon if present
      if (topic.icon) {
        const emojiIcon = this.mapMindManagerIconToEmojiIcon(topic.icon);
        xml += `            <eicon id='${emojiIcon}'/>\n`;
      }

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

    // Find Map element by tag name (ignoring namespace)
    const mapElement = this.findElementByTagName(doc, 'Map');
    if (!mapElement) {
      throw new Error('Invalid MindManager XML: missing Map element');
    }

    // Find root Topic element
    const rootTopic = this.findElementByTagName(mapElement, 'Topic');
    if (!rootTopic) {
      throw new Error('Invalid MindManager XML: missing root Topic');
    }

    return this.parseTopic(rootTopic);
  }

  private findElementByTagName(parent: Element | Document, tagName: string): Element | null {
    // Try direct query first
    const element = parent.querySelector(tagName);
    if (element) return element;

    // If not found, search all elements by tag name
    const allElements = parent.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      if (el.localName === tagName || el.tagName === tagName) {
        return el;
      }
    }
    return null;
  }

  private parseTopic(topicElement: Element): MindManagerTopic {
    const id = topicElement.getAttribute('ID') || this.generateId();
    const text = topicElement.getAttribute('Text') || 'Untitled';

    const topic: MindManagerTopic = {
      id,
      text,
    };

    // Parse notes
    const notesElement = this.findElementByTagName(topicElement, 'Notes');
    if (notesElement) {
      topic.notes = notesElement.textContent || '';
    }

    // Parse hyperlink
    const hyperlinkElement = this.findElementByTagName(topicElement, 'Hyperlink');
    if (hyperlinkElement) {
      topic.hyperlink = hyperlinkElement.getAttribute('URL') || '';
    }

    // Parse icon
    const iconElement = this.findElementByTagName(topicElement, 'Icon');
    if (iconElement) {
      topic.icon = iconElement.getAttribute('Name') || iconElement.textContent || '';
    }

    // Parse color
    const colorElement = this.findElementByTagName(topicElement, 'Color');
    if (colorElement) {
      topic.color = colorElement.getAttribute('Value') || colorElement.textContent || '';
    }

    // Parse child topics - find direct child Topic elements
    const childTopics: Element[] = [];
    const allChildren = topicElement.children;
    for (let i = 0; i < allChildren.length; i++) {
      const child = allChildren[i];
      if (child.localName === 'Topic' || child.tagName === 'Topic') {
        childTopics.push(child);
      }
    }

    if (childTopics.length > 0) {
      topic.children = childTopics.map((child) => this.parseTopic(child));
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
