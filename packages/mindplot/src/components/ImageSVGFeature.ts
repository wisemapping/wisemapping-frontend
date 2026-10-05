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

import { Text, Group, Image } from '@wisemapping/web2d';
import { $assert } from './util/assert';
import ElementDeleteWidget from './ElementDeleteWidget';
import { Removable } from './Icon';
import SizeType from './SizeType';
import PositionType from './PositionType';
import Topic from './Topic';
import ThemeFactory from './theme/ThemeFactory';
import ImageEmojiFeature from './ImageEmojiFeature';
import { BRAND_ICON_PATHS, MATERIAL_ICON_CODEPOINTS } from './GalleryIconData';

// The gallery icon size: the font size of a glyph icon, the grid of a brand icon.
const ICON_SIZE = 24;

// The colour of an icon left uncoloured: a glyph without a fill draws black (the SVG default).
const DEFAULT_ICON_COLOR = '#000000';

/** A gallery icon: a Material Icons glyph, or a brand icon drawn from its path. */
export type GalleryIconShape = Text | Image;

/** A self-contained SVG image of a brand icon, so that it also renders in an exported map. */
export const brandIconHref = (path: string, color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" width="${ICON_SIZE}" height="${ICON_SIZE}"><path fill="${color}" d="${path}"/></svg>`,
  )}`;

class ImageSVGFeature {
  private _topic: Topic;

  private _svgText: GalleryIconShape | undefined;

  private _svgRemoveTip: ElementDeleteWidget | undefined;

  // Delete-widget icon of the current _svgText. Reused across redraws, as
  // ElementDeleteWidget.decorate only skips icons it has already decorated.
  private _svgIcon: Removable | undefined;

  private _svgIconText: GalleryIconShape | undefined;

  // Gallery icon name that has no codepoint, so that it is not looked up on every call.
  private _unknownIconName: string | undefined;

  constructor(topic: Topic) {
    $assert(topic, 'topic can not be null');
    this._topic = topic;
    this._svgText = undefined;
    this._svgRemoveTip = undefined;
    this._svgIcon = undefined;
    this._svgIconText = undefined;
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
      } catch {
        // Element might not be in the group, that's okay
      }
      this._svgText = undefined;
    }

    this._svgRemoveTip = undefined; // Clear remove tip
    this._topic.redraw(this._topic.getThemeVariant(), false);
  }

  /**
   * Updates the SVG icon color to match the current topic font color
   * This should be called whenever the topic's font color changes
   */
  updateIconColor(): void {
    if (this._svgText) {
      const color = this.iconColor();
      if (this._svgText instanceof Image) {
        this.colorBrandIcon(this._svgText, color);
      } else if (color) {
        this._svgText.setColor(color);
      }
    }
  }

  /** The topic font colour, or none for a line shape (the icon keeps its default colour). */
  private iconColor(): string | undefined {
    const shapeType = this._topic.getShapeType();
    if (shapeType === 'line') {
      return undefined;
    }
    const model = this._topic.getModel();
    const theme = ThemeFactory.create(model, this._topic.getThemeVariant());
    return theme.getFontColor(this._topic);
  }

  /** Draws the brand icon in a colour, rewriting the image only when it changes. */
  private colorBrandIcon(image: Image, color: string | undefined): void {
    const path = BRAND_ICON_PATHS[this.getGalleryIconName() ?? ''];
    if (path) {
      const href = brandIconHref(path, color ?? DEFAULT_ICON_COLOR);
      if (image.getHref() !== href) {
        image.setHref(href);
      }
    }
  }

  /** The icon size: a glyph is measured, a brand icon is drawn on its grid. */
  private static iconSize(shape: GalleryIconShape): SizeType {
    return shape instanceof Text ? shape.measure() : { width: ICON_SIZE, height: ICON_SIZE };
  }

  getOrBuildSVGElement(): GalleryIconShape | undefined {
    const galleryIconName = this.getGalleryIconName();
    if (!galleryIconName) {
      return undefined;
    }

    if (this._svgText) {
      return this._svgText;
    }
    if (galleryIconName === this._unknownIconName) {
      return undefined;
    }

    // A Text element for a Material Icons glyph, an Image for a brand icon
    const text = BRAND_ICON_PATHS[galleryIconName]
      ? this.createBrandIcon()
      : this.createMaterialIcon(galleryIconName);
    if (!text) {
      this._unknownIconName = galleryIconName;
    }
    if (text) {
      this._svgText = text;
      const group = this._topic.get2DElement();
      group.append(text);
    }

    return this._svgText;
  }

  addToGroup(group: Group): void {
    const svgTextShape = this.getOrBuildSVGElement();
    if (svgTextShape && !ImageEmojiFeature.isLastChild(group, svgTextShape)) {
      // Ensure the element is not already in the group before adding
      try {
        group.removeChild(svgTextShape);
      } catch {
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

  private createBrandIcon(): Image {
    const image = new Image();
    image.setSize(ICON_SIZE, ICON_SIZE);
    this.colorBrandIcon(image, this.iconColor());
    return image;
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
        text.setFontSize(ICON_SIZE); // Standard icon size

        // Set the text content with the Unicode codepoint
        text.setText(iconUnicode);

        // Set the font style (italic or normal) but preserve Material Icons font
        const fontStyle = this._topic.getFontStyle();
        if (fontStyle) {
          text.setStyle(fontStyle);
        }

        // Set icon color to match topic font color (only for non-line shapes)
        const fontColor = this.iconColor();
        if (fontColor) {
          text.setColor(fontColor);
        }

        return text;
      }
      console.warn(`No Unicode mapping found for icon: ${iconName}`);
    } catch (error) {
      console.warn(`Failed to create Material UI icon for ${iconName}:`, error);
    }

    return undefined;
  }

  private getMaterialIconUnicode(iconName: string): string | undefined {
    return MATERIAL_ICON_CODEPOINTS[iconName];
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
    const svgHeight = ICON_SIZE;
    const svgWidth = ImageSVGFeature.iconSize(svgText).width;

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
    const svgX = (topicWidth - ImageSVGFeature.iconSize(svgText).width) / 2;

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
      // The remove tip of the topic's designer
      this._svgRemoveTip = ElementDeleteWidget.getInstance(this._topic.getDesigner());

      // Build the icon once per SVG text (it is rebuilt when the icon is removed and
      // re-added), so decorate() recognizes it and doesn't add listeners on every redraw
      const svgText = this.getOrBuildSVGElement();
      if (!this._svgIcon || this._svgIconText !== svgText) {
        this._svgIcon = this._createSVGIcon() || undefined;
        this._svgIconText = svgText;
      }
      if (this._svgIcon) {
        this._svgRemoveTip.decorate(this._topic.getId(), this._svgIcon, this._topic.get2DElement());
      }
    }
  }

  private _createSVGIcon(): Removable | null {
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
      getGroup(): null {
        return null;
      },
      getSize(): SizeType | undefined {
        return ImageSVGFeature.iconSize(svgText);
      },
      getPosition(): PositionType {
        return svgText.getPosition();
      },
      addEvent(type: string, fnc: () => void): void {
        svgText.addEvent(type, fnc);
      },
      remove(): void {
        const actionDispatcher = topic.getActionDispatcher();
        actionDispatcher.changeImageGalleryIconNameToTopic([topic.getId()], undefined);
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
