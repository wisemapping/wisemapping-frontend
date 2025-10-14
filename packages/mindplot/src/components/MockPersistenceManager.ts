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
import { $assert } from './util/assert';
import { AjaxUtils } from './util/AjaxUtils';
import PersistenceManager from './PersistenceManager';

class MockPersistenceManager extends PersistenceManager {
  private exampleMap: string;

  constructor(exampleMapAsXml: string) {
    super();
    $assert(exampleMapAsXml, 'The test map must be set');
    this.exampleMap = exampleMapAsXml;
  }

  saveMapXml(): void {
    // Ignore, no implementation required ...
  }

  discardChanges() {
    // Ignore, no implementation required ...
  }

  loadMapDom(): Promise<Document> {
    return Promise.resolve(AjaxUtils.parseXML(this.exampleMap));
  }

  unlockMap(): void {
    // Ignore, no implementation required ...
  }
}

export default MockPersistenceManager;
