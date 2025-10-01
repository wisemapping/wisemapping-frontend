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

export default class VersionNumber {
  protected version: string;

  constructor(version: string) {
    this.version = version;
  }

  public getVersion(): string {
    return this.version;
  }

  public isGreaterThan(versionNumber: VersionNumber): boolean {
    return this.compareTo(versionNumber) < 0;
  }

  public compareTo(otherObject: VersionNumber): number {
    if (this.equals<VersionNumber>(otherObject)) {
      return 0;
    }

    const ownTokinizer = this.getTokinizer();
    const otherTokinizer = otherObject.getTokinizer();

    for (let i = 0; i < ownTokinizer.length; i++) {
      let ownNumber: number;
      let ohterNumber: number;

      try {
        ownNumber = parseInt(ownTokinizer[i], 10);
        ohterNumber = parseInt(otherTokinizer[i], 10);
      } catch {
        return 1;
      }

      if (ownNumber > ohterNumber) {
        return 1;
      }
      if (ownNumber < ohterNumber) {
        return -1;
      }
    }

    return -1;
  }

  public equals<T>(o: T): boolean {
    if (!(o instanceof VersionNumber)) {
      return false;
    }
    const versionNumber: VersionNumber = o as VersionNumber;
    return this.version === versionNumber.version;
  }

  private getTokinizer(): Array<string> {
    return this.getVersion().split('.');
  }
}
