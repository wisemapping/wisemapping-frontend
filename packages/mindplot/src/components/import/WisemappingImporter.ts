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

import XMLSerializerFactory from '../persistence/XMLSerializerFactory';
import Importer from './Importer';

export default class WisemappingImporter extends Importer {
  private wisemappingInput: string;

  constructor(map: string) {
    super();
    this.wisemappingInput = map;
  }

  import(nameMap: string, description: string): Promise<string> {
    const parser = new DOMParser();
    const wiseDoc = parser.parseFromString(this.wisemappingInput, 'application/xml');

    const serialize = XMLSerializerFactory.createFromDocument(wiseDoc);
    const mindmap = serialize.loadFromDom(wiseDoc, nameMap);

    mindmap.setDescription(description);

    const mindmapToXml = serialize.toXML(mindmap);

    const xmlStr = new XMLSerializer().serializeToString(mindmapToXml);
    return Promise.resolve(xmlStr);
  }
}
