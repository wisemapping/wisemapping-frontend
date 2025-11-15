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

type HelperElements = {
  container: HTMLDivElement;
  tabRow: HTMLDivElement;
  tabKey: HTMLDivElement;
  tabText: HTMLSpanElement;
  enterRow: HTMLDivElement;
  enterKey: HTMLDivElement;
  enterText: HTMLSpanElement;
};

type OverlayGeometry = {
  overlayLeft: number;
  overlayTop: number;
  overlayWidth: number;
  overlayHeight: number;
  overlayRight: number;
  topicLeft: number;
  topicRight: number;
  topicBottom: number;
  topicCenterX: number;
  topicCenterY: number;
  orientation: OrientationType;
  isVertical: boolean;
  isOnLeft: boolean;
};

class HTMLTopicSelected {
  private _overlayContainer: HTMLDivElement;

  private _overlay: HTMLDivElement;

  private _helperContainer: HTMLDivElement | null;

  private _helperElements: HelperElements | null = null;

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
  private updateColors(): boolean {
    const topicColors = this.withTopic((topic) => {
      const variant = topic.getThemeVariant();
      const connectionColor = topic.getConnectionColor(variant);
      return { variant, connectionColor };
    });
    if (!topicColors) {
      return false;
    }

    const { variant, connectionColor } = topicColors;
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

    // Update helper text colors based on variant
    this.updateHelperTextColors(variant);
    return true;
  }

  /**
   * Update helper text colors based on theme variant
   */
  private updateHelperTextColors(variant: ThemeVariant): void {
    if (!this._helperContainer) {
      return;
    }

    if (!this._helperElements) {
      return;
    }

    const { tabKey, tabText, enterKey, enterText } = this._helperElements;
    const applyColors = (
      key: HTMLDivElement,
      text: HTMLSpanElement,
      keyStyles: { backgroundColor: string; borderColor: string; color: string },
      textColor: string,
    ) => {
      key.style.backgroundColor = keyStyles.backgroundColor;
      key.style.borderColor = keyStyles.borderColor;
      key.style.color = keyStyles.color;
      text.style.color = textColor;
    };

    if (variant === 'dark') {
      applyColors(
        tabKey,
        tabText,
        { backgroundColor: '#3a3a3a', borderColor: '#555', color: '#e0e0e0' },
        '#b0b0b0',
      );
      applyColors(
        enterKey,
        enterText,
        { backgroundColor: '#3a3a3a', borderColor: '#555', color: '#e0e0e0' },
        '#b0b0b0',
      );
    } else {
      applyColors(
        tabKey,
        tabText,
        { backgroundColor: '#f5f5f5', borderColor: '#ddd', color: '#333' },
        '#666',
      );
      applyColors(
        enterKey,
        enterText,
        { backgroundColor: '#f5f5f5', borderColor: '#ddd', color: '#333' },
        '#666',
      );
    }
  }

  private computeOverlayGeometry(topic: Topic): OverlayGeometry | null {
    const corners = topic.getAbsoluteCornerCoordinates();
    if (!corners) {
      return null;
    }

    const orientation = topic.getOrientation();
    const isVertical = orientation === 'vertical';
    const isOnLeft = this.isTopicOnLeftSide();

    // Use ScreenManager's getContainerPosition for consistency
    const containerPosition = this._screenManager.getContainerPosition();

    // Calculate position relative to container
    const left = corners.topLeft.x - containerPosition.left;
    const top = corners.topLeft.y - containerPosition.top;
    const width = corners.topRight.x - corners.topLeft.x;
    const height = corners.bottomLeft.y - corners.topLeft.y;

    // Make overlay 5px bigger (2.5px on each side)
    const padding = 2.5;
    const verticalOffset = 3;
    const horizontalOffset = 2;
    const overlayWidth = width + padding * 2;
    const overlayHeight = height + padding * 2;
    const overlayLeft = left - padding - horizontalOffset;
    const overlayTop = top - padding - verticalOffset;

    return {
      overlayLeft,
      overlayTop,
      overlayWidth,
      overlayHeight,
      overlayRight: overlayLeft + overlayWidth,
      topicLeft: left,
      topicRight: left + width,
      topicBottom: top + height,
      topicCenterX: left + width / 2,
      topicCenterY: top + height / 2,
      orientation,
      isVertical,
      isOnLeft,
    };
  }

  private updateOverlay(): void {
    const geometry = this.withTopic((topic) => this.computeOverlayGeometry(topic));
    if (!geometry) {
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }
      return;
    }

    const hasChildren = this.withTopic((topic) => topic.getChildren().length > 0) ?? false;

    const colorsUpdated = this.updateColors();
    if (colorsUpdated === false) {
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }
      return;
    }

    this._overlay.style.display = 'block';
    this.applyOverlayFrame(geometry);
    this.updateHelperBox(geometry, hasChildren);
    this.ensurePlusButtons();
    this.updatePlusButtons(geometry, hasChildren);
  }

  private applyOverlayFrame({
    overlayLeft,
    overlayTop,
    overlayWidth,
    overlayHeight,
  }: OverlayGeometry): void {
    this._overlay.style.left = `${Math.round(overlayLeft)}px`;
    this._overlay.style.top = `${Math.round(overlayTop)}px`;
    this._overlay.style.width = `${Math.round(overlayWidth)}px`;
    this._overlay.style.height = `${Math.round(overlayHeight)}px`;

    const minDimension = Math.min(overlayWidth, overlayHeight);
    const borderRadiusValue = Math.max(15, minDimension * 0.2);
    const borderRadius = `${borderRadiusValue}px`;

    this._overlay.style.borderTopLeftRadius = '0px';
    this._overlay.style.borderTopRightRadius = '0px';
    this._overlay.style.borderBottomLeftRadius = '0px';
    this._overlay.style.borderBottomRightRadius = '0px';

    this._overlay.style.borderTopLeftRadius = borderRadius;
    this._overlay.style.borderBottomRightRadius = borderRadius;
  }

  private ensureHelperElements(): HelperElements | null {
    if (this._helperElements) {
      return this._helperElements;
    }

    if (!this._overlayContainer) {
      return null;
    }

    const helperContainer = document.createElement('div');
    helperContainer.style.position = 'absolute';
    helperContainer.style.pointerEvents = 'none';
    helperContainer.style.zIndex = '1000';
    helperContainer.style.transition = 'none';
    helperContainer.style.display = 'flex';
    helperContainer.style.flexDirection = 'column';
    helperContainer.style.gap = '8px';
    helperContainer.style.alignItems = 'flex-start';
    helperContainer.style.justifyContent = 'flex-start';

    const createHelperRow = () => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '8px';
      row.style.justifyContent = 'flex-start';
      row.style.flexDirection = 'row';
      row.style.textAlign = 'left';
      return row;
    };

    const createKey = (label: string) => {
      const key = document.createElement('div');
      key.textContent = label;
      key.style.padding = '4px 8px';
      key.style.border = '1px solid';
      key.style.borderRadius = '4px';
      key.style.fontSize = '12px';
      key.style.fontFamily = 'Arial, sans-serif';
      key.style.display = 'flex';
      key.style.alignItems = 'center';
      key.style.justifyContent = 'center';
      key.style.lineHeight = '1';
      return key;
    };

    const createText = (textContent: string) => {
      const text = document.createElement('span');
      text.textContent = textContent;
      text.style.fontSize = '14px';
      text.style.fontFamily = 'Arial, sans-serif';
      text.style.display = 'flex';
      text.style.alignItems = 'center';
      text.style.lineHeight = '1';
      return text;
    };

    const tabRow = createHelperRow();
    const tabKey = createKey('Tab');
    const tabText = createText('to create child');
    tabRow.appendChild(tabKey);
    tabRow.appendChild(tabText);

    const enterRow = createHelperRow();
    const enterKey = createKey('Enter');
    const enterText = createText('to create sibling');
    enterRow.appendChild(enterKey);
    enterRow.appendChild(enterText);

    helperContainer.appendChild(tabRow);
    helperContainer.appendChild(enterRow);
    this._overlayContainer.appendChild(helperContainer);

    this._helperContainer = helperContainer;
    this._helperElements = {
      container: helperContainer,
      tabRow,
      tabKey,
      tabText,
      enterRow,
      enterKey,
      enterText,
    };

    const variant = this.withTopic((topic) => topic.getThemeVariant());
    if (variant) {
      this.updateHelperTextColors(variant);
    }

    return this._helperElements;
  }

  private setHelperRowLayout(
    row: HTMLDivElement,
    direction: 'row' | 'row-reverse',
    justify: 'flex-start' | 'flex-end',
    textAlign: 'left' | 'right',
  ): void {
    row.style.flexDirection = direction;
    row.style.justifyContent = justify;
    row.style.textAlign = textAlign;
  }

  private updateHelperBox(geometry: OverlayGeometry, hasChildren: boolean): void {
    const helper = this.ensureHelperElements();
    if (!helper) {
      return;
    }

    const { container, tabRow, enterRow } = helper;
    container.style.display = hasChildren ? 'none' : 'flex';

    if (hasChildren) {
      return;
    }

    const plusButtonRadius = 10;
    const plusButtonDistanceBottom = 6;
    const plusButtonDistanceLeftRight = 18;
    const helperHorizontalGap = 20;
    const helperVerticalGap = 20;

    if (geometry.isVertical) {
      container.style.flexDirection = 'column';
      container.style.alignItems = 'flex-start';
      container.style.justifyContent = 'flex-start';
      const topicBottom = geometry.overlayTop + geometry.overlayHeight;
      const bottomButtonBottom = topicBottom + plusButtonDistanceBottom + plusButtonRadius;
      container.style.top = `${bottomButtonBottom + helperVerticalGap}px`;
      container.style.left = `${geometry.overlayLeft}px`;
      container.style.right = 'auto';
      container.style.transform = 'none';
      this.setHelperRowLayout(tabRow, 'row', 'flex-start', 'left');
      this.setHelperRowLayout(enterRow, 'row', 'flex-start', 'left');
    } else {
      container.style.flexDirection = 'column';
      container.style.alignItems = geometry.isOnLeft ? 'flex-end' : 'flex-start';
      container.style.justifyContent = 'flex-start';
      container.style.top = `${geometry.overlayTop}px`;
      const helperOffset = plusButtonDistanceLeftRight + plusButtonRadius + helperHorizontalGap;
      if (geometry.isOnLeft) {
        container.style.left = `${geometry.topicLeft - helperOffset}px`;
        container.style.right = 'auto';
        container.style.transform = 'translateX(-100%)';
      } else {
        container.style.left = `${geometry.topicRight + helperOffset}px`;
        container.style.right = 'auto';
        container.style.transform = 'none';
      }
      const direction = geometry.isOnLeft ? 'row-reverse' : 'row';
      const justify = geometry.isOnLeft ? 'flex-end' : 'flex-start';
      const textAlign = geometry.isOnLeft ? 'right' : 'left';
      this.setHelperRowLayout(tabRow, direction, justify, textAlign);
      this.setHelperRowLayout(enterRow, direction, justify, textAlign);
    }
  }

  private ensurePlusButtons(): void {
    if (this._rightPlus && !this._rightPlus.parentElement) {
      this._rightPlus = null;
    }
    if (this._bottomPlus && !this._bottomPlus.parentElement) {
      this._bottomPlus = null;
    }

    if (!this._rightPlus) {
      const rightPlus = document.createElement('div');
      rightPlus.textContent = '+';
      rightPlus.style.position = 'absolute';
      rightPlus.style.left = '0px';
      rightPlus.style.top = '0px';
      rightPlus.style.width = '20px';
      rightPlus.style.height = '20px';
      rightPlus.style.borderRadius = '50%';
      rightPlus.style.color = 'white';
      rightPlus.style.display = 'flex';
      rightPlus.style.alignItems = 'center';
      rightPlus.style.justifyContent = 'center';
      rightPlus.style.fontSize = '16px';
      rightPlus.style.fontWeight = 'bold';
      rightPlus.style.lineHeight = '1';
      rightPlus.style.padding = '0';
      rightPlus.style.margin = '0';
      rightPlus.style.boxSizing = 'border-box';
      rightPlus.style.textAlign = 'center';
      rightPlus.style.pointerEvents = 'auto';
      rightPlus.style.cursor = 'pointer';
      rightPlus.style.zIndex = '1001';
      rightPlus.style.transformOrigin = 'center center';
      rightPlus.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const isVertical =
          this.withTopic((topic) => topic.getOrientation() === 'vertical') ?? false;
        if (isVertical) {
          this._createSibling();
        } else {
          this._createChild();
        }
      });
      this._containerElement.appendChild(rightPlus);
      this._rightPlus = rightPlus;
      this.updateColors();
    }

    if (!this._bottomPlus) {
      const bottomPlus = document.createElement('div');
      bottomPlus.textContent = '+';
      bottomPlus.style.position = 'absolute';
      bottomPlus.style.left = '0px';
      bottomPlus.style.top = '0px';
      bottomPlus.style.width = '20px';
      bottomPlus.style.height = '20px';
      bottomPlus.style.borderRadius = '50%';
      bottomPlus.style.color = 'white';
      bottomPlus.style.display = 'flex';
      bottomPlus.style.alignItems = 'center';
      bottomPlus.style.justifyContent = 'center';
      bottomPlus.style.fontSize = '16px';
      bottomPlus.style.fontWeight = 'bold';
      bottomPlus.style.lineHeight = '1';
      bottomPlus.style.padding = '0';
      bottomPlus.style.margin = '0';
      bottomPlus.style.boxSizing = 'border-box';
      bottomPlus.style.textAlign = 'center';
      bottomPlus.style.pointerEvents = 'auto';
      bottomPlus.style.cursor = 'pointer';
      bottomPlus.style.zIndex = '1001';
      bottomPlus.style.transformOrigin = 'center center';
      bottomPlus.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const isVertical =
          this.withTopic((topic) => topic.getOrientation() === 'vertical') ?? false;
        if (isVertical) {
          this._createChild();
        } else {
          this._createSibling();
        }
      });
      this._containerElement.appendChild(bottomPlus);
      this._bottomPlus = bottomPlus;
      this.updateColors();
    }
  }

  private updatePlusButtons(geometry: OverlayGeometry, hasChildren: boolean): void {
    const plusButtonDistanceLeftRight = 18;
    const plusButtonDistanceBottom = 6;

    if (this._rightPlus) {
      if (geometry.isOnLeft) {
        this._rightPlus.style.left = `${Math.round(geometry.topicLeft - plusButtonDistanceLeftRight)}px`;
        this._rightPlus.style.right = 'auto';
      } else {
        this._rightPlus.style.left = `${Math.round(geometry.topicRight + plusButtonDistanceLeftRight)}px`;
        this._rightPlus.style.right = 'auto';
      }
      this._rightPlus.style.top = `${Math.round(geometry.topicCenterY)}px`;
      this._rightPlus.style.transform = 'translate(-50%, -50%)';
      const shouldDisplay = geometry.isVertical || !hasChildren;
      this._rightPlus.style.display = shouldDisplay ? 'flex' : 'none';
      this._rightPlus.style.pointerEvents = shouldDisplay ? 'auto' : 'none';
    }

    if (this._bottomPlus) {
      this._bottomPlus.style.left = `${Math.round(geometry.topicCenterX)}px`;
      this._bottomPlus.style.top = `${Math.round(geometry.topicBottom + plusButtonDistanceBottom)}px`;
      this._bottomPlus.style.transform = 'translateX(-50%)';
      const shouldDisplay = !geometry.isVertical || !hasChildren;
      this._bottomPlus.style.display = shouldDisplay ? 'flex' : 'none';
      this._bottomPlus.style.pointerEvents = shouldDisplay ? 'auto' : 'none';
    }
  }

  toggle(): void {
    const topicExists = this.withTopic(() => true);
    if (!topicExists) {
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }
      return;
    }

    this._isVisible = !this._isVisible;

    if (this._isVisible) {
      this.updateOverlay();
      if (this._helperContainer) {
        this._helperContainer.style.display = 'flex';
      }
    } else {
      if (this._overlay) {
        this._overlay.style.display = 'none';
      }

      if (this._helperContainer) {
        this._helperContainer.style.display = 'none';
      }

      if (this._rightPlus) {
        this._rightPlus.style.display = 'none';
        this._rightPlus.style.pointerEvents = 'none';
      }
      if (this._bottomPlus) {
        this._bottomPlus.style.display = 'none';
        this._bottomPlus.style.pointerEvents = 'none';
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

  private withTopic<T>(callback: (topic: Topic) => T): T | null {
    try {
      if (!this._topic || !this._topic.getModel()) {
        return null;
      }
      return callback(this._topic);
    } catch (error) {
      return null;
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
    this._helperElements = null;
  }
}

export default HTMLTopicSelected;
