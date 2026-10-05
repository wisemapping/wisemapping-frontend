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
import { decodeUtf8 } from './support/Utf8Decoder';

export default class TextImporterFactory {
  static create(type: string | undefined, map: string | ArrayBuffer | Uint8Array): Importer {
    const mapAsString = TextImporterFactory.asString(map);
    switch (type) {
      case 'wxml':
        return new WisemappingImporter(mapAsString);
      case 'mm':
        // Check if it's Freeplane or FreeMind
        if (mapAsString.includes('freeplane') || mapAsString.includes('version="freeplane')) {
          return new FreeplaneImporter(mapAsString);
        }
        return new FreemindImporter(mapAsString);
      case 'mmx':
        return new FreeplaneImporter(mapAsString);
      case 'xmind':
        return new XMindImporter(map);
      case 'mmap':
        // A .mmap file is usually a ZIP archive, so it is passed as it was read.
        return new MindManagerImporter(map);
      case 'opml':
        return new OPMLImporter(mapAsString);
      default:
        throw new Error(`Unsupported type ${type}`);
    }
  }

  private static asString(map: string | ArrayBuffer | Uint8Array): string {
    if (typeof map === 'string') {
      return map;
    }

    return decodeUtf8(map);
  }
}
