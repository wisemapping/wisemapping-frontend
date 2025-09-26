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
import { MapInfo } from '../../../../src';

class MapInfoImpl implements MapInfo {
  private id: string;
  private title: string;
  private locked: boolean;
  private starred: boolean;
  private lockedMsg: string | undefined;
  private creatorFullName: string;

  constructor(
    id: string,
    title: string,
    creatorFullName: string,
    locked: boolean,
    lockedMsg?: string,
  ) {
    this.id = id;
    this.title = title;
    this.locked = locked;
    this.lockedMsg = lockedMsg;
    this.starred = true;
    this.creatorFullName = creatorFullName;
  }

  getCreatorFullName(): string {
    return this.creatorFullName;
  }

  isStarred(): Promise<boolean> {
    return Promise.resolve(this.starred);
  }

  updateStarred(value: boolean): Promise<void> {
    this.starred = value;
    return Promise.resolve();
  }

  getTitle(): string {
    return this.title;
  }

  getLockedMsg(): string | undefined {
    return this.lockedMsg;
  }

  updateTitle(title: string): Promise<void> {
    this.title = title;
    return Promise.resolve();
  }

  isLocked(): boolean {
    return this.locked;
  }

  getLockedMessage(): string {
    return 'Map Is Locked !';
  }

  getZoom(): number {
    return 0.8;
  }

  getId(): string {
    return this.id;
  }
}
export default MapInfoImpl;
