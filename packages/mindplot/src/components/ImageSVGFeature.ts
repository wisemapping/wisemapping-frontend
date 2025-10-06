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

/**
 * ImageSVGFeature handles the display and management of icons from the Icons Gallery.
 * It provides functionality to set, get, and render Material UI icons on topics.
 */

import { $assert } from '@wisemapping/core-js';
import { Text, Group } from '@wisemapping/web2d';
import ElementDeleteWidget from './ElementDeleteWidget';
import ActionDispatcher from './ActionDispatcher';
import Icon from './Icon';
import SizeType from './SizeType';
import PositionType from './PositionType';
import FeatureModel from './model/FeatureModel';
import Topic from './Topic';
import ThemeFactory from './theme/ThemeFactory';

class ImageSVGFeature {
  private _topic: Topic;

  private _svgText: Text | undefined;

  private _svgRemoveTip: ElementDeleteWidget | undefined;

  constructor(topic: Topic) {
    $assert(topic, 'topic can not be null');
    this._topic = topic;
    this._svgText = undefined;
    this._svgRemoveTip = undefined;
  }

  getGalleryIconName(): string | undefined {
    const model = this._topic.getModel();
    return model.getImageGalleryIconName();
  }

  setGalleryIconName(galleryIconName: string | undefined): void {
    const model = this._topic.getModel();
    model.setImageGalleryIconName(galleryIconName);

    // Always clean up the existing SVG text element before creating a new one
    if (this._svgText) {
      // Remove existing SVG text from group
      const group = this._topic.get2DElement();
      try {
        group.removeChild(this._svgText);
      } catch (e) {
        // Element might not be in the group, that's okay
      }
      this._svgText = undefined;
    }

    this._svgRemoveTip = undefined; // Clear remove tip
    this._topic.redraw(this._topic.getThemeVariant(), false);
  }

  getOrBuildSVGElement(): Text | undefined {
    const galleryIconName = this.getGalleryIconName();
    if (!galleryIconName) {
      return undefined;
    }

    if (this._svgText) {
      return this._svgText;
    }

    // Create Text element for Material UI icon
    const text = this.createMaterialIcon(galleryIconName);
    if (text) {
      this._svgText = text;
      const group = this._topic.get2DElement();
      group.append(text);
    }

    return this._svgText;
  }

  addToGroup(group: Group): void {
    const svgTextShape = this.getOrBuildSVGElement();
    if (svgTextShape) {
      // Ensure the element is not already in the group before adding
      try {
        group.removeChild(svgTextShape);
      } catch (e) {
        // Element might not be in the group, that's okay
      }
      group.append(svgTextShape);
      // Move SVG text to front to ensure it appears above other elements
      svgTextShape.moveToFront();
    }
  }

  removeFromGroup(group: Group): void {
    if (this._svgText) {
      group.removeChild(this._svgText);
      this._svgText = undefined;
    } else {
      this._svgText = undefined; // Clear to force rebuild
    }

    this._svgRemoveTip = undefined; // Clear remove tip
    // Don't call redraw here to avoid infinite recursion
  }

  private createMaterialIcon(iconName: string): Text | undefined {
    try {
      // Get the Material Icons Unicode codepoint for the icon
      const iconUnicode = this.getMaterialIconUnicode(iconName);
      if (iconUnicode) {
        // Create Text element for Material UI icon
        const text = new Text();

        // Set the Material Icons font
        text.setFontName('Material Icons');

        // Set the text properties
        text.setFontSize(24); // Standard icon size

        // Set the text content with the Unicode codepoint
        text.setText(iconUnicode);

        // Set the font style (italic or normal) but preserve Material Icons font
        const fontStyle = this._topic.getFontStyle();
        if (fontStyle) {
          text.setStyle(fontStyle);
        }

        // Set icon color to match topic font color (only for non-line shapes)
        const shapeType = this._topic.getShapeType();
        if (shapeType !== 'line') {
          const model = this._topic.getModel();
          const theme = ThemeFactory.create(model, this._topic.getThemeVariant());
          const fontColor = theme.getFontColor(this._topic);
          text.setColor(fontColor);
        }

        return text;
      } else {
        console.warn(`No Unicode mapping found for icon: ${iconName}`);
      }
    } catch (error) {
      console.warn(`Failed to create Material UI icon for ${iconName}:`, error);
    }

    return undefined;
  }

  private getMaterialIconUnicode(iconName: string): string | undefined {
    // Material Icons Unicode codepoints
    // These are the actual Unicode codepoints for Material Icons font
    const materialIcons: { [key: string]: string } = {
      // Basic actions
      Star: '\ue838', // star
      star: '\ue838', // star (lowercase)
      Favorite: '\ue87d', // favorite
      favorite: '\ue87d', // favorite (lowercase)
      ThumbUp: '\ue8dc', // thumb_up
      'thumbs-up': '\ue8dc', // thumbs-up (kebab-case)
      CheckCircle: '\ue86c', // check_circle
      'check-circle': '\ue86c', // check-circle (kebab-case)
      Warning: '\ue002', // warning
      warning: '\ue002', // warning (lowercase)
      Error: '\ue000', // error
      error: '\ue000', // error (lowercase)
      Info: '\ue88e', // info
      info: '\ue88e', // info (lowercase)
      Help: '\ue887', // help
      help: '\ue887', // help (lowercase)
      Add: '\ue145', // add
      add: '\ue145', // add (lowercase)
      Delete: '\ue872', // delete
      delete: '\ue872', // delete (lowercase)
      Edit: '\ue3c9', // edit
      edit: '\ue3c9', // edit (lowercase)
      Save: '\ue161', // save
      save: '\ue161', // save (lowercase)
      Search: '\ue8b6', // search
      search: '\ue8b6', // search (lowercase)
      Settings: '\ue8b8', // settings
      settings: '\ue8b8', // settings (lowercase)

      // Navigation
      Home: '\ue88a', // home
      home: '\ue88a', // home (lowercase)
      Work: '\ue8f9', // work
      work: '\ue8f9', // work (lowercase)
      Business: '\ue7ee', // business
      business: '\ue7ee', // business (lowercase)

      // Communication
      Email: '\ue0be', // email
      email: '\ue0be', // email (lowercase)
      Phone: '\ue0cd', // phone
      phone: '\ue0cd', // phone (lowercase)
      Message: '\ue0c9', // message
      message: '\ue0c9', // message (lowercase)
      Share: '\ue80d', // share
      share: '\ue80d', // share (lowercase)

      // Technology
      Computer: '\ue30a', // computer
      computer: '\ue30a', // computer (lowercase)
      Smartphone: '\ue32c', // smartphone
      smartphone: '\ue32c', // smartphone (lowercase)
      Tablet: '\ue32f', // tablet
      tablet: '\ue32f', // tablet (lowercase)
      Laptop: '\ue31e', // laptop
      laptop: '\ue31e', // laptop (lowercase)

      // Transportation
      DirectionsCar: '\ue531', // directions_car
      'directions-car': '\ue531', // directions-car (kebab-case)
      Flight: '\ue539', // flight
      flight: '\ue539', // flight (lowercase)
      Train: '\ue570', // train
      train: '\ue570', // train (lowercase)
      DirectionsBike: '\ue52f', // directions_bike
      'directions-bike': '\ue52f', // directions-bike (kebab-case)
      DirectionsWalk: '\ue536', // directions_walk
      'directions-walk': '\ue536', // directions-walk (kebab-case)
      LocationOn: '\ue55f', // location_on
      'location-on': '\ue55f', // location-on (kebab-case)
      DirectionsBus: '\ue530', // directions_bus
      'directions-bus': '\ue530', // directions-bus (kebab-case)
      DirectionsSubway: '\ue534', // directions_subway
      'directions-subway': '\ue534', // directions-subway (kebab-case)
      TwoWheeler: '\ue9ca', // two_wheeler
      'two-wheeler': '\ue9ca', // two-wheeler (kebab-case)
      DirectionsRun: '\ue566', // directions_run
      'directions-run': '\ue566', // directions-run (kebab-case)

      // Education & Creative
      School: '\ue80c', // school
      school: '\ue80c', // school (lowercase)
      Palette: '\ue40a', // palette
      palette: '\ue40a', // palette (lowercase)
      Brush: '\ue3ae', // brush
      brush: '\ue3ae', // brush (lowercase)
      Lightbulb: '\ue0f0', // lightbulb
      lightbulb: '\ue0f0', // lightbulb (lowercase)
      FlashOn: '\ue3e1', // flash_on
      'flash-on': '\ue3e1', // flash-on (kebab-case)
      Security: '\ue32a', // security
      security: '\ue32a', // security (lowercase)
      Lock: '\ue897', // lock
      lock: '\ue897', // lock (lowercase)
      MenuBook: '\ue421', // menu_book
      'menu-book': '\ue421', // menu-book (kebab-case)
      Assignment: '\ue85d', // assignment
      assignment: '\ue85d', // assignment (lowercase)
      Build: '\ue869', // build
      build: '\ue869', // build (lowercase)
      Science: '\uea4b', // science
      science: '\uea4b', // science (lowercase)

      // Lifestyle
      Restaurant: '\ue56c', // restaurant
      restaurant: '\ue56c', // restaurant (lowercase)
      ShoppingCart: '\ue8cc', // shopping_cart
      'shopping-cart': '\ue8cc', // shopping-cart (kebab-case)
      LocalGroceryStore: '\ue547', // local_grocery_store
      'local-grocery-store': '\ue547', // local-grocery-store (kebab-case)
      LocalHospital: '\ue548', // local_hospital
      'local-hospital': '\ue548', // local-hospital (kebab-case)
      SportsSoccer: '\uea2c', // sports_soccer
      'sports-soccer': '\uea2c', // sports-soccer (kebab-case)
      SportsBasketball: '\uea26', // sports_basketball
      'sports-basketball': '\uea26', // sports-basketball (kebab-case)
      Gamepad: '\ue30f', // gamepad
      gamepad: '\ue30f', // gamepad (lowercase)
      Book: '\ue865', // book
      book: '\ue865', // book (lowercase)
      LocalCafe: '\ue541', // local_cafe
      'local-cafe': '\ue541', // local-cafe (kebab-case)
      ShoppingBag: '\ue8cb', // shopping_bag
      'shopping-bag': '\ue8cb', // shopping-bag (kebab-case)
    };

    return materialIcons[iconName];
  }

  hasSVG(): boolean {
    return this.getOrBuildSVGElement() !== undefined;
  }

  calculateSVGDimensions(): { height: number; width: number } {
    if (!this.hasSVG()) {
      return { height: 0, width: 0 };
    }

    const svgText = this.getOrBuildSVGElement();
    if (!svgText) {
      return { height: 0, width: 0 };
    }

    // Standard icon size
    const svgHeight = 24;
    const svgWidth = svgText.getShapeWidth();

    return { height: svgHeight, width: svgWidth };
  }

  calculateTopicSizeAdjustments(
    currentWidth: number,
    currentHeight: number,
    textHeight: number,
    padding: number,
  ): { width: number; height: number } {
    if (!this.hasSVG()) {
      return { width: currentWidth, height: currentHeight };
    }

    const { height: svgHeight, width: svgWidth } = this.calculateSVGDimensions();

    // Adjust topic height to accommodate SVG with balanced spacing
    const topPadding = padding; // Same distance from top as text has from bottom
    const spacing = 12; // More space between SVG and text
    const bottomPadding = padding; // Same distance as top padding
    const newHeight = topPadding + svgHeight + spacing + textHeight + bottomPadding;

    // Adjust topic width if SVG is wider than current width
    const svgRequiredWidth = svgWidth + padding * 2;
    const newWidth = Math.max(currentWidth, svgRequiredWidth);

    return { width: newWidth, height: newHeight };
  }

  positionSVGAndAdjustText(
    topicWidth: number,
    svgHeight: number,
    textHeight: number,
    padding: number,
  ): { textY: number; iconY: number } {
    if (!this.hasSVG()) {
      // Default positioning for shapes without SVG
      const yPosition = (this._topic.getSize().height - textHeight) / 2;
      return {
        textY: yPosition,
        iconY: yPosition - yPosition / 4,
      };
    }

    const svgText = this.getOrBuildSVGElement();
    if (!svgText) {
      return { textY: 0, iconY: 0 };
    }

    // Center SVG horizontally in the middle of the topic
    const svgX = (topicWidth - svgText.getShapeWidth()) / 2;

    // Position text and icons below the SVG with balanced spacing
    const spacing = 12; // More space between SVG and text
    const topOffset = padding; // Same distance from top as text has from bottom
    const textY = topOffset + svgHeight + spacing;
    const svgY = topOffset;

    // Position SVG at top
    svgText.setPosition(svgX, svgY);

    // For line shapes, adjust text positioning to be more centered
    const shapeType = this._topic.getShapeType();
    const adjustedTextY = shapeType === 'line' ? textY + textHeight / 2 : textY;

    // Ensure text and icons are properly aligned vertically
    const iconHeight = this._topic.getOrBuildIconGroup().getSize().height;
    const iconY = adjustedTextY - (iconHeight - textHeight) / 2;

    return { textY: adjustedTextY, iconY };
  }

  buildRemoveTip(): void {
    if (!this._topic.isReadOnly() && this.hasSVG()) {
      // Get singleton instance of remove tip
      this._svgRemoveTip = ElementDeleteWidget.getInstance();

      // Always create and decorate SVG icon (in case it was removed and re-added)
      const svgIcon = this._createSVGIcon();
      if (svgIcon) {
        this._svgRemoveTip.decorate(this._topic.getId(), svgIcon, this._topic.get2DElement());
      }
    }
  }

  private _createSVGIcon(): Icon | null {
    const svgIconName = this.getGalleryIconName();
    if (!svgIconName) {
      return null;
    }

    const svgText = this.getOrBuildSVGElement();
    if (!svgText) {
      return null;
    }

    const topic = this._topic; // Capture topic reference for closure

    return {
      getElement(): Group {
        return topic.get2DElement(); // Return the topic's main group
      },
      setGroup(): void {
        // Not needed for SVG
      },
      getGroup(): null {
        return null;
      },
      getSize(): SizeType | undefined {
        return {
          width: svgText.getShapeWidth(),
          height: svgText.getShapeHeight(),
        };
      },
      getPosition(): PositionType {
        return svgText.getPosition();
      },
      addEvent(type: string, fnc: () => void): void {
        svgText.addEvent(type, fnc);
      },
      remove(): void {
        const actionDispatcher = ActionDispatcher.getInstance();
        actionDispatcher.changeImageGalleryIconNameToTopic([topic.getId()], undefined);
      },
      getModel(): FeatureModel {
        // Return a dummy model for compatibility
        return {} as FeatureModel;
      },
    };
  }

  remove(): void {
    if (this._svgText) {
      const group = this._topic.get2DElement();
      group.removeChild(this._svgText);
      this._svgText = undefined;
    }

    if (this._svgRemoveTip) {
      this._svgRemoveTip.hide();
      this._svgRemoveTip = undefined;
    }
  }
}

export default ImageSVGFeature;
