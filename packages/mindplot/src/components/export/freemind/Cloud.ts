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

export default class Cloud {
  protected COLOR: string | undefined;

  getColor(): string | undefined {
    return this.COLOR;
  }

  setColor(value: string): void {
    this.COLOR = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const cloudElem = document.createElement('cloud');
    if (this.COLOR) {
      cloudElem.setAttribute('COLOR', this.COLOR);
    }

    return cloudElem;
  }
}
