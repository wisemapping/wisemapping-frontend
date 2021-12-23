/*
 *    Copyright [2015] [wisemapping]
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
import ModelCodeName from './ModelCodeName';
import Beta2PelaMigrator from './Beta2PelaMigrator';
import Pela2TangoMigrator from './Pela2TangoMigrator';
import XMLSerializerBeta from './XMLSerializer_Beta';
import XMLSerializerPela from './XMLSerializer_Pela';
import XMLSerializerTango from './XMLSerializer_Tango';

/**
 * @class mindplot.persistence.XMLSerializerFactory
 */
const XMLSerializerFactory = {};

/**
 * @param {mindplot.model.IMindmap} mindmap
 * @return {mindplot.persistence.XMLSerializer_Beta|mindplot.persistence.XMLSerializer_Pela|
 * mindplot.persistence.XMLSerializer_Tango} serializer corresponding to the mindmap's version
 */
XMLSerializerFactory.getSerializerFromMindmap = (mindmap) => XMLSerializerFactory
  .getSerializer(mindmap.getVersion());

/**
 * @param domDocument
 * @return serializer corresponding to the mindmap's version
 */
XMLSerializerFactory.getSerializerFromDocument = (domDocument) => {
  const rootElem = domDocument.documentElement;
  return XMLSerializerFactory.getSerializer(rootElem.getAttribute('version'));
};

/**
 * retrieves the serializer for the mindmap's version and migrates to the current version,
 * e.g. for a Beta mindmap and current version Tango:
 * serializer = new Pela2TangoMigrator(new Beta2PelaMigrator(new XMLSerializer_Beta()))
 * @param {String} version the version name
 * @return serializer
 */
XMLSerializerFactory.getSerializer = function getSerializer(version = ModelCodeName.BETA) {
  const codeNames = XMLSerializerFactory._codeNames;
  let found = false;
  let serializer = null;
  for (let i = 0; i < codeNames.length; i++) {
    if (!found) {
      found = codeNames[i].codeName === version;
      // eslint-disable-next-line new-cap
      if (found) serializer = new (codeNames[i].serializer)();
    } else {
      const { migrator: Migrator } = codeNames[i];
      serializer = new Migrator(serializer);
    }
  }

  return serializer;
};

XMLSerializerFactory._codeNames = [
  {
    codeName: ModelCodeName.BETA,
    serializer: XMLSerializerBeta,
    migrator() {
    },
  },
  {
    codeName: ModelCodeName.PELA,
    serializer: XMLSerializerPela,
    migrator: Beta2PelaMigrator,
  },
  {
    codeName: ModelCodeName.TANGO,
    serializer: XMLSerializerTango,
    migrator: Pela2TangoMigrator,
  },
];

export default XMLSerializerFactory;
