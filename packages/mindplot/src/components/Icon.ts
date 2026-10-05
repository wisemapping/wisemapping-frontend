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
import { Group, Image } from '@wisemapping/web2d';
import IconGroup from './IconGroup';
import FeatureModel from './model/FeatureModel';
import PositionType from './PositionType';
import SizeType from './SizeType';

/**
 * Something on a topic the ElementDeleteWidget can offer to remove: an icon of the topic's
 * IconGroup, or the gallery SVG and the emoji drawn next to the text, which have no feature model.
 */
export interface Removable {
  getElement(): Group | Image;

  /** The IconGroup it is in, whose scale the widget accounts for; null when it is in none. */
  getGroup(): IconGroup | null;

  getSize(): SizeType | undefined;

  getPosition(): PositionType;

  addEvent(type: string, fnc: () => void): void;

  remove(): void;
}

/** An icon of a topic's IconGroup, built from one of its features. */
interface Icon extends Removable {
  setGroup(group: IconGroup): void;

  getModel(): FeatureModel;
}

export default Icon;
