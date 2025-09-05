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
import { $assert } from '@wisemapping/core-js';
import { Group, Image } from '@wisemapping/web2d';
import IconGroup from './IconGroup';
import SizeType from './SizeType';
import FeatureModel from './model/FeatureModel';
import Icon from './Icon';
import PositionType from './PositionType';

abstract class ImageIcon implements Icon {
  private _image: Image;

  private _group: IconGroup | null;

  constructor(url: string) {
    $assert(url, 'image url can not be null');
    this._image = new Image();
    this._image.setHref(url);
    this._image.setSize(ImageIcon.SIZE, ImageIcon.SIZE);
    this._group = null;
  }

  getElement(): Image | Group {
    return this._image;
  }

  setGroup(group: IconGroup): void {
    this._group = group;
  }

  getGroup(): IconGroup | null {
    return this._group;
  }

  getSize(): SizeType | undefined {
    return this._image.getSize();
  }

  getPosition(): PositionType {
    return this._image.getPosition();
  }

  addEvent(type: string, fnc): void {
    this._image.addEvent(type, fnc);
  }

  remove() {
    throw new Error('Unsupported operation');
  }

  abstract getModel(): FeatureModel;

  static SIZE = 90;
}

export default ImageIcon;
