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
import Exporter from './Exporter';

class FreeplaneExporter extends Exporter {
  constructor() {
    super('mmx', 'application/xml');
  }

  extension(): string {
    return 'mmx';
  }

  export(): Promise<string> {
    // TODO: Implement Freeplane export logic
    console.log('Exporting to Freeplane format');
    const freeplaneXml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="freeplane 1.9.13">
  <node TEXT="Exported Map" ID="ID_1" CREATED="${Date.now()}" MODIFIED="${Date.now()}">
    <node TEXT="Exported from WiseMapping" ID="ID_2" CREATED="${Date.now()}" MODIFIED="${Date.now()}" POSITION="right"/>
  </node>
</map>`;
    return Promise.resolve(freeplaneXml);
  }
}

export default FreeplaneExporter;
