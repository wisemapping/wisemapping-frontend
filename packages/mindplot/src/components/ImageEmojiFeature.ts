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
import { $assert } from './util/assert';
import ElementDeleteWidget from './ElementDeleteWidget';
import ActionDispatcher from './ActionDispatcher';
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

  constructor(topic: Topic) {
    $assert(topic, 'topic can not be null');
    this._topic = topic;
    this._emojiText = undefined;
    this._emojiRemoveTip = undefined;
  }

  getEmojiChar(): string | undefined {
    const model = this._topic.getModel();
    return model.getImageEmojiChar();
  }

  setEmojiChar(emojiChar: string | undefined): void {
    const model = this._topic.getModel();
    model.setImageEmojiChar(emojiChar);

    // If removing emoji, properly clean up the visual elements
    if (!emojiChar && this._emojiText) {
      // Remove emoji text from DOM
      const group = this._topic.get2DElement();
      group.removeChild(this._emojiText);
      this._emojiText = undefined;
    } else {
      this._emojiText = undefined; // Clear to force rebuild
    }

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
      emojiText.setStyle(this._topic.getFontStyle());
      emojiText.setText(emojiChar);

      this._emojiText = emojiText;
    } else if (!emojiChar && this._emojiText) {
      // Remove emoji text if no emoji character
      this._emojiText = undefined;
    } else if (emojiChar && this._emojiText) {
      // Update emoji text if emoji character changed
      this._emojiText.setText(emojiChar);
      // Always update font size and style to reflect current font changes
      this._emojiText.setFontSize(this._topic.getFontSize() * 3);
      this._emojiText.setStyle(this._topic.getFontStyle());
    }
    return this._emojiText;
  }

  hasEmoji(): boolean {
    return this.getOrBuildEmojiTextShape() !== undefined;
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
    if (this._emojiText) {
      return {
        width: this._emojiText.getShapeWidth(),
        height: this._emojiText.getShapeHeight(),
      };
    }
    return undefined;
  }

  addToGroup(group: Group): void {
    const emojiTextShape = this.getOrBuildEmojiTextShape();
    if (emojiTextShape) {
      // Only remove if the element is already in the group
      this.removeFromGroup(group);
      group.append(emojiTextShape);
      // Move emoji text to front to ensure it appears above other elements
      emojiTextShape.moveToFront();
    }
  }

  removeFromGroup(group: Group): void {
    if (this._emojiText) {
      // Check if the element is actually in the group before trying to remove it
      const children = group.peer.getChildren();
      const isInGroup = children.includes(this._emojiText.peer);

      if (isInGroup) {
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
        return {
          width: emojiTextShape.getShapeWidth(),
          height: emojiTextShape.getShapeHeight(),
        };
      },
      getPosition(): PositionType {
        return emojiTextShape.getPosition();
      },
      addEvent(type: string, fnc: () => void): void {
        emojiTextShape.addEvent(type, fnc);
      },
      remove(): void {
        const actionDispatcher = ActionDispatcher.getInstance();
        actionDispatcher.changeImageEmojiCharToTopic([topic.getId()], undefined);
      },
      getModel(): FeatureModel {
        // Return a dummy model for compatibility
        return {} as FeatureModel;
      },
    };
  }

  setupDeleteWidget(): void {
    if (!this._topic.isReadOnly() && this.hasEmoji()) {
      // Get singleton instance of remove tip
      this._emojiRemoveTip = ElementDeleteWidget.getInstance();

      // Always create and decorate emoji icon (in case it was removed and re-added)
      const emojiIcon = this._createEmojiIcon();
      this._emojiRemoveTip.decorate(this._topic.getId(), emojiIcon, this._topic.get2DElement());
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
