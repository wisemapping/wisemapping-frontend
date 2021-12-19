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
import { $assert, innerXML } from '@wisemapping/core-js';
import XMLSerializerFactory from './persistence/XMLSerializerFactory';

class PersistenceManager {
  save(mindmap, editorProperties, saveHistory, events, sync) {
    $assert(mindmap, 'mindmap can not be null');
    $assert(editorProperties, 'editorProperties can not be null');

    const mapId = mindmap.getId();
    $assert(mapId, 'mapId can not be null');

    const serializer = XMLSerializerFactory.getSerializerFromMindmap(mindmap);
    const domMap = serializer.toXML(mindmap);
    const mapXml = innerXML(domMap);

    const pref = JSON.stringify(editorProperties);
    try {
      this.saveMapXml(mapId, mapXml, pref, saveHistory, events, sync);
    } catch (e) {
      console.log(e);
      events.onError(this._buildError());
    }
  }

  load(mapId) {
    $assert(mapId, 'mapId can not be null');
    const domDocument = this.loadMapDom(mapId);
    return PersistenceManager.loadFromDom(mapId, domDocument);
  }

  discardChanges(mapId) {
    throw new Error('Method must be implemented');
  }

  loadMapDom(mapId) {
    throw new Error('Method must be implemented');
  }

  saveMapXml(mapId, mapXml, pref, saveHistory, events, sync) {
    throw new Error('Method must be implemented');
  }

  unlockMap(mindmap) {
    throw new Error('Method must be implemented');
  }
}

PersistenceManager.init = function (instance) {
  PersistenceManager._instance = instance;
};

PersistenceManager.getInstance = function () {
  return PersistenceManager._instance;
};

PersistenceManager.loadFromDom = function loadFromDom(mapId, mapDom) {
  $assert(mapId, 'mapId can not be null');
  $assert(mapDom, 'mapDom can not be null');

  const serializer = XMLSerializerFactory.getSerializerFromDocument(mapDom);
  return serializer.loadFromDom(mapDom, mapId);
};

export default PersistenceManager;
