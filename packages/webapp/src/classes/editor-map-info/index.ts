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
import { MapInfo } from '@wisemapping/editor';
import Client from '../client';

class MapInfoImpl implements MapInfo {
  private client: Client;
  private id: number;
  private title: string;
  private zoom: number;
  private locked: boolean;
  private lockedMsg: string | undefined;

  constructor(
    id: number,
    client: Client,
    title: string,
    locked: boolean,
    lockedMsg: string | undefined,
    zoom: number,
  ) {
    this.id = id;
    this.client = client;
    this.title = title;
    this.zoom = zoom;
    this.locked = locked;
    this.lockedMsg = lockedMsg;
  }

  isStarred(): Promise<boolean> {
    return this.client.fetchStarred(this.id);
  }

  updateStarred(value: boolean): Promise<void> {
    return this.client.updateStarred(this.id, value);
  }

  getTitle(): string {
    return this.title;
  }

  setTitle(value: string): void {
    this.client.renameMap(Number.parseInt(this.getId(), 10), { title: value });
  }

  isLocked(): boolean {
    return this.locked;
  }

  getLockedMessage(): string | undefined {
    return this.lockedMsg;
  }

  getZoom(): number {
    return this.zoom;
  }

  getId(): string {
    return String(this.id);
  }
}
export default MapInfoImpl;
