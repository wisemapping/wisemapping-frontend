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
import { $assert } from '../util/assert';
import FeatureModel from './FeatureModel';

class LinkModel extends FeatureModel {
  private static readonly ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

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
    // Keep urls whose scheme is allowed. Anything else (no scheme, or a scheme such as
    // javascript:) gets the http:// prefix, so the resulting href can never run script.
    let protocol: string | null = null;
    try {
      protocol = new URL(url).protocol;
    } catch {
      // Not an absolute url, so it has no scheme yet.
    }
    return protocol && LinkModel.ALLOWED_PROTOCOLS.has(protocol) ? url : `http://${url}`;
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
