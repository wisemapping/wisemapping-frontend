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
import Arrowlink from '../freemind/Arrowlink';

// Freeplane arrowlinks also have a dash pattern, its lengths separated by spaces.
export default class FreeplaneArrowlink extends Arrowlink {
  private DASH: string | undefined;

  setDash(value: string): void {
    this.DASH = value;
  }

  toXml(document: Document): HTMLElement {
    const arrowlinkElem = super.toXml(document);
    if (this.DASH) {
      arrowlinkElem.setAttribute('DASH', this.DASH);
    }
    return arrowlinkElem;
  }
}
