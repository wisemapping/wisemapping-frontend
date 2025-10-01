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

export default class Font {
  protected BOLD: string | undefined;

  protected ITALIC: string | undefined;

  protected NAME: string | undefined;

  protected SIZE: string | undefined;

  getBold(): string | undefined {
    return this.BOLD;
  }

  getItalic(): string | undefined {
    return this.ITALIC;
  }

  getName(): string | undefined {
    return this.NAME;
  }

  getSize(): string | undefined {
    return this.SIZE;
  }

  setBold(value: string): void {
    this.BOLD = value;
  }

  setItalic(value: string): void {
    this.ITALIC = value;
  }

  setName(value: string): void {
    this.NAME = value;
  }

  setSize(value: string): void {
    this.SIZE = value;
  }

  toXml(document: Document): HTMLElement {
    const fontElem = document.createElement('font');

    if (this.SIZE) {
      fontElem.setAttribute('SIZE', this.SIZE);
    } else {
      fontElem.setAttribute('SIZE', '12');
    }
    if (this.BOLD) fontElem.setAttribute('BOLD', this.BOLD);
    if (this.ITALIC) fontElem.setAttribute('ITALIC', this.ITALIC);
    if (this.NAME) fontElem.setAttribute('NAME', this.NAME);

    return fontElem;
  }
}
