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
import { Image } from '@wisemapping/web2d';
import { $assert } from './util/assert';

import ImageIcon from './ImageIcon';
import ActionDispatcher from './ActionDispatcher';
import iconFamily from './model/SvgIconFamily.json';
import Topic from './Topic';
import SvgIconModel from './model/SvgIconModel';
import { mapIconNameToAsset } from './IconMapping';

// Create icon URL mapping using webpack's require.context
// This works consistently in both development and production since webpack
// inlines SVG files as data URLs in both environments
const images: { [key: string]: string } = {};

// Initialize icon URLs using webpack's require.context
const initializeIcons = () => {
  const iconContext = require.context('../../assets/icons', false, /\.(svg|png)$/);

  iconContext.keys().forEach((iconPath) => {
    // Extract filename without extension
    const filename = iconPath.replace('./', '').replace(/\.(svg|png)$/, '');
    const extension = iconPath.match(/\.(svg|png)$/)?.[1];

    if (extension) {
      // Use webpack's processed URL (data URL in both dev and prod)
      images[`${filename}.${extension}`] = iconContext(iconPath);
    }
  });
};

// Get image URL with fallback handling
const originalGetImageUrl = (iconId: string): string => {
  // Try SVG first, then PNG
  let result = images[`${iconId}.svg`];
  if (!result) {
    result = images[`${iconId}.png`];
  }

  // If not found in mapping, log warning and return empty string
  if (!result) {
    console.warn(`Icon not found: ${iconId}`);
    result = '';
  }

  return result;
};

initializeIcons();

class SvgImageIcon extends ImageIcon {
  private _topicId: number;

  private _featureModel: SvgIconModel;

  constructor(topic: Topic, iconModel: SvgIconModel, readOnly: boolean) {
    $assert(iconModel, 'iconModel can not be null');
    $assert(topic, 'topic can not be null');

    // Build graph image representation ...
    const iconType = iconModel.getIconType();
    const imgUrl = SvgImageIcon.getImageUrl(iconType);
    super(imgUrl);

    this._topicId = topic.getId();
    this._featureModel = iconModel;

    if (!readOnly) {
      // Icon
      const image = this.getElement();
      image.addEvent('click', () => {
        const iconTypeClick = iconModel.getIconType();
        const newIconType = SvgImageIcon._getNextFamilyIconId(iconTypeClick);
        iconModel.setIconType(newIconType);

        const url = SvgImageIcon.getImageUrl(newIconType);
        (this.getElement() as Image).setHref(url);
      });
      this.getElement().setCursor('pointer');
    }
  }

  static getImageUrl(iconId: string) {
    // Map descriptive icon name to asset file name
    const assetName = mapIconNameToAsset(iconId.toLowerCase());
    return originalGetImageUrl(assetName);
  }

  getModel() {
    return this._featureModel;
  }

  private static _getNextFamilyIconId(iconId: string): string {
    const familyIcons = SvgImageIcon._getFamilyIcons(iconId);
    $assert(familyIcons !== null, `Family Icon not found: ${iconId}`);

    let result: string | null = null;
    for (let i = 0; i < familyIcons.length && result == null; i++) {
      if (familyIcons[i] === iconId) {
        // Is last one?
        if (i === familyIcons.length - 1) {
          [result] = familyIcons;
        } else {
          result = familyIcons[i + 1];
        }
        break;
      }
    }

    if (!result) {
      throw new Error(`Could not find iconId ${iconId}`);
    }

    return result;
  }

  private static _getFamilyIcons(iconId: string): string[] {
    $assert(iconId != null, 'id must not be null');
    $assert(iconId.indexOf('_') !== -1, `Invalid icon id (it must contain '_'). Id: ${iconId}`);

    let result: string[] | null = null;
    for (let i = 0; i < iconFamily.length; i++) {
      const family = iconFamily[i];
      const iconFamilyId = iconId.substr(0, iconId.indexOf('_'));

      if (family.id === iconFamilyId) {
        result = family.icons;
        break;
      }
    }

    if (!result) {
      throw new Error(`Could not find icon id ${iconId}`);
    }

    return result;
  }

  remove() {
    const actionDispatcher = ActionDispatcher.getInstance();
    const featureId = this._featureModel.getId();
    const topicId = this._topicId;
    actionDispatcher.removeFeatureFromTopic(topicId, featureId);
  }
}

export default SvgImageIcon;
