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

export default class Arrowlink {
  protected COLOR: string | undefined;

  protected DESTINATION: string | undefined;

  protected ENDARROW: string | undefined;

  protected ENDINCLINATION: string | undefined;

  protected ID: string | undefined;

  protected STARTARROW: string | undefined;

  protected STARTINCLINATION: string | undefined;

  getColor(): string | undefined {
    return this.COLOR;
  }

  getDestination(): string | undefined {
    return this.DESTINATION;
  }

  getEndarrow(): string | undefined {
    return this.ENDARROW;
  }

  getEndInclination(): string | undefined {
    return this.ENDINCLINATION;
  }

  getId(): string | undefined {
    return this.ID;
  }

  getStartarrow(): string | undefined {
    return this.STARTARROW;
  }

  getStartinclination(): string | undefined {
    return this.STARTINCLINATION;
  }

  setColor(value: string): void {
    this.COLOR = value;
  }

  setDestination(value: string): void {
    this.DESTINATION = value;
  }

  setEndarrow(value: string): void {
    this.ENDARROW = value;
  }

  setEndinclination(value: string): void {
    this.ENDINCLINATION = value;
  }

  setId(value: string): void {
    this.ID = value;
  }

  setStartarrow(value: string): void {
    this.STARTARROW = value;
  }

  setStartinclination(value: string): void {
    this.STARTINCLINATION = value;
  }

  toXml(document: Document): HTMLElement {
    const arrowlinkElem = document.createElement('arrowlink');

    if (this.DESTINATION) {
      arrowlinkElem.setAttribute('DESTINATION', this.DESTINATION);
    }
    if (this.STARTARROW) {
      arrowlinkElem.setAttribute('STARTARROW', this.STARTARROW);
    }

    if (this.COLOR) {
      arrowlinkElem.setAttribute('COLOR', this.COLOR);
    }
    if (this.ENDINCLINATION) {
      arrowlinkElem.setAttribute('ENDINCLINATION', this.ENDINCLINATION);
    }
    if (this.ENDARROW) {
      arrowlinkElem.setAttribute('ENDARROW', this.ENDARROW);
    }
    if (this.ID) {
      arrowlinkElem.setAttribute('ID', this.ID);
    }
    if (this.STARTINCLINATION) {
      arrowlinkElem.setAttribute('STARTINCLINATION', this.STARTINCLINATION);
    }

    return arrowlinkElem;
  }
}
