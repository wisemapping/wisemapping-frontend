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

class OPMLImporter extends Importer {
  private opmlInput: string;

  private mindmap!: Mindmap;

  constructor(map: string) {
    super();
    this.opmlInput = map;
  }

  import(nameMap: string, description?: string): Promise<string> {
    try {
      const parser = new DOMParser();
      const opmlDoc = parser.parseFromString(this.opmlInput, 'application/xml');

      // Check for parsing errors
      const parserError = opmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid OPML XML format');
      }

      this.mindmap = new Mindmap(nameMap);
      if (description) {
        this.mindmap.setDescription(description);
      }

      // Find the root outline element
      const rootOutline = opmlDoc.querySelector('outline');
      if (rootOutline) {
        const centralTopic = this.convertOutline(rootOutline, this.mindmap, true);
        this.mindmap.addBranch(centralTopic);
      }

      // Serialize to WiseMapping format
      const serializer = XMLSerializerFactory.createFromDocument(opmlDoc);
      const mindmapToXml = serializer.toXML(this.mindmap);
      const xmlStr = new XMLSerializer().serializeToString(mindmapToXml);

      return Promise.resolve(xmlStr);
    } catch (error) {
      console.error('Error importing OPML map:', error);
      // Fallback to basic map
      return Promise.resolve(
        `<map name="${nameMap}"><node TEXT="OPML Map Import Error"></node></map>`,
      );
    }
  }

  private convertOutline(outlineElement: Element, mindmap: Mindmap, isCentral: boolean): NodeModel {
    const text = outlineElement.getAttribute('text') || outlineElement.getAttribute('title') || '';
    const nodeType = isCentral ? 'CentralTopic' : 'MainTopic';
    const node = new NodeModel(nodeType, mindmap);
    node.setText(text);

    // Handle rich text content if present
    const htmlContent = outlineElement.getAttribute('_note') || outlineElement.getAttribute('note');
    if (htmlContent) {
      const cleanHtml = this.cleanHtml(htmlContent);
      const noteModel = new NoteModel({ text: cleanHtml });
      node.addFeature(noteModel);
    }

    // Handle child outlines
    const childOutlines = outlineElement.querySelectorAll(':scope > outline');
    childOutlines.forEach((childOutline) => {
      const childWiseNode = this.convertOutline(childOutline as Element, mindmap, false);
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

export default OPMLImporter;
