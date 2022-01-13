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
import PersistenceManager from './PersistenceManager';
import { Size } from './Size';

export type DesignerOptions = {
  zoom: number,
  containerSize?: Size,
  readOnly?: boolean,
  mapId?: string,
  container: string,
  persistenceManager?: PersistenceManager,
  saveOnLoad?: boolean,
  locale?: string,
};

class OptionsBuilder {
  static buildOptions(options: DesignerOptions): DesignerOptions {
    $assert(options.persistenceManager, 'persistence must be defined');

    let { containerSize } = options;
    if (options.containerSize == null) {
      // If it has not been defined, use browser size ...
      containerSize = {
        width: window.screen.width,
        height: window.screen.height,
      };
      console.log(`height:${containerSize.height}`);
    }

    const defaultOptions: DesignerOptions = {
      readOnly: false,
      zoom: 0.85,
      saveOnLoad: true,
      containerSize,
      container: 'mindplot',
      locale: 'en',
    };

    return { ...defaultOptions, ...options };
  }

  static async loadOptions(jsonConf: string, options: DesignerOptions): Promise<DesignerOptions> {
    const result = await $.ajax({
      url: jsonConf,
      dataType: 'json',
      method: 'get',
    });

    return { ...result, ...OptionsBuilder.buildOptions(options) };
  }
}
export default OptionsBuilder;
