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

import ScreenManager from './ScreenManager';
import Topic from './Topic';
import Designer from './Designer';
import ColorUtil from './theme/ColorUtil';
import type { ThemeVariant } from './theme/Theme';
import type { OrientationType } from './layout/LayoutType';

class HTMLTopicSelected {
  private _overlayContainer: HTMLDivElement;

  private _overlay: HTMLDivElement;

  private _helperContainer: HTMLDivElement | null;

  private _rightPlus: HTMLDivElement | null = null;

  private _bottomPlus: HTMLDivElement | null = null;

  private _screenManager: ScreenManager;

  private _containerElement: HTMLDivElement;

  private _isVisible: boolean;

  private _topic: Topic;

  private _designer: Designer | null;

  constructor(
    topic: Topic,
    containerElement: HTMLDivElement,
    screenManager: ScreenManager,
    designer?: Designer,
  ) {
    this._topic = topic;
    this._containerElement = containerElement;
    this._screenManager = screenManager;
    this._designer = designer || null;
    this._isVisible = false;
    this._helperContainer = null;

    // Create overlay container - insert it first so it's behind SVG
    this._overlayContainer = document.createElement('div');
    this._overlayContainer.style.position = 'absolute';
    this._overlayContainer.style.top = '0';
    this._overlayContainer.style.left = '0';
    this._overlayContainer.style.width = '100%';
    this._overlayContainer.style.height = '100%';
    // Keep pointerEvents none on container - buttons will be appended to main container instead
    this._overlayContainer.style.pointerEvents = 'none';
    this._overlayContainer.style.zIndex = '0';
    this._overlayContainer.style.overflow = 'visible';
    containerElement.insertBefore(this._overlayContainer, containerElement.firstChild);

    // Create overlay for the topic
    this._overlay = document.createElement('div');
    this._overlay.style.position = 'absolute';
    // Colors will be set by updateColors() method
    this._overlay.style.pointerEvents = 'none'; // Overlay itself doesn't capture clicks
    this._overlay.style.display = 'none'; // Hidden by default
    this._overlay.style.transition = 'none'; // No fade animation - remove instantly
    this._overlayContainer.appendChild(this._overlay);

    // Update colors based on variant
    this.updateColors();

    // Check and update shadow based on topic's selected state
    const updateShadowVisibility = () => {
      // Check if topic still exists before updating
      try {
        if (!this._topic || !this._topic.getModel()) {
          // Topic has been removed - hide overlay and return
          this.hide();
          return;
        }
      } catch (error) {
        // Topic may have been removed - hide overlay and return
        this.hide();
        return;
      }

      // Hide shadow if multiple topics are selected or if this topic is not selected
      try {
        if (!this._topic.isOnFocus()) {
          this.hide();
          return;
        }
      } catch (error) {
        // Topic may have been removed - hide overlay and return
        this.hide();
        return;
      }

      // Check if multiple topics are selected
      if (designer) {
        try {
          const selectedTopics = designer.getModel().filterSelectedTopics();
          if (selectedTopics.length > 1) {
            // Multiple topics selected - hide shadow
            this.hide();
            return;
          }
        } catch (error) {
          // Designer or model may have been removed - hide overlay and return
          this.hide();
          return;
        }
      }

      // Single topic selected and this is it - show shadow
      this.show();
    };

    // Listen to focus events to update shadow visibility
    topic.addEvent('ontfocus', () => {
      updateShadowVisibility();
    });

    // Listen to blur events to update shadow visibility
    topic.addEvent('ontblur', () => {
      updateShadowVisibility();
    });

    // Also listen to mousedown to ensure focus is set when clicking
    // (onObjectFocusEvent only deselects others, doesn't select the clicked topic)
    topic.addEvent('mousedown', () => {
      // Check if this topic is not already focused, then focus it
      if (!topic.isOnFocus()) {
        topic.setOnFocus(true);
        if (designer) {
          designer.onObjectFocusEvent(topic);
        }
      }
    });

    // Check initial state - if topic is already selected, show shadow
    updateShadowVisibility();
    // topic.addEvent('ontfocus', () => {
    //   if (!this._isVisible) {
    //     this.show();
    //   }
    // });
  }

  private isTopicOnLeftSide(): boolean {
    // Find central topic by walking up the parent chain
    let current: Topic | null = this._topic;
    while (current && !current.isCentralTopic()) {
      current = current.getParent();
    }

    // If we couldn't find central topic or this is the central topic, default to left
    if (!current || current === this._topic) {
      return true;
    }

    // Compare X coordinates - if topic is left of center, it's on the left side
    try {
      if (!this._topic || !this._topic.getModel()) {
        // Topic has been removed - default to left
        return true;
      }
      const topicPosition = this._topic.getPosition();
      const centralPosition = current.getPosition();
      return topicPosition.x < centralPosition.x;
    } catch (error) {
      // Topic may have been removed - default to left
      return true;
    }
  }

  /**
   * Convert hex color to rgba string
   * Supports both 3-digit (#RGB) and 6-digit (#RRGGBB) hex colors
   */
  private hexToRgba(hex: string, alpha: number): string {
    // Remove # if present
    let cleanedHex = hex.replace('#', '');

    // Handle 3-digit hex colors (e.g., #FFF -> #FFFFFF)
    if (cleanedHex.length === 3) {
      cleanedHex = cleanedHex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    // Parse RGB values
    const r = parseInt(cleanedHex.substring(0, 2), 16);
    const g = parseInt(cleanedHex.substring(2, 4), 16);
    const b = parseInt(cleanedHex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Update colors based on topic variant
   */
  private updateColors(): void {
    // Check if topic still exists before updating colors
    let variant: ThemeVariant;
    let connectionColor: string;
    try {
      if (!this._topic || !this._topic.getModel()) {
        // Topic has been removed - return without updating colors
        return;
      }
      variant = this._topic.getThemeVariant();
      connectionColor = this._topic.getConnectionColor(variant);
    } catch (error) {
      // Topic may have been removed - return without updating colors
      return;
    }

    // Border color: use connection color directly
    this._overlay.style.border = `2px solid ${connectionColor}`;

    // Background color: create a semi-transparent version based on variant
    let backgroundColor: string;
    if (variant === 'dark') {
      // For dark mode: lighten the connection color and use with low opacity for dark background
      const lightenedColor = ColorUtil.lightenColor(connectionColor, 30);
      backgroundColor = this.hexToRgba(lightenedColor, 0.25);
    } else {
      // For light mode: lighten the connection color significantly and use with higher opacity
      const lightenedColor = ColorUtil.lightenColor(connectionColor, 80);
      backgroundColor = this.hexToRgba(lightenedColor, 0.95);
    }
    this._overlay.style.backgroundColor = backgroundColor;

    // Plus button colors: use connection color, lightened for better contrast
    const plusButtonColor = ColorUtil.lightenColor(connectionColor, 40);
    if (this._rightPlus) {
      this._rightPlus.style.backgroundColor = plusButtonColor;
    }
    if (this._bottomPlus) {
      this._bottomPlus.style.backgroundColor = plusButtonColor;
    }
  }

  private updateOverlay(): void {
    // Check if topic still exists and is valid before updating
    let corners;
    try {
      if (!this._topic || !this._topic.getModel()) {
        // Topic has been removed - hide overlay and return
        if (this._overlay) {
          this._overlay.style.display = 'none';
        }
        return;
      }
      corners = this._topic.getAbsoluteCornerCoordinates();
      if (!corners) {
        if (this._overlay) {
          this._overlay.style.display = 'none';
        }
        return;
      }
    } catch (error) {
      // Topic may have been removed - hide overlay and return
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }
      return;
    }

    // Get orientation early - needed for helper text positioning and button behavior
    let orientation: OrientationType;
    let isVertical: boolean;
    let isOnLeft: boolean;
    try {
      orientation = this._topic.getOrientation();
      isVertical = orientation === 'vertical';
      isOnLeft = this.isTopicOnLeftSide();
    } catch (error) {
      // Topic may have been removed during operation - hide overlay and return
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }
      return;
    }

    // Update colors based on variant before showing overlay
    try {
      this.updateColors();
    } catch (error) {
      // Topic may have been removed during operation - hide overlay and return
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }
      return;
    }

    this._overlay.style.display = 'block';

    // Use ScreenManager's getContainerPosition for consistency
    const containerPosition = this._screenManager.getContainerPosition();

    // Calculate position relative to container
    const left = corners.topLeft.x - containerPosition.left;
    const top = corners.topLeft.y - containerPosition.top;
    const width = corners.topRight.x - corners.topLeft.x;
    const height = corners.bottomLeft.y - corners.topLeft.y;

    // Make overlay 5px bigger (2.5px on each side)
    const padding = 2.5;
    // Vertical offset to move shadow up
    const verticalOffset = 3; // Move shadow up by 3px
    // Horizontal offset to center the overlay properly on the topic
    // The bounding box might include visual offsets (like borders or outer shapes),
    // so we adjust to the left to better center on the visible topic shape
    const horizontalOffset = 2; // Shift overlay 2px to the left for better centering
    const overlayWidth = width + padding * 2;
    const overlayHeight = height + padding * 2;
    const overlayLeft = left - padding - horizontalOffset;
    const overlayTop = top - padding - verticalOffset;
    const overlayRight = overlayLeft + overlayWidth;

    // Calculate actual topic shape boundaries (for button positioning)
    // Topic shape: left, top, width, height (from corners)
    const topicLeft = left;
    const topicRight = left + width;
    const topicBottom = top + height;
    const topicCenterX = left + width / 2;
    const topicCenterY = top + height / 2;

    // Round to avoid sub-pixel rendering issues
    this._overlay.style.left = `${Math.round(overlayLeft)}px`;
    this._overlay.style.top = `${Math.round(overlayTop)}px`;
    this._overlay.style.width = `${Math.round(overlayWidth)}px`;
    this._overlay.style.height = `${Math.round(overlayHeight)}px`;

    // Apply border-radius to two opposite corners only
    const minDimension = Math.min(overlayWidth, overlayHeight);
    const borderRadiusValue = Math.max(15, minDimension * 0.2);
    const borderRadius = `${borderRadiusValue}px`;

    // Reset all corners
    this._overlay.style.borderTopLeftRadius = '0px';
    this._overlay.style.borderTopRightRadius = '0px';
    this._overlay.style.borderBottomLeftRadius = '0px';
    this._overlay.style.borderBottomRightRadius = '0px';

    // Apply rounded corners to top-left and bottom-right (opposite corners)
    this._overlay.style.borderTopLeftRadius = borderRadius;
    this._overlay.style.borderBottomRightRadius = borderRadius;

    // Update or create helper box
    // Both horizontal and vertical layouts use column direction (stacked vertically)
    const existingHelper = this._overlay.parentElement?.querySelector(
      '[style*="flex-direction: column"]',
    ) as HTMLDivElement;
    if (!existingHelper) {
      this.createHelperBox(
        overlayLeft,
        overlayTop,
        overlayWidth,
        overlayHeight,
        overlayRight,
        isOnLeft,
      );

      // Position plus buttons when creating helper box
      // Buttons should be equidistant from the actual topic shape (not the overlay)
      // Distance from topic shape edge to button center (left/right increased by 20% more: 15px * 1.2 = 18px)
      // Bottom button distance reduced by 20%: 8px * 0.8 = 6.4px, rounded to 6px
      const plusButtonDistanceLeftRight = 18; // Distance from topic shape edge to button center (for left/right buttons, increased by 20% more)
      const plusButtonDistanceBottom = 6; // Distance from topic shape edge to button center (for bottom button, reduced by 20%)

      if (this._rightPlus) {
        // Position button center at desired location, then use transform to center it
        if (isOnLeft) {
          // Topic is on left, button goes on left side of topic
          // Position button center 18px from topic left edge (increased by 20% more)
          this._rightPlus.style.left = `${Math.round(topicLeft - plusButtonDistanceLeftRight)}px`;
          this._rightPlus.style.right = 'auto';
        } else {
          // Topic is on right, button goes on right side of topic
          // Position button center 18px from topic right edge (increased by 20% more)
          this._rightPlus.style.left = `${Math.round(topicRight + plusButtonDistanceLeftRight)}px`;
          this._rightPlus.style.right = 'auto';
        }
        // Center button vertically at middle of topic (not overlay)
        this._rightPlus.style.top = `${Math.round(topicCenterY)}px`;
        // Use transform to center button horizontally and vertically, then scale to 0
        this._rightPlus.style.transform = 'translate(-50%, -50%) scale(0)';
      }
      if (this._bottomPlus) {
        // Bottom button: always in the middle, below the topic
        // Position button center at horizontal center of topic, 6px below topic bottom (reduced by 20%)
        this._bottomPlus.style.left = `${Math.round(topicCenterX)}px`;
        this._bottomPlus.style.top = `${Math.round(topicBottom + plusButtonDistanceBottom)}px`;
        // Use transform to center button horizontally
        this._bottomPlus.style.transform = 'translateX(-50%) scale(0)';
      }
    } else {
      // Update existing helper container position based on orientation
      // orientation and isVertical are already declared above

      if (isVertical) {
        // Vertical layout: position helper text at bottom, left-aligned, stacked vertically
        existingHelper.style.flexDirection = 'column';
        existingHelper.style.gap = '8px';
        existingHelper.style.alignItems = 'flex-start'; // Left-align items
        existingHelper.style.justifyContent = 'flex-start'; // Start from top
        // Position at bottom of topic, below the bottom "+" button, left-aligned with topic
        const plusButtonDistanceBottom = 6; // Distance from topic to bottom button
        const plusButtonRadius = 10; // Half of button width (20px / 2)
        const gapFromPlus = 13; // Gap from button to text
        const topicBottom = overlayTop + overlayHeight; // Bottom of overlay
        const bottomButtonBottom = topicBottom + plusButtonDistanceBottom + plusButtonRadius; // Bottom edge of button
        existingHelper.style.top = `${bottomButtonBottom + gapFromPlus}px`;
        existingHelper.style.left = `${overlayLeft}px`; // Left-align with topic
        existingHelper.style.transform = 'none'; // No transform - use left alignment
        existingHelper.style.right = 'auto';
      } else {
        // Horizontal layout: position on left or right side based on topic position
        existingHelper.style.flexDirection = 'column';
        existingHelper.style.gap = '8px';
        existingHelper.style.alignItems = isOnLeft ? 'flex-end' : 'flex-start';
        existingHelper.style.top = `${overlayTop}px`;
        existingHelper.style.transform = 'none';

        // Constants for positioning - button center is equidistant from overlay edges
        const plusButtonDistanceConst = 12; // Distance from overlay edge to "+" center
        const plusButtonRadius = 10; // Half of button width (20px / 2)
        const gapFromPlus = 13; // 13px distance from "+" button (3px + 10px additional)
        const textStartFromOverlayEdge = plusButtonDistanceConst + plusButtonRadius + gapFromPlus; // 12 + 10 + 13 = 35px

        if (isOnLeft) {
          // Helper text is on the left side - position 13px from left "+" button outer edge
          // "+" button center is at: overlayLeft - 12px
          // "+" button left edge is at: overlayLeft - 12px - 10px = overlayLeft - 22px
          // Text container RIGHT edge should be 13px to the left of button left edge
          // Since text is right-aligned (row-reverse), we position from right edge
          const containerPosition = this._screenManager.getContainerPosition();
          const containerRight =
            containerPosition.left + (this._containerElement?.clientWidth || 0);
          const buttonLeftEdge = overlayLeft - plusButtonDistanceConst - plusButtonRadius; // overlayLeft - 22px
          // Text right edge = button left edge - 13px gap
          const textRightEdge = buttonLeftEdge - gapFromPlus;
          existingHelper.style.right = `${containerRight - textRightEdge}px`;
          existingHelper.style.left = 'auto';
        } else {
          // Helper text is on the right side - position 13px from right "+" button outer edge
          // "+" button center is at: overlayRight + 12px
          // "+" button right edge is at: overlayRight + 12px + 10px = overlayRight + 22px
          // Text container's LEFT edge should be at: overlay right edge + 35px (to ensure no overlap)
          existingHelper.style.left = `${overlayRight + textStartFromOverlayEdge}px`;
          existingHelper.style.right = 'auto';
        }
      }

      // Check if topic has children
      let hasChildren: boolean;
      try {
        if (!this._topic || !this._topic.getModel()) {
          // Topic has been removed - hide overlay and return
          if (this._overlay) {
            this._overlay.style.display = 'none';
          }
          return;
        }
        hasChildren = this._topic.getChildren().length > 0;
      } catch (error) {
        // Topic may have been removed - hide overlay and return
        if (this._overlay) {
          this._overlay.style.display = 'none';
        }
        return;
      }

      // Update helper text container visibility based on whether topic has children
      existingHelper.style.display = hasChildren ? 'none' : 'flex';

      // Update text alignment for helper text elements based on orientation and side (only if visible)
      if (!hasChildren) {
        if (isVertical) {
          // Vertical layout: left-aligned, stacked vertically
          existingHelper.style.alignItems = 'flex-start'; // Left-align items
          existingHelper.style.justifyContent = 'flex-start'; // Start from top
          const helperElements = existingHelper.querySelectorAll('[style*="display: flex"]');
          helperElements.forEach((element) => {
            const helperElem = element as HTMLDivElement;
            // In vertical layout, text items are left-aligned and use normal row direction
            helperElem.style.justifyContent = 'flex-start';
            helperElem.style.flexDirection = 'row';
            helperElem.style.textAlign = 'left';
          });
        } else {
          // Horizontal layout: align text based on side
          existingHelper.style.alignItems = isOnLeft ? 'flex-end' : 'flex-start';
          const helperElements = existingHelper.querySelectorAll('[style*="display: flex"]');
          helperElements.forEach((element) => {
            const helperElem = element as HTMLDivElement;
            if (isOnLeft) {
              helperElem.style.justifyContent = 'flex-end';
              helperElem.style.flexDirection = 'row-reverse';
              helperElem.style.textAlign = 'right';
            } else {
              helperElem.style.justifyContent = 'flex-start';
              helperElem.style.flexDirection = 'row';
              helperElem.style.textAlign = 'left';
            }
          });
        }
      }

      // Calculate actual topic shape boundaries (for button positioning)
      // Topic shape: left, top, width, height (from corners)
      const topicLeft = left;
      const topicRight = left + width;
      const topicBottom = top + height;
      const topicCenterX = left + width / 2;
      const topicCenterY = top + height / 2;

      // Update plus buttons position and visibility
      // orientation and isVertical are already declared at the top of updateOverlay()
      // Right/Left button: positioned on the side opposite to where helper text is shown
      // Buttons should be equidistant from the actual topic shape (not the overlay)
      // Distance from topic shape edge to button center (left/right increased by 20% more: 15px * 1.2 = 18px)
      // Bottom button distance reduced by 20%: 8px * 0.8 = 6.4px, rounded to 6px
      const plusButtonDistanceBottom = 6; // Distance from topic shape edge to button center (for bottom button, reduced by 20%)
      const plusButtonDistanceLeftRight = 18; // Distance from topic shape edge to button center (for left/right buttons, increased by 20% more)

      if (this._rightPlus) {
        // Position button center at desired location, then use transform to center it
        if (isOnLeft) {
          // Topic is on left, button goes on left side of topic
          // Position button center 18px from topic left edge (increased by 20% more)
          this._rightPlus.style.left = `${Math.round(topicLeft - plusButtonDistanceLeftRight)}px`;
          this._rightPlus.style.right = 'auto';
        } else {
          // Topic is on right, button goes on right side of topic
          // Position button center 18px from topic right edge (increased by 20% more)
          this._rightPlus.style.left = `${Math.round(topicRight + plusButtonDistanceLeftRight)}px`;
          this._rightPlus.style.right = 'auto';
        }
        // Center button vertically at middle of topic (not overlay)
        this._rightPlus.style.top = `${Math.round(topicCenterY)}px`;
        // Use transform to center button horizontally and vertically
        this._rightPlus.style.transform = 'translate(-50%, -50%)';
        // Visibility: In horizontal layout, hide if has children (creates child)
        // In vertical layout, always show (creates sibling)
        this._rightPlus.style.display = isVertical || !hasChildren ? 'flex' : 'none';
        this._rightPlus.style.pointerEvents = isVertical || !hasChildren ? 'auto' : 'none';
      }
      if (this._bottomPlus) {
        // Bottom button: always in the middle, below the topic
        // Position button center at horizontal center of topic, 6px below topic bottom (reduced by 20%)
        this._bottomPlus.style.left = `${Math.round(topicCenterX)}px`;
        this._bottomPlus.style.top = `${Math.round(topicBottom + plusButtonDistanceBottom)}px`;
        // Use transform to center button horizontally
        this._bottomPlus.style.transform = 'translateX(-50%)';
        // Visibility: In horizontal layout, always show (creates sibling)
        // In vertical layout, hide if has children (creates child)
        this._bottomPlus.style.display = !isVertical || !hasChildren ? 'flex' : 'none';
        this._bottomPlus.style.pointerEvents = !isVertical || !hasChildren ? 'auto' : 'none';
      }
    }
  }

  private createHelperBox(
    left: number,
    top: number,
    width: number,
    height: number,
    right: number,
    isOnLeft: boolean,
  ): void {
    // Check if topic still exists before creating helper box
    let hasChildren: boolean;
    let orientation: OrientationType;
    let isVertical: boolean;
    try {
      if (!this._topic || !this._topic.getModel()) {
        // Topic has been removed - return without creating helper box
        return;
      }
      hasChildren = this._topic.getChildren().length > 0;
      orientation = this._topic.getOrientation();
      isVertical = orientation === 'vertical';
    } catch (error) {
      // Topic may have been removed - return without creating helper box
      return;
    }

    // Helper text container - position based on orientation
    // Horizontal: on left or right side, Vertical: at bottom
    const helperContainer = document.createElement('div');
    helperContainer.style.position = 'absolute';
    helperContainer.style.display = hasChildren ? 'none' : 'flex'; // Hide if topic has children
    helperContainer.style.pointerEvents = 'none';
    helperContainer.style.zIndex = '1000';
    helperContainer.style.transition = 'none'; // No fade animation - remove instantly

    if (isVertical) {
      // Vertical layout: position helper text at bottom, left-aligned, stacked vertically
      helperContainer.style.flexDirection = 'column'; // Vertical layout - Tab and Enter stacked
      helperContainer.style.gap = '8px';
      helperContainer.style.alignItems = 'flex-start'; // Left-align items
      helperContainer.style.justifyContent = 'flex-start'; // Start from top
      // Position at bottom of topic, below the bottom "+" button, left-aligned with topic
      const plusButtonDistanceBottom = 6; // Distance from topic to bottom button
      const plusButtonRadius = 10; // Half of button width (20px / 2)
      const gapFromPlus = 13; // Gap from button to text
      const bottomButtonBottom = top + height + plusButtonDistanceBottom + plusButtonRadius; // Bottom edge of button
      helperContainer.style.top = `${bottomButtonBottom + gapFromPlus}px`;
      helperContainer.style.left = `${left}px`; // Left-align with topic
      helperContainer.style.transform = 'none'; // No transform - use left alignment
      helperContainer.style.right = 'auto';
    } else {
      // Horizontal layout: position on left or right side based on topic position
      helperContainer.style.flexDirection = 'column';
      helperContainer.style.gap = '8px';
      helperContainer.style.alignItems = isOnLeft ? 'flex-end' : 'flex-start'; // Right-align items when on left, left-align when on right
      helperContainer.style.top = `${top}px`;

      // Position helper text: 13px distance from "+" button outer edge (3px base + 10px additional)
      // "+" button center is positioned 12px from overlay edge (equidistant on both sides)
      // "+" button is 20px wide (radius = 10px), so its outer edge is at 12px + 10px = 22px from overlay edge
      // We want 13px gap after the "+" button, so text starts at 22px + 13px = 35px from overlay edge
      const plusButtonDistance = 12; // Distance from overlay edge to "+" center (equal on both sides)
      const plusButtonRadius = 10; // Half of button width (20px / 2)
      const gapFromPlus = 13; // 13px distance from "+" button (3px + 10px additional)
      const textStartFromOverlayEdge = plusButtonDistance + plusButtonRadius + gapFromPlus; // 12 + 10 + 13 = 35px

      if (isOnLeft) {
        // Helper text is on the left side - position 13px from left "+" button outer edge
        // "+" button center is at: left - 12px
        // "+" button left edge is at: left - 12px - 10px = left - 22px
        // Text container RIGHT edge should be 13px to the left of button left edge
        // Since text is right-aligned (row-reverse), we position from right edge
        const containerPosition = this._screenManager.getContainerPosition();
        const containerRight = containerPosition.left + (this._containerElement?.clientWidth || 0);
        const buttonLeftEdge = left - plusButtonDistance - plusButtonRadius; // left - 22px
        // Text right edge = button left edge - 13px gap
        const textRightEdge = buttonLeftEdge - gapFromPlus;
        helperContainer.style.right = `${containerRight - textRightEdge}px`;
        helperContainer.style.left = 'auto';
        helperContainer.style.transform = 'none';
      } else {
        // Helper text is on the right side - position 13px from right "+" button outer edge
        // "+" button center is at: right + 12px
        // "+" button right edge is at: right + 12px + 10px = right + 22px
        // Text container's LEFT edge should be at: overlay right edge + 35px (to ensure no overlap)
        // Using left positioning ensures the entire text container is to the right of the topic
        helperContainer.style.left = `${right + textStartFromOverlayEdge}px`;
        helperContainer.style.right = 'auto';
        helperContainer.style.transform = 'none';
      }
    }

    // Only create helper text if topic has no children
    if (!hasChildren) {
      // Tab to create child
      const tabHelper = document.createElement('div');
      tabHelper.style.display = 'flex';
      tabHelper.style.alignItems = 'center';
      tabHelper.style.gap = '8px';

      if (isVertical) {
        // Vertical layout: center-aligned, normal row direction
        tabHelper.style.justifyContent = 'flex-start';
        tabHelper.style.flexDirection = 'row';
        tabHelper.style.textAlign = 'left';
      } else {
        // Horizontal layout: align text based on side: right-aligned when on left, left-aligned when on right
        if (isOnLeft) {
          tabHelper.style.justifyContent = 'flex-end';
          tabHelper.style.flexDirection = 'row-reverse';
          tabHelper.style.textAlign = 'right';
        } else {
          tabHelper.style.justifyContent = 'flex-start';
          tabHelper.style.flexDirection = 'row';
          tabHelper.style.textAlign = 'left';
        }
      }

      const tabKey = document.createElement('div');
      tabKey.textContent = 'Tab';
      tabKey.style.padding = '4px 8px';
      tabKey.style.backgroundColor = '#f5f5f5';
      tabKey.style.border = '1px solid #ddd';
      tabKey.style.borderRadius = '4px';
      tabKey.style.fontSize = '12px';
      tabKey.style.fontFamily = 'Arial, sans-serif';
      tabKey.style.color = '#333';
      tabKey.style.display = 'flex';
      tabKey.style.alignItems = 'center';
      tabKey.style.justifyContent = 'center';
      tabKey.style.lineHeight = '1';

      const tabText = document.createElement('span');
      tabText.textContent = 'to create child';
      tabText.style.fontSize = '14px';
      tabText.style.fontFamily = 'Arial, sans-serif';
      tabText.style.color = '#666';
      tabText.style.display = 'flex';
      tabText.style.alignItems = 'center';
      tabText.style.lineHeight = '1';

      tabHelper.appendChild(tabKey);
      tabHelper.appendChild(tabText);
      helperContainer.appendChild(tabHelper);

      // Enter to create sibling
      const enterHelper = document.createElement('div');
      enterHelper.style.display = 'flex';
      enterHelper.style.alignItems = 'center';
      enterHelper.style.gap = '8px';

      if (isVertical) {
        // Vertical layout: center-aligned, normal row direction
        enterHelper.style.justifyContent = 'flex-start';
        enterHelper.style.flexDirection = 'row';
        enterHelper.style.textAlign = 'left';
      } else {
        // Horizontal layout: align text based on side: right-aligned when on left, left-aligned when on right
        if (isOnLeft) {
          enterHelper.style.justifyContent = 'flex-end';
          enterHelper.style.flexDirection = 'row-reverse';
          enterHelper.style.textAlign = 'right';
        } else {
          enterHelper.style.justifyContent = 'flex-start';
          enterHelper.style.flexDirection = 'row';
          enterHelper.style.textAlign = 'left';
        }
      }

      const enterKey = document.createElement('div');
      enterKey.textContent = 'Enter';
      enterKey.style.padding = '4px 8px';
      enterKey.style.backgroundColor = '#f5f5f5';
      enterKey.style.border = '1px solid #ddd';
      enterKey.style.borderRadius = '4px';
      enterKey.style.fontSize = '12px';
      enterKey.style.fontFamily = 'Arial, sans-serif';
      enterKey.style.color = '#333';
      enterKey.style.display = 'flex';
      enterKey.style.alignItems = 'center';
      enterKey.style.justifyContent = 'center';
      enterKey.style.lineHeight = '1';

      const enterText = document.createElement('span');
      enterText.textContent = 'to create sibling';
      enterText.style.fontSize = '14px';
      enterText.style.fontFamily = 'Arial, sans-serif';
      enterText.style.color = '#666';
      enterText.style.display = 'flex';
      enterText.style.alignItems = 'center';
      enterText.style.lineHeight = '1';

      enterHelper.appendChild(enterKey);
      enterHelper.appendChild(enterText);
      helperContainer.appendChild(enterHelper);
    }

    // Orientation and isVertical are already declared at the start of createHelperBox
    // Plus icon at middle right of overlay (use existing hasChildren variable)
    // 20px circle with larger 18px "+" symbol for better visibility
    // Append to overlay container instead of overlay so clicks work
    // Position will be set in updateOverlay() or createHelperBox() to use correct overlay dimensions
    this._rightPlus = document.createElement('div');
    this._rightPlus.textContent = '+';
    this._rightPlus.style.position = 'absolute';
    // Initial position - will be updated in updateOverlay()
    this._rightPlus.style.left = '0px';
    this._rightPlus.style.top = '0px';
    this._rightPlus.style.width = '20px';
    this._rightPlus.style.height = '20px';
    this._rightPlus.style.borderRadius = '50%';
    // Color will be set by updateColors() method
    this._rightPlus.style.color = 'white';
    this._rightPlus.style.display = 'flex';
    this._rightPlus.style.alignItems = 'center';
    this._rightPlus.style.justifyContent = 'center';
    this._rightPlus.style.fontSize = '16px';
    this._rightPlus.style.fontWeight = 'bold';
    this._rightPlus.style.lineHeight = '1';
    this._rightPlus.style.padding = '0';
    this._rightPlus.style.margin = '0';
    this._rightPlus.style.boxSizing = 'border-box';
    this._rightPlus.style.textAlign = 'center';
    this._rightPlus.style.pointerEvents = 'auto'; // Make clickable
    this._rightPlus.style.cursor = 'pointer';
    this._rightPlus.style.zIndex = '1001';
    // Transform will be set based on position (left or right) in updateOverlay()
    this._rightPlus.style.transformOrigin = 'center center';
    this._rightPlus.style.opacity = '0';
    this._rightPlus.style.fontSize = '0px';
    this._rightPlus.style.transition =
      'opacity 0.5s ease, transform 0.5s ease, font-size 0.5s ease';
    // Visibility: In horizontal layout, hide if has children (creates child)
    // In vertical layout, always show (creates sibling)
    this._rightPlus.style.display = isVertical || !hasChildren ? 'flex' : 'none';
    // Disable pointer events when hidden to allow clicks through to topic
    this._rightPlus.style.pointerEvents = isVertical || !hasChildren ? 'auto' : 'none';

    // Add click handler - behavior depends on orientation
    // Horizontal: creates child, Vertical: creates sibling
    this._rightPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isVertical) {
        this._createSibling();
      } else {
        this._createChild();
      }
    });

    // Append to main container so clicks work (container has pointerEvents: auto)
    this._containerElement.appendChild(this._rightPlus);

    // Plus icon at bottom middle of overlay
    // 20px circle with larger 18px "+" symbol for better visibility
    // Append to overlay container instead of overlay so clicks work
    // Position will be set in updateOverlay() or createHelperBox() to use correct overlay dimensions
    this._bottomPlus = document.createElement('div');
    this._bottomPlus.textContent = '+';
    this._bottomPlus.style.position = 'absolute';
    // Initial position - will be updated in updateOverlay()
    this._bottomPlus.style.left = '0px';
    this._bottomPlus.style.top = '0px';
    this._bottomPlus.style.width = '20px';
    this._bottomPlus.style.height = '20px';
    this._bottomPlus.style.borderRadius = '50%';
    // Color will be set by updateColors() method
    this._bottomPlus.style.color = 'white';
    this._bottomPlus.style.display = 'flex';
    this._bottomPlus.style.alignItems = 'center';
    this._bottomPlus.style.justifyContent = 'center';
    this._bottomPlus.style.fontSize = '16px';
    this._bottomPlus.style.fontWeight = 'bold';
    this._bottomPlus.style.lineHeight = '1';
    this._bottomPlus.style.padding = '0';
    this._bottomPlus.style.margin = '0';
    this._bottomPlus.style.boxSizing = 'border-box';
    this._bottomPlus.style.textAlign = 'center';
    this._bottomPlus.style.pointerEvents = 'auto'; // Make clickable
    this._bottomPlus.style.cursor = 'pointer';
    this._bottomPlus.style.zIndex = '1001';
    this._bottomPlus.style.transform = 'translateX(-50%) scale(0)';
    this._bottomPlus.style.transformOrigin = 'center center';
    this._bottomPlus.style.opacity = '0';
    this._bottomPlus.style.fontSize = '0px';
    this._bottomPlus.style.transition =
      'opacity 0.5s ease, transform 0.5s ease, font-size 0.5s ease';
    // Visibility: In horizontal layout, always show (creates sibling)
    // In vertical layout, hide if has children (creates child)
    this._bottomPlus.style.display = !isVertical || !hasChildren ? 'flex' : 'none';
    this._bottomPlus.style.pointerEvents = !isVertical || !hasChildren ? 'auto' : 'none';

    // Add click handler - behavior depends on orientation
    // Horizontal: creates sibling, Vertical: creates child
    this._bottomPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isVertical) {
        this._createChild();
      } else {
        this._createSibling();
      }
    });

    // Append to main container so clicks work (container has pointerEvents: auto)
    this._containerElement.appendChild(this._bottomPlus);

    // Update colors after creating plus buttons
    this.updateColors();

    // Trigger animation after a small delay to ensure styles are applied
    if (this._rightPlus && this._bottomPlus) {
      setTimeout(() => {
        // Check if elements still exist before updating (topic may have been deleted)
        // Right plus button (creates child) - only animate if visible (no children)
        if (this._rightPlus && this._rightPlus.parentElement && !hasChildren) {
          this._rightPlus.style.opacity = '1';
          this._rightPlus.style.transform = 'translate(-50%, -50%) scale(1)';
          this._rightPlus.style.fontSize = '16px';
        }
        // Bottom plus button (creates sibling) - always animate if element exists
        if (this._bottomPlus && this._bottomPlus.parentElement) {
          this._bottomPlus.style.opacity = '1';
          this._bottomPlus.style.transform = 'translateX(-50%) scale(1)';
          this._bottomPlus.style.fontSize = '16px';
        }
      }, 10);
    }

    // Append helper container to overlay container
    this._overlayContainer.appendChild(helperContainer);
    this._helperContainer = helperContainer;
  }

  toggle(): void {
    // Check if topic still exists before toggling
    try {
      if (!this._topic || !this._topic.getModel()) {
        // Topic has been removed - hide overlay and return
        if (this._overlay) {
          this._overlay.style.display = 'none';
        }
        return;
      }
    } catch (error) {
      // Topic may have been removed - hide overlay and return
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }
      return;
    }

    this._isVisible = !this._isVisible;

    if (this._isVisible) {
      this._overlay.style.display = 'block';
      this.updateOverlay();
      if (this._helperContainer) {
        this._helperContainer.style.display = 'flex';
      }

      // Get orientation to determine button behavior
      let orientation: OrientationType;
      let isVertical: boolean;
      let hasChildren: boolean;
      try {
        orientation = this._topic.getOrientation();
        isVertical = orientation === 'vertical';
        hasChildren = this._topic.getChildren().length > 0;
      } catch (error) {
        // Topic may have been removed during operation - hide overlay and return
        if (this._overlay) {
          this._overlay.style.display = 'none';
        }
        return;
      }

      // Trigger animation for plus icons
      if (this._rightPlus) {
        // Visibility: In horizontal layout, hide if has children (creates child)
        // In vertical layout, always show (creates sibling)
        const shouldShowRight = isVertical || !hasChildren;
        if (shouldShowRight) {
          // Show right button
          this._rightPlus.style.display = 'flex';
          this._rightPlus.style.pointerEvents = 'auto';
          this._rightPlus.style.opacity = '0';
          // Use translate(-50%, -50%) to center both horizontally and vertically
          this._rightPlus.style.transform = 'translate(-50%, -50%) scale(0)';
          this._rightPlus.style.fontSize = '0px';
          setTimeout(() => {
            // Check if element still exists before updating (topic may have been deleted)
            if (this._rightPlus && this._rightPlus.parentElement) {
              this._rightPlus.style.opacity = '1';
              this._rightPlus.style.transform = 'translate(-50%, -50%) scale(1)';
              this._rightPlus.style.fontSize = '16px';
            }
          }, 10);
        } else {
          // Hide right button if topic already has children (horizontal layout only)
          this._rightPlus.style.display = 'none';
          this._rightPlus.style.pointerEvents = 'none';
        }
      }
      if (this._bottomPlus) {
        // Visibility: In horizontal layout, always show (creates sibling)
        // In vertical layout, hide if has children (creates child)
        const shouldShowBottom = !isVertical || !hasChildren;
        if (shouldShowBottom) {
          // Show bottom button
          this._bottomPlus.style.display = 'flex';
          this._bottomPlus.style.pointerEvents = 'auto';
          this._bottomPlus.style.opacity = '0';
          this._bottomPlus.style.transform = 'translateX(-50%) scale(0)';
          this._bottomPlus.style.fontSize = '0px';
          setTimeout(() => {
            // Check if element still exists before updating (topic may have been deleted)
            if (this._bottomPlus && this._bottomPlus.parentElement) {
              this._bottomPlus.style.opacity = '1';
              this._bottomPlus.style.transform = 'translateX(-50%) scale(1)';
              this._bottomPlus.style.fontSize = '16px';
            }
          }, 10);
        } else {
          // Hide bottom button if topic already has children (vertical layout only)
          this._bottomPlus.style.display = 'none';
          this._bottomPlus.style.pointerEvents = 'none';
        }
      }
    } else {
      // Hide all elements in the same lifecycle
      this._overlay.style.display = 'none';

      if (this._helperContainer) {
        this._helperContainer.style.display = 'none';
      }

      // Hide and reset plus icons for next animation
      if (this._rightPlus) {
        this._rightPlus.style.display = 'none'; // Hide completely
        this._rightPlus.style.opacity = '0';
        this._rightPlus.style.transform = 'translate(-50%, -50%) scale(0)';
        this._rightPlus.style.fontSize = '0px';
        this._rightPlus.style.pointerEvents = 'none'; // Disable when hidden
      }
      if (this._bottomPlus) {
        this._bottomPlus.style.display = 'none'; // Hide completely
        this._bottomPlus.style.opacity = '0';
        this._bottomPlus.style.transform = 'translateX(-50%) scale(0)';
        this._bottomPlus.style.fontSize = '0px';
        this._bottomPlus.style.pointerEvents = 'none'; // Disable when hidden
      }
    }
  }

  update(): void {
    // Check topic's selected state and update visibility accordingly
    // Hide if multiple topics are selected
    if (!this._topic.isOnFocus()) {
      if (this._isVisible) {
        this.hide();
      }
      return;
    }

    // Check if multiple topics are selected
    if (this._designer) {
      const selectedTopics = this._designer.getModel().filterSelectedTopics();
      if (selectedTopics.length > 1) {
        // Multiple topics selected - hide shadow
        if (this._isVisible) {
          this.hide();
        }
        return;
      }
    }

    // Single topic selected and this is it - show shadow
    if (!this._isVisible) {
      this.show();
    }
    this.updateOverlay();
  }

  show(): void {
    // Check if topic still exists before showing
    try {
      if (!this._topic || !this._topic.getModel()) {
        // Topic has been removed - hide overlay and return
        if (this._overlay) {
          this._overlay.style.display = 'none';
        }
        return;
      }
    } catch (error) {
      // Topic may have been removed - hide overlay and return
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }
      return;
    }

    if (!this._isVisible) {
      this.toggle();
    }
  }

  hide(): void {
    if (this._isVisible) {
      this.toggle();
    }
  }

  private _createSibling(): void {
    // Get Designer instance (either passed or from globalThis)
    const designer = this._designer || (globalThis as { designer?: Designer }).designer;
    if (!designer) {
      console.warn('Designer instance not available for creating sibling');
      return;
    }

    // Ensure this topic is selected (same behavior as keyboard shortcuts)
    // The shadow is only shown when topic is focused, but we ensure it's selected
    // to match keyboard behavior exactly
    const selectedTopics = designer.getModel().filterSelectedTopics();
    if (selectedTopics.length === 0 || selectedTopics[0] !== this._topic) {
      // Select this topic if it's not already selected
      designer.onObjectFocusEvent(this._topic);
      this._topic.setOnFocus(true);
    }

    // Create sibling (same as Enter key) - used by bottom button
    designer.createSiblingForSelectedNode();
  }

  private _createChild(): void {
    // Get Designer instance (either passed or from globalThis)
    const designer = this._designer || (globalThis as { designer?: Designer }).designer;
    if (!designer) {
      console.warn('Designer instance not available for creating child');
      return;
    }

    // Ensure this topic is selected (same behavior as keyboard shortcuts)
    // The shadow is only shown when topic is focused, but we ensure it's selected
    // to match keyboard behavior exactly
    const selectedTopics = designer.getModel().filterSelectedTopics();
    if (selectedTopics.length === 0 || selectedTopics[0] !== this._topic) {
      // Select this topic if it's not already selected
      designer.onObjectFocusEvent(this._topic);
      this._topic.setOnFocus(true);
    }

    // Create child (same as Tab key)
    designer.createChildForSelectedNode();
  }

  dispose(): void {
    // Remove all elements in the same lifecycle
    if (this._overlayContainer && this._overlayContainer.parentElement) {
      this._overlayContainer.parentElement.removeChild(this._overlayContainer);
    }

    // Remove plus buttons from main container
    if (this._rightPlus && this._rightPlus.parentElement) {
      this._rightPlus.parentElement.removeChild(this._rightPlus);
    }

    if (this._bottomPlus && this._bottomPlus.parentElement) {
      this._bottomPlus.parentElement.removeChild(this._bottomPlus);
    }

    // Clear references
    this._rightPlus = null;
    this._bottomPlus = null;
    this._helperContainer = null;
  }
}

export default HTMLTopicSelected;
