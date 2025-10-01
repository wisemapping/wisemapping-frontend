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

import WisemappingImporter from './WisemappingImporter';
import FreemindImporter from './FreemindImporter';
import FreeplaneImporter from './FreeplaneImporter';
import XMindImporter from './XMindImporter';
import MindManagerImporter from './MindManagerImporter';
import OPMLImporter from './OPMLImporter';
import Importer from './Importer';

export default class TextImporterFactory {
  static create(type: string | undefined, map: string): Importer {
    let result: Importer;
    switch (type) {
      case 'wxml':
        result = new WisemappingImporter(map);
        return result;
      case 'mm':
        // Check if it's Freeplane or FreeMind
        if (map.includes('freeplane') || map.includes('version="freeplane')) {
          result = new FreeplaneImporter(map);
        } else {
          result = new FreemindImporter(map);
        }
        return result;
      case 'mmx':
        result = new FreeplaneImporter(map);
        return result;
      case 'xmind':
        result = new XMindImporter(map);
        return result;
      case 'mmap':
        result = new MindManagerImporter(map);
        return result;
      case 'opml':
        result = new OPMLImporter(map);
        return result;
      default:
        throw new Error(`Unsupported type ${type}`);
    }
  }
}
