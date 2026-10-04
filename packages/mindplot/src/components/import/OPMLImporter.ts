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
import NoteModel from '../model/NoteModel';
import XMLSerializerFactory from '../persistence/XMLSerializerFactory';
import ContentType from '../ContentType';
import HtmlSanitizer from '../security/HtmlSanitizer';
import SecureXmlParser from '../security/SecureXmlParser';

class OPMLImporter extends Importer {
  private opmlInput: string;

  private mindmap!: Mindmap;

  private idCounter = 0;

  constructor(map: string) {
    super();
    this.opmlInput = map;
  }

  import(nameMap: string, description?: string): Promise<string> {
    try {
      // Use secure XML parser to prevent XXE attacks
      const opmlDoc = SecureXmlParser.parseSecureXml(this.opmlInput);
      if (!opmlDoc) {
        throw new Error('Failed to parse OPML XML - content may be unsafe');
      }

      this.mindmap = new Mindmap(nameMap);
      this.idCounter = 0;
      if (description) {
        this.mindmap.setDescription(description);
      }

      // Find the root outline element
      const rootOutline = opmlDoc.querySelector('outline');
      if (rootOutline) {
        const centralTopic = this.convertOutline(rootOutline, this.mindmap);
        this.mindmap.addBranch(centralTopic);
      }

      return Promise.resolve(OPMLImporter.toXml(this.mindmap));
    } catch (error) {
      console.error('Error importing OPML map:', error);
      // Fallback to basic map
      return Promise.resolve(OPMLImporter.createFallbackMap(nameMap, error as Error));
    }
  }

  private static toXml(mindmap: Mindmap): string {
    // The OPML document version is not a WiseMapping one, so serialize using the mindmap version.
    const serializer = XMLSerializerFactory.createFromMindmap(mindmap);
    const mindmapToXml = serializer.toXML(mindmap);
    return new XMLSerializer().serializeToString(mindmapToXml);
  }

  private static createFallbackMap(nameMap: string, error: Error): string {
    const mindmap = new Mindmap(nameMap);
    const centralTopic = mindmap.createNode('CentralTopic', 1);
    centralTopic.setText('OPML Import Error');
    centralTopic.addFeature(new NoteModel({ text: `OPML import failed: ${error.message}` }));
    mindmap.addBranch(centralTopic);
    return OPMLImporter.toXml(mindmap);
  }

  private convertOutline(
    outlineElement: Element,
    mindmap: Mindmap,
    parent?: NodeModel,
    order = 0,
  ): NodeModel {
    const text = outlineElement.getAttribute('text') || outlineElement.getAttribute('title') || '';
    const nodeType = parent ? 'MainTopic' : 'CentralTopic';
    this.idCounter += 1;
    const node = new NodeModel(nodeType, mindmap, this.idCounter);
    node.setText(text);

    // Non central topics require an order and a position to be serialized
    if (parent) {
      node.setOrder(order);
      const position = OPMLImporter.calculatePosition(parent, order);
      node.setPosition(position.x, position.y);
    }

    // Handle rich text content if present
    const htmlContent = outlineElement.getAttribute('_note') || outlineElement.getAttribute('note');
    if (htmlContent) {
      const cleanHtml = this.cleanHtml(htmlContent);
      const noteModel = new NoteModel({ text: cleanHtml });
      // Set contentType for rich text notes
      noteModel.setContentType(ContentType.HTML);
      node.addFeature(noteModel);
    }

    // Topic text is always plain, no contentType needed

    // Handle child outlines
    const childOutlines = outlineElement.querySelectorAll(':scope > outline');
    childOutlines.forEach((childOutline, index) => {
      const childWiseNode = this.convertOutline(childOutline as Element, mindmap, node, index);
      node.append(childWiseNode);
    });

    return node;
  }

  private static calculatePosition(parent: NodeModel, order: number): { x: number; y: number } {
    if (parent.getType() === 'CentralTopic') {
      // Even orders go to the right, odd orders go to the left
      const side = order % 2 === 0 ? 1 : -1;
      return { x: side * 200, y: Math.floor(order / 2) * 50 };
    }

    // Deeper topics stay on the same side as their parent
    const parentPosition = parent.getPosition();
    const side = parentPosition.x < 0 ? -1 : 1;
    return { x: parentPosition.x + side * 150, y: parentPosition.y + order * 25 };
  }

  private cleanHtml(content: string): string {
    // Use secure HTML sanitizer to prevent XSS and other injection attacks
    return HtmlSanitizer.sanitize(content);
  }
}

export default OPMLImporter;
