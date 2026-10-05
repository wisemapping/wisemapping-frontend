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

import { Text, Group } from '@wisemapping/web2d';
import type { Image } from '@wisemapping/web2d';
import { $assert } from './util/assert';
import ElementDeleteWidget from './ElementDeleteWidget';
import Icon from './Icon';
import IconGroup from './IconGroup';
import SizeType from './SizeType';
import PositionType from './PositionType';
import FeatureModel from './model/FeatureModel';
import Topic from './Topic';
import ThemeFactory from './theme/ThemeFactory';

class ImageEmojiFeature {
  private _topic: Topic;

  private _emojiText: Text | undefined;

  private _emojiRemoveTip: ElementDeleteWidget | undefined;

  // Delete-widget icon of the current _emojiText. Reused across redraws, as
  // ElementDeleteWidget.decorate only skips icons it has already decorated.
  private _emojiIcon: Icon | undefined;

  private _emojiIconText: Text | undefined;

  // Values last applied to _emojiText, so that a redraw only updates the changed ones.
  private _appliedChar: string | undefined;

  private _appliedFontSize: number | undefined;

  private _appliedFontStyle: string | undefined;

  constructor(topic: Topic) {
    $assert(topic, 'topic can not be null');
    this._topic = topic;
    this._emojiText = undefined;
    this._emojiRemoveTip = undefined;
    this._emojiIcon = undefined;
    this._emojiIconText = undefined;
  }

  getEmojiChar(): string | undefined {
    const model = this._topic.getModel();
    return model.getImageEmojiChar();
  }

  setEmojiChar(emojiChar: string | undefined): void {
    const model = this._topic.getModel();
    model.setImageEmojiChar(emojiChar);

    // Remove the current emoji text from DOM, whether the emoji is being removed
    // or replaced, and clear it to force a rebuild
    if (this._emojiText) {
      this.removeFromGroup(this._topic.get2DElement());
    }
    this._emojiText = undefined;

    this._emojiRemoveTip = undefined; // Clear remove tip
    this._topic.redraw(this._topic.getThemeVariant(), false);
  }

  getOrBuildEmojiTextShape(): Text | undefined {
    const emojiChar = this.getEmojiChar();
    if (emojiChar && !this._emojiText) {
      const emojiText = new Text();
      emojiText.setFontSize(this._topic.getFontSize() * 3); // 3x font size for emoji
      emojiText.setFontName(
        '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif',
      );
      // Ensure emoji text inherits the same font style as the main text
      const fontStyle = this._topic.getFontStyle();
      emojiText.setStyle(fontStyle);
      emojiText.setText(emojiChar);

      this._emojiText = emojiText;
      this._appliedChar = emojiChar;
      this._appliedFontSize = this._topic.getFontSize() * 3;
      this._appliedFontStyle = fontStyle;
    } else if (!emojiChar && this._emojiText) {
      // Remove emoji text if no emoji character
      this._emojiText = undefined;
    } else if (emojiChar && this._emojiText) {
      // Update the emoji text, its font size and its style when they changed: setting
      // the text rebuilds its tspans, and this runs several times per redraw.
      if (this._appliedChar !== emojiChar) {
        this._emojiText.setText(emojiChar);
        this._appliedChar = emojiChar;
      }
      const fontSize = this._topic.getFontSize() * 3;
      if (this._appliedFontSize !== fontSize) {
        this._emojiText.setFontSize(fontSize);
        this._appliedFontSize = fontSize;
      }
      const fontStyle = this._topic.getFontStyle();
      if (this._appliedFontStyle !== fontStyle) {
        this._emojiText.setStyle(fontStyle);
        this._appliedFontStyle = fontStyle;
      }
    }
    return this._emojiText;
  }

  /** Whether the topic has an emoji. It does not build nor update the emoji text. */
  hasEmoji(): boolean {
    return Boolean(this.getEmojiChar());
  }

  getEmojiTextShape(): Text | undefined {
    return this._emojiText;
  }

  setVisibility(visible: boolean, fade = 0): void {
    if (this._emojiText) {
      this._emojiText.setVisibility(visible, fade);
    }
  }

  setOpacity(opacity: number): void {
    if (this._emojiText) {
      this._emojiText.setOpacity(opacity);
    }
  }

  setPosition(x: number, y: number): void {
    if (this._emojiText) {
      this._emojiText.setPosition(x, y);
    }
  }

  getPosition(): PositionType | undefined {
    return this._emojiText?.getPosition();
  }

  getSize(): SizeType | undefined {
    // Measured once: the width and the height come from one text box.
    return this._emojiText?.measure();
  }

  addToGroup(group: Group): void {
    const emojiTextShape = this.getOrBuildEmojiTextShape();
    if (emojiTextShape && !ImageEmojiFeature.isLastChild(group, emojiTextShape)) {
      // Only remove if the element is already in the group
      this.removeFromGroup(group);
      group.append(emojiTextShape);
      // Move emoji text to front to ensure it appears above other elements
      emojiTextShape.moveToFront();
    }
  }

  /**
   * Whether the element is already the front (last) child of the group, which is where
   * addToGroup puts it: then there is nothing to move.
   */
  static isLastChild(group: Group, element: Text | Image): boolean {
    return group.isLastChild(element);
  }

  removeFromGroup(group: Group): void {
    if (this._emojiText) {
      // Check if the element is actually in the group before trying to remove it
      if (group.contains(this._emojiText)) {
        group.removeChild(this._emojiText);
      }
    }
  }

  // Create emoji icon for delete functionality
  private _createEmojiIcon(): Icon {
    const emojiTextShape = this._emojiText!;
    const topic = this._topic;

    return {
      getElement(): Group {
        return topic.get2DElement(); // Return the topic's main group
      },
      setGroup(): void {
        // Not needed for emoji
      },
      getGroup(): IconGroup | null {
        return null;
      },
      getSize(): SizeType | undefined {
        return emojiTextShape.measure();
      },
      getPosition(): PositionType {
        return emojiTextShape.getPosition();
      },
      addEvent(type: string, fnc: () => void): void {
        emojiTextShape.addEvent(type, fnc);
      },
      remove(): void {
        const actionDispatcher = topic.getActionDispatcher();
        actionDispatcher.changeImageEmojiCharToTopic([topic.getId()], undefined);
      },
      getModel(): FeatureModel {
        // Return a dummy model for compatibility
        return {} as FeatureModel;
      },
    };
  }

  setupDeleteWidget(): void {
    // The icon needs the emoji text: build it if the emoji was set since the last redraw
    if (!this._topic.isReadOnly() && this.getOrBuildEmojiTextShape()) {
      // The remove tip of the topic's designer
      this._emojiRemoveTip = ElementDeleteWidget.getInstance(this._topic.getDesigner());

      // Build the icon once per emoji text (it is rebuilt when the emoji is removed and
      // re-added), so decorate() recognizes it and doesn't add listeners on every redraw
      if (!this._emojiIcon || this._emojiIconText !== this._emojiText) {
        this._emojiIcon = this._createEmojiIcon();
        this._emojiIconText = this._emojiText;
      }
      this._emojiRemoveTip.decorate(
        this._topic.getId(),
        this._emojiIcon,
        this._topic.get2DElement(),
      );
    }
  }

  calculateEmojiDimensions(): { height: number; width: number } {
    const emojiTextShape = this.getOrBuildEmojiTextShape();
    if (!emojiTextShape) {
      return { height: 0, width: 0 };
    }

    const emojiFontSize = this._topic.getFontSize() * 3;
    const emojiHeight = emojiFontSize;
    const emojiWidth = emojiTextShape.getShapeWidth();

    return { height: emojiHeight, width: emojiWidth };
  }

  calculateTopicSizeAdjustments(
    currentWidth: number,
    currentHeight: number,
    textHeight: number,
    padding: number,
  ): { width: number; height: number } {
    if (!this.hasEmoji()) {
      return { width: currentWidth, height: currentHeight };
    }

    const { height: emojiHeight, width: emojiWidth } = this.calculateEmojiDimensions();

    // Adjust topic height to accommodate emoji
    const emojiPadding = 2;
    // Get spacing from theme configuration
    const theme = ThemeFactory.create(this._topic.getModel(), this._topic.getThemeVariant());
    const spacing = theme.getEmojiSpacing(this._topic);
    // Reduce bottom padding to bring text closer to bottom
    const bottomPadding = padding / 2; // Reduce bottom padding by half
    const newHeight = emojiPadding + emojiHeight + spacing + textHeight + padding + bottomPadding;

    // Adjust topic width if emoji is wider than current width
    const emojiRequiredWidth = emojiWidth + padding * 2;
    const newWidth = emojiRequiredWidth > currentWidth ? emojiRequiredWidth : currentWidth;

    return { width: newWidth, height: newHeight };
  }

  positionEmojiAndAdjustText(
    topicWidth: number,
    emojiHeight: number,
    textHeight: number,
    padding: number,
  ): { textY: number; iconY: number } {
    if (!this.hasEmoji()) {
      // Default positioning for shapes without emoji
      const yPosition = (this._topic.getSize().height - textHeight) / 2;
      return {
        textY: yPosition,
        iconY: yPosition - yPosition / 4,
      };
    }

    const emojiTextShape = this.getOrBuildEmojiTextShape();
    if (!emojiTextShape) {
      return { textY: 0, iconY: 0 };
    }

    // Center emoji horizontally in the middle of the topic for all topics
    const emojiX = (topicWidth - emojiTextShape.getShapeWidth()) / 2;

    // Position text and icons below the emoji, closer to bottom of shape
    // Get spacing from theme configuration
    const theme = ThemeFactory.create(this._topic.getModel(), this._topic.getThemeVariant());
    const spacing = theme.getEmojiSpacing(this._topic);
    const bottomOffset = padding / 2; // Reduce space between text and bottom of shape
    const textY = bottomOffset + emojiHeight + spacing; // Position text below emoji
    const emojiY = 1; // Keep emoji close to top of shape

    // Position emoji at top
    emojiTextShape.setPosition(emojiX, emojiY);

    // For line shapes, adjust text positioning to be more centered
    const shapeType = this._topic.getShapeType();
    const adjustedTextY = shapeType === 'line' ? textY + textHeight / 2 : textY;

    // Ensure text and icons are properly aligned vertically
    const iconHeight = this._topic.getOrBuildIconGroup().getSize().height;
    const iconY = adjustedTextY - (iconHeight - textHeight) / 2;

    return { textY: adjustedTextY, iconY };
  }
}

export default ImageEmojiFeature;
