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
import FeatureModel from './FeatureModel';

class LinkModel extends FeatureModel {
  constructor(attributes) {
    super('link');
    this.setUrl(attributes.url);
  }

  getUrl(): string {
    return this.getAttribute('url') as string;
  }

  setUrl(url: string): void {
    $assert(url, 'url can not be null');

    const fixedUrl = LinkModel._fixUrl(url);
    this.setAttribute('url', fixedUrl);

    const type = fixedUrl.includes('mailto:') ? 'mail' : 'url';
    this.setAttribute('urlType', type);
  }

  // url format is already checked in LinkEditor.checkUrl
  static _fixUrl(url: string): string {
    let result = url;
    if (!result.includes('http://') && !result.includes('https://') && !result.includes('mailto://')) {
      result = `http://${result}`;
    }
    return result;
  }

  /**
     * @param {String} urlType the url type, either 'mail' or 'url'
     * @throws will throw an error if urlType is null or undefined
     */
  setUrlType(urlType) {
    $assert(urlType, 'urlType can not be null');
    this.setAttribute('urlType', urlType);
  }
}
export default LinkModel;
