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
import EditorRenderMode from './EditorRenderMode';
import WidgetBuilder from './WidgetBuilder';
import PersistenceManager from './PersistenceManager';

export type DesignerOptions = {
  zoom: number;
  mode: EditorRenderMode;
  mapId?: string;
  divContainer: HTMLElement;
  persistenceManager?: PersistenceManager;
  widgetManager: WidgetBuilder;
  saveOnLoad?: boolean;
  locale?: string;
};

class OptionsBuilder {
  static buildOptions(options: DesignerOptions): DesignerOptions {
    $assert(options.persistenceManager, 'persistence must be defined');

    const defaultOptions = {
      mode: 'edition-owner',
      zoom: 0.85,
      saveOnLoad: true,
      locale: 'en',
    };

    return { ...defaultOptions, ...options };
  }

  static async loadOptions(jsonConf: string, options: DesignerOptions): Promise<DesignerOptions> {
    const result = await AjaxUtils.ajax({
      url: jsonConf,
      dataType: 'json',
      method: 'GET',
    });

    return { ...(result as DesignerOptions), ...OptionsBuilder.buildOptions(options) };
  }
}
export default OptionsBuilder;
