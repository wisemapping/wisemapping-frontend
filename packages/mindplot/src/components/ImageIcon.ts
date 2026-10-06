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
import type { Group } from '@wisemapping/web2d';
import { Image } from '@wisemapping/web2d';
import { $assert } from './util/assert';
import type IconGroup from './IconGroup';
import type SizeType from './SizeType';
import type FeatureModel from './model/FeatureModel';
import type Icon from './Icon';
import type PositionType from './PositionType';

abstract class ImageIcon implements Icon {
  private _image: Image;

  private _group: IconGroup | null;

  constructor(url: string) {
    // An empty url is an icon whose image is unknown (SvgImageIcon warns about it): it is drawn
    // as an empty image, so the topic and its map still load.
    $assert(url !== undefined && url !== null, 'image url can not be null');
    this._image = new Image();
    this._image.setHref(url);
    this._image.setSize(ImageIcon.SIZE, ImageIcon.SIZE);
    this._group = null;
  }

  getElement(): Image | Group {
    return this._image;
  }

  protected getImageElement(): Image {
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

  addEvent(type: string, fnc: (event: Event) => void): void {
    this._image.addEvent(type, fnc);
  }

  remove() {
    throw new Error('Unsupported operation');
  }

  abstract getModel(): FeatureModel;

  static SIZE = 90;
}

export default ImageIcon;
