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
import { TopicShapeType } from '../model/INodeModel';
import SizeType from '../SizeType';
import TopicShape from './TopicShape';

class NoneTopicShape implements TopicShape {
  private _size: SizeType | undefined;

  setSize(width: number, height: number): void {
    // Ignore ...
    this._size = { width, height };
  }

  getSize(): SizeType | null {
    return this._size || null;
  }

  setPosition(): void {
    // Ignore ...
  }

  setFill(): void {
    // Ignore ...
  }

  setVisibility(): void {
    // Ignore ...
  }

  setOpacity(): void {
    // Ignore ...
  }

  setCursor(): void {
    // Ignore ...
  }

  appendTo(): void {
    // Ignore ...
  }

  removeFrom(): void {
    // Ignore ...
  }

  setStroke(): void {
    // Ignore ...
  }

  getShapeType(): TopicShapeType {
    return 'none';
  }
}

export default NoneTopicShape;
