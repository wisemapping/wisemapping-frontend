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
import { $assert } from '@wisemapping/core-js';
import ModelCodeName from './ModelCodeName';
import Beta2PelaMigrator from './Beta2PelaMigrator';
import Pela2TangoMigrator from './Pela2TangoMigrator';
import XMLSerializerBeta from './XMLSerializerBeta';
import XMLSerializerTango from './XMLSerializerTango';
import Mindmap from '../model/Mindmap';
import XMLMindmapSerializer from './XMLMindmapSerializer';

const codeToSerializer: { codeName: string, serializer, migrator }[] = [
  {
    codeName: ModelCodeName.BETA,
    serializer: XMLSerializerBeta,
    migrator() {
      // Ignore ..
    },
  },
  {
    codeName: ModelCodeName.PELA,
    serializer: XMLSerializerTango,
    migrator: Beta2PelaMigrator,
  },
  {
    codeName: ModelCodeName.TANGO,
    serializer: XMLSerializerTango,
    migrator: Pela2TangoMigrator,
  },
];

class XMLSerializerFactory {
  /**
   * @param {mindplot.model.IMindmap} mindmap
   * @return {mindplot.persistence.XMLSerializer_Beta|mindplot.persistence.XMLSerializer_Pela|
   * mindplot.persistence.XMLSerializer_Tango} serializer corresponding to the mindmap's version
   */
  static createInstanceFromMindmap(mindmap: Mindmap) {
    return XMLSerializerFactory
      .getSerializer(mindmap.getVersion());
  }

  /**
   * @param domDocument
   * @return serializer corresponding to the mindmap's version
   */
  static createInstanceFromDocument(domDocument: Document) {
    const rootElem = domDocument.documentElement;

    // Legacy version don't have version defined.
    let version = rootElem.getAttribute('version');
    version = version || ModelCodeName.BETA;

    return XMLSerializerFactory.getSerializer(version);
  }

  /**
   * retrieves the serializer for the mindmap's version and migrates to the current version,
   * e.g. for a Beta mindmap and current version Tango:
   * serializer = new Pela2TangoMigrator(new Beta2PelaMigrator(new XMLSerializer_Beta()))
   * @param {String} version the version name
   * @return serializer
   */
  static getSerializer(version = ModelCodeName.TANGO): XMLMindmapSerializer {
    let found = false;
    let result = null;
    for (let i = 0; i < codeToSerializer.length; i++) {
      if (!found) {
        found = codeToSerializer[i].codeName === version;
        // eslint-disable-next-line new-cap
        if (found) result = new (codeToSerializer[i].serializer)();
      } else {
        const { migrator } = codeToSerializer[i];
        // eslint-disable-next-line new-cap
        result = new migrator(result);
      }
    }
    $assert(result, `Cound not find serialized for ${version}`);
    return result;
  }
}
export default XMLSerializerFactory;
