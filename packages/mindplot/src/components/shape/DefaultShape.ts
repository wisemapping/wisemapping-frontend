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
import { ElementClass, ElementPeer, Group } from '@wisemapping/web2d';
import { TopicShapeType } from '../model/INodeModel';
import SizeType from '../SizeType';
import TopicShape from './TopicShape';

abstract class DefaultTopicShape<T extends ElementClass<ElementPeer>> implements TopicShape {
  private _shape: T;

  private _type: TopicShapeType;

  constructor(shape: T, type: TopicShapeType) {
    this._shape = shape;
    this._type = type;
  }

  getShapeType(): TopicShapeType {
    return this._type;
  }

  setStroke(width: number | null, style: string, color: string): void {
    this._shape.setStroke(width, style, color);
  }

  setOpacity(value: number): void {
    this._shape.setOpacity(value);
  }

  setFill(value: string, opacity?: number): void {
    this._shape.setFill(value, opacity);
  }

  setVisibility(value: boolean, fade?: number): void {
    this._shape.setVisibility(value, fade);
  }

  protected getShape(): T {
    return this._shape;
  }

  setCursor(value: string): void {
    this._shape.setCursor(value);
  }

  appendTo(group: Group): void {
    group.append(this.getShape());
  }

  removeFrom(group: Group): void {
    group.removeChild(this.getShape());
  }

  abstract setSize(width: number, height: number): void;

  abstract getSize(): SizeType | null;

  abstract setPosition(x: number, y: number): void;
}

export default DefaultTopicShape;
