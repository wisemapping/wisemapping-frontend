/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
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
import NoteModel from '../model/NoteModel';
import XMLSerializerFactory from '../persistence/XMLSerializerFactory';

class FreeplaneImporter extends Importer {
  private freeplaneInput: string;

  private mindmap!: Mindmap;

  constructor(map: string) {
    super();
    this.freeplaneInput = map;
  }

  import(nameMap: string, description?: string): Promise<string> {
    try {
      const parser = new DOMParser();
      const freeplaneDoc = parser.parseFromString(this.freeplaneInput, 'application/xml');

      // Check for parsing errors
      const parserError = freeplaneDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid Freeplane XML format');
      }

      this.mindmap = new Mindmap(nameMap);
      if (description) {
        this.mindmap.setDescription(description);
      }

      // Find the root node
      const rootNode = freeplaneDoc.querySelector('node');
      if (rootNode) {
        const centralTopic = this.convertNode(rootNode, this.mindmap);
        this.mindmap.addBranch(centralTopic);
      }

      // Serialize to WiseMapping format
      const serializer = XMLSerializerFactory.createFromDocument(freeplaneDoc);
      const mindmapToXml = serializer.toXML(this.mindmap);
      const xmlStr = new XMLSerializer().serializeToString(mindmapToXml);

      return Promise.resolve(xmlStr);
    } catch (error) {
      console.error('Error importing Freeplane map:', error);
      // Fallback to basic map
      return Promise.resolve(
        `<map name="${nameMap}"><node TEXT="Freeplane Map Import Error"></node></map>`,
      );
    }
  }

  private convertNode(freeplaneNode: Element, mindmap: Mindmap): NodeModel {
    const text = freeplaneNode.getAttribute('TEXT') || '';
    const node = new NodeModel('CentralTopic', mindmap);
    node.setText(text);

    // Handle rich content
    const richContent = freeplaneNode.querySelector('richcontent');
    if (richContent) {
      const htmlContent = richContent.innerHTML;
      if (htmlContent) {
        const cleanHtml = this.cleanHtml(htmlContent);
        node.setText(cleanHtml);
      }
    }

    // Handle notes
    const noteElements = freeplaneNode.querySelectorAll('richcontent[TYPE="NOTE"]');
    noteElements.forEach((noteElement) => {
      const htmlContent = noteElement.innerHTML;
      if (htmlContent) {
        const cleanHtml = this.cleanHtml(htmlContent);
        const noteModel = new NoteModel({ text: cleanHtml });
        node.addFeature(noteModel);
      }
    });

    // Handle child nodes
    const childNodes = freeplaneNode.querySelectorAll(':scope > node');
    childNodes.forEach((childNode) => {
      const childWiseNode = this.convertChildNode(childNode as Element, mindmap);
      node.append(childWiseNode);
    });

    return node;
  }

  private convertChildNode(freeplaneNode: Element, mindmap: Mindmap): NodeModel {
    const text = freeplaneNode.getAttribute('TEXT') || '';
    const node = new NodeModel('MainTopic', mindmap);
    node.setText(text);

    // Handle rich content
    const richContent = freeplaneNode.querySelector('richcontent');
    if (richContent) {
      const htmlContent = richContent.innerHTML;
      if (htmlContent) {
        const cleanHtml = this.cleanHtml(htmlContent);
        node.setText(cleanHtml);
      }
    }

    // Handle notes
    const noteElements = freeplaneNode.querySelectorAll('richcontent[TYPE="NOTE"]');
    noteElements.forEach((noteElement) => {
      const htmlContent = noteElement.innerHTML;
      if (htmlContent) {
        const cleanHtml = this.cleanHtml(htmlContent);
        const noteModel = new NoteModel({ text: cleanHtml });
        node.addFeature(noteModel);
      }
    });

    // Handle child nodes recursively
    const childNodes = freeplaneNode.querySelectorAll(':scope > node');
    childNodes.forEach((childNode) => {
      const childWiseNode = this.convertChildNode(childNode as Element, mindmap);
      node.append(childWiseNode);
    });

    return node;
  }

  private cleanHtml(content: string): string {
    // Create a temporary DOM element to clean the HTML
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = content;

    // Remove potentially problematic tags while preserving formatting
    const tagsToRemove = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'];
    tagsToRemove.forEach((tag) => {
      const elements = temporalDivElement.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    // Return the cleaned HTML content
    return temporalDivElement.innerHTML.trim() || '';
  }
}

export default FreeplaneImporter;
