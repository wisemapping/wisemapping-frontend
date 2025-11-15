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

class HTMLSelectedShadow {
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
    this._overlay.style.border = '2px solid #ffa800'; // Orange border matching wisemapping theme
    this._overlay.style.backgroundColor = 'rgba(255, 248, 240, 0.95)'; // Light orange-tinted background
    this._overlay.style.pointerEvents = 'none'; // Overlay itself doesn't capture clicks
    this._overlay.style.display = 'none'; // Hidden by default
    this._overlayContainer.appendChild(this._overlay);

    // Show shadow when topic gains focus (is selected)
    topic.addEvent('ontfocus', () => {
      this.show();
    });

    // Hide shadow when topic loses focus (is unselected)
    topic.addEvent('ontblur', () => {
      this.hide();
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

    // Check initial state - if topic is already focused, show shadow
    if (topic.isOnFocus()) {
      this.show();
    }
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
    const topicPosition = this._topic.getPosition();
    const centralPosition = current.getPosition();
    return topicPosition.x < centralPosition.x;
  }

  private updateOverlay(): void {
    const corners = this._topic.getAbsoluteCornerCoordinates();
    if (!corners) {
      this._overlay.style.display = 'none';
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
    const overlayWidth = width + padding * 2;
    const overlayHeight = height + padding * 2;
    const overlayLeft = left - padding;
    const overlayTop = top - padding;
    const overlayRight = overlayLeft + overlayWidth;

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

    // Determine if helper should be on left or right side
    const isOnLeft = this.isTopicOnLeftSide();

    // Update or create helper box
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
    } else {
      // Update position of existing helper box based on side
      const plusButtonDistance = 24; // Distance from overlay right edge to "+" center
      const plusButtonRadius = 10; // Half of button width (20px / 2)
      const gapFromPlus = 6; // 6px distance from "+" button
      const textStartFromOverlayEdge = plusButtonDistance + plusButtonRadius + gapFromPlus; // 24 + 10 + 6 = 40px

      if (isOnLeft) {
        // Helper text is on the left side - position from left edge of overlay
        existingHelper.style.left = `${overlayLeft - 220}px`; // Standard left positioning
        existingHelper.style.right = 'auto';
      } else {
        // Helper text is on the right side - position 6px from right "+" button outer edge
        // Text container's LEFT edge should be at: overlay right edge + 40px (to ensure no overlap)
        existingHelper.style.left = `${overlayRight + textStartFromOverlayEdge}px`;
        existingHelper.style.right = 'auto';
      }
      existingHelper.style.top = `${overlayTop}px`;
      existingHelper.style.display = 'flex';

      // Check if topic has children
      const hasChildren = this._topic.getChildren().length > 0;

      // Update helper text container visibility based on whether topic has children
      existingHelper.style.display = hasChildren ? 'none' : 'flex';

      // Update text alignment for helper text elements based on side (only if visible)
      if (!hasChildren) {
        const helperElements = existingHelper.querySelectorAll('[style*="display: flex"]');
        helperElements.forEach((element) => {
          const helperElem = element as HTMLDivElement;
          if (isOnLeft) {
            helperElem.style.justifyContent = 'flex-end';
            helperElem.style.flexDirection = 'row-reverse';
          } else {
            helperElem.style.justifyContent = 'flex-start';
            helperElem.style.flexDirection = 'row';
          }
        });
      }

      // Update plus buttons position and visibility
      if (this._rightPlus) {
        this._rightPlus.style.left = `${overlayRight + 24}px`;
        this._rightPlus.style.top = `${overlayTop + overlayHeight / 2}px`;
        this._rightPlus.style.display = hasChildren ? 'none' : 'flex';
        this._rightPlus.style.pointerEvents = hasChildren ? 'none' : 'auto';
      }
      if (this._bottomPlus) {
        this._bottomPlus.style.left = `${overlayLeft + overlayWidth / 2}px`;
        this._bottomPlus.style.top = `${overlayTop + overlayHeight + 24}px`;
        this._bottomPlus.style.display = hasChildren ? 'none' : 'flex';
        this._bottomPlus.style.pointerEvents = hasChildren ? 'none' : 'auto';
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
    // Check if topic has children - only show helper text if it doesn't
    const hasChildren = this._topic.getChildren().length > 0;

    // Helper text container - position on left or right side based on topic position
    const helperContainer = document.createElement('div');
    helperContainer.style.position = 'absolute';
    helperContainer.style.display = hasChildren ? 'none' : 'flex'; // Hide if topic has children
    helperContainer.style.flexDirection = 'column';
    helperContainer.style.gap = '8px';

    // Position helper text: 6px distance from "+" button outer edge
    // "+" button (rightPlus) is positioned at right: -24px (center is 24px from overlay right edge)
    // "+" button is 20px wide (radius = 10px), so its rightmost edge is at 24px + 10px = 34px from overlay right edge
    // We want 6px gap after the "+" button, so text starts at 34px + 6px = 40px from overlay right edge
    const plusButtonDistance = 24; // Distance from overlay right edge to "+" center
    const plusButtonRadius = 10; // Half of button width (20px / 2)
    const gapFromPlus = 6; // 6px distance from "+" button
    const textStartFromOverlayEdge = plusButtonDistance + plusButtonRadius + gapFromPlus; // 24 + 10 + 6 = 40px

    if (isOnLeft) {
      // Helper text is on the left side - position from left edge of overlay
      // Text is on the opposite side from the "+" button, so we position it normally from left edge
      helperContainer.style.left = `${left - 220}px`; // Standard left positioning
      helperContainer.style.right = 'auto';
    } else {
      // Helper text is on the right side - position 6px from right "+" button outer edge
      // Text container's LEFT edge should be at: overlay right edge + 40px (to ensure no overlap)
      // Using left positioning ensures the entire text container is to the right of the topic
      helperContainer.style.left = `${right + textStartFromOverlayEdge}px`;
      helperContainer.style.right = 'auto';
    }

    helperContainer.style.top = `${top}px`;
    helperContainer.style.pointerEvents = 'none';
    helperContainer.style.zIndex = '1000';

    // Only create helper text if topic has no children
    if (!hasChildren) {
      // Tab to create child
      const tabHelper = document.createElement('div');
      tabHelper.style.display = 'flex';
      tabHelper.style.alignItems = 'center';
      tabHelper.style.gap = '8px';
      // Align text based on side: right-aligned when on left, left-aligned when on right
      if (isOnLeft) {
        tabHelper.style.justifyContent = 'flex-end';
        tabHelper.style.flexDirection = 'row-reverse';
      } else {
        tabHelper.style.justifyContent = 'flex-start';
        tabHelper.style.flexDirection = 'row';
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

      const tabText = document.createElement('span');
      tabText.textContent = 'to create child';
      tabText.style.fontSize = '14px';
      tabText.style.fontFamily = 'Arial, sans-serif';
      tabText.style.color = '#666';

      tabHelper.appendChild(tabKey);
      tabHelper.appendChild(tabText);
      helperContainer.appendChild(tabHelper);

      // Enter to create sibling
      const enterHelper = document.createElement('div');
      enterHelper.style.display = 'flex';
      enterHelper.style.alignItems = 'center';
      enterHelper.style.gap = '8px';
      // Align text based on side: right-aligned when on left, left-aligned when on right
      if (isOnLeft) {
        enterHelper.style.justifyContent = 'flex-end';
        enterHelper.style.flexDirection = 'row-reverse';
      } else {
        enterHelper.style.justifyContent = 'flex-start';
        enterHelper.style.flexDirection = 'row';
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

      const enterText = document.createElement('span');
      enterText.textContent = 'to create sibling';
      enterText.style.fontSize = '14px';
      enterText.style.fontFamily = 'Arial, sans-serif';
      enterText.style.color = '#666';

      enterHelper.appendChild(enterKey);
      enterHelper.appendChild(enterText);
      helperContainer.appendChild(enterHelper);
    }

    // Plus icon at middle right of overlay (use existing hasChildren variable)
    // Size reduced by 30%: 28px * 0.7 = 19.6px (rounded to 20px), font: 20px * 0.7 = 14px
    // Append to overlay container instead of overlay so clicks work
    this._rightPlus = document.createElement('div');
    this._rightPlus.textContent = '+';
    this._rightPlus.style.position = 'absolute';
    // Position relative to container: overlay right edge + 24px offset
    this._rightPlus.style.left = `${right + 24}px`; // Position at overlay right edge + 24px
    this._rightPlus.style.top = `${top + height / 2}px`; // Middle of overlay vertically
    this._rightPlus.style.width = '20px';
    this._rightPlus.style.height = '20px';
    this._rightPlus.style.borderRadius = '50%';
    this._rightPlus.style.backgroundColor = '#FFA726';
    this._rightPlus.style.color = 'white';
    this._rightPlus.style.display = 'flex';
    this._rightPlus.style.alignItems = 'center';
    this._rightPlus.style.justifyContent = 'center';
    this._rightPlus.style.fontSize = '14px';
    this._rightPlus.style.fontWeight = 'bold';
    this._rightPlus.style.lineHeight = '1';
    this._rightPlus.style.pointerEvents = 'auto'; // Make clickable
    this._rightPlus.style.cursor = 'pointer';
    this._rightPlus.style.zIndex = '1001';
    this._rightPlus.style.transform = 'translateY(-50%) scale(0)';
    this._rightPlus.style.transformOrigin = 'center center';
    this._rightPlus.style.opacity = '0';
    this._rightPlus.style.fontSize = '0px';
    this._rightPlus.style.transition =
      'opacity 0.5s ease, transform 0.5s ease, font-size 0.5s ease';
    this._rightPlus.style.display = hasChildren ? 'none' : 'flex'; // Hide if topic has children
    // Disable pointer events when hidden to allow clicks through to topic
    this._rightPlus.style.pointerEvents = hasChildren ? 'none' : 'auto';

    // Add click handler to create sibling (right side)
    this._rightPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this._createSibling();
    });

    // Append to main container so clicks work (container has pointerEvents: auto)
    this._containerElement.appendChild(this._rightPlus);

    // Plus icon at bottom middle of overlay
    // Size reduced by 30%: 28px * 0.7 = 19.6px (rounded to 20px), font: 20px * 0.7 = 14px
    // Append to overlay container instead of overlay so clicks work
    this._bottomPlus = document.createElement('div');
    this._bottomPlus.textContent = '+';
    this._bottomPlus.style.position = 'absolute';
    // Position relative to container: overlay bottom edge + 24px offset
    this._bottomPlus.style.left = `${left + width / 2}px`; // Middle of overlay horizontally
    this._bottomPlus.style.top = `${top + height + 24}px`; // Position at overlay bottom edge + 24px
    this._bottomPlus.style.width = '20px';
    this._bottomPlus.style.height = '20px';
    this._bottomPlus.style.borderRadius = '50%';
    this._bottomPlus.style.backgroundColor = '#FFA726';
    this._bottomPlus.style.color = 'white';
    this._bottomPlus.style.display = 'flex';
    this._bottomPlus.style.alignItems = 'center';
    this._bottomPlus.style.justifyContent = 'center';
    this._bottomPlus.style.fontSize = '14px';
    this._bottomPlus.style.fontWeight = 'bold';
    this._bottomPlus.style.lineHeight = '1';
    this._bottomPlus.style.pointerEvents = 'auto'; // Make clickable
    this._bottomPlus.style.cursor = 'pointer';
    this._bottomPlus.style.zIndex = '1001';
    this._bottomPlus.style.transform = 'translateX(-50%) scale(0)';
    this._bottomPlus.style.transformOrigin = 'center center';
    this._bottomPlus.style.opacity = '0';
    this._bottomPlus.style.fontSize = '0px';
    this._bottomPlus.style.transition =
      'opacity 0.5s ease, transform 0.5s ease, font-size 0.5s ease';
    this._bottomPlus.style.display = hasChildren ? 'none' : 'flex'; // Hide if topic has children
    // Disable pointer events when hidden to allow clicks through to topic
    this._bottomPlus.style.pointerEvents = hasChildren ? 'none' : 'auto';

    // Add click handler to create child (bottom side)
    this._bottomPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this._createChild();
    });

    // Append to main container so clicks work (container has pointerEvents: auto)
    this._containerElement.appendChild(this._bottomPlus);

    // Trigger animation after a small delay to ensure styles are applied (only if no children)
    if (!hasChildren && this._rightPlus && this._bottomPlus) {
      setTimeout(() => {
        this._rightPlus!.style.opacity = '1';
        this._rightPlus!.style.transform = 'translateY(-50%) scale(1)';
        this._rightPlus!.style.fontSize = '14px';
        this._bottomPlus!.style.opacity = '1';
        this._bottomPlus!.style.transform = 'translateX(-50%) scale(1)';
        this._bottomPlus!.style.fontSize = '14px';
      }, 10);
    }

    // Append helper container to overlay container
    this._overlayContainer.appendChild(helperContainer);
    this._helperContainer = helperContainer;
  }

  toggle(): void {
    this._isVisible = !this._isVisible;

    if (this._isVisible) {
      this._overlay.style.display = 'block';
      this.updateOverlay();
      if (this._helperContainer) {
        this._helperContainer.style.display = 'flex';
      }

      // Check if topic has children - only show plus buttons if it doesn't
      const hasChildren = this._topic.getChildren().length > 0;

      // Trigger animation for plus icons (only if no children)
      if (this._rightPlus) {
        if (hasChildren) {
          this._rightPlus.style.display = 'none';
          this._rightPlus.style.pointerEvents = 'none';
        } else {
          this._rightPlus.style.display = 'flex';
          this._rightPlus.style.pointerEvents = 'auto'; // Enable when visible
          this._rightPlus.style.opacity = '0';
          this._rightPlus.style.transform = 'translateY(-50%) scale(0)';
          this._rightPlus.style.fontSize = '0px';
          setTimeout(() => {
            this._rightPlus!.style.opacity = '1';
            this._rightPlus!.style.transform = 'translateY(-50%) scale(1)';
            this._rightPlus!.style.fontSize = '14px';
          }, 10);
        }
      }
      if (this._bottomPlus) {
        if (hasChildren) {
          this._bottomPlus.style.display = 'none';
          this._bottomPlus.style.pointerEvents = 'none';
        } else {
          this._bottomPlus.style.display = 'flex';
          this._bottomPlus.style.pointerEvents = 'auto'; // Enable when visible
          this._bottomPlus.style.opacity = '0';
          this._bottomPlus.style.transform = 'translateX(-50%) scale(0)';
          this._bottomPlus.style.fontSize = '0px';
          setTimeout(() => {
            this._bottomPlus!.style.opacity = '1';
            this._bottomPlus!.style.transform = 'translateX(-50%) scale(1)';
            this._bottomPlus!.style.fontSize = '14px';
          }, 10);
        }
      }
    } else {
      this._overlay.style.display = 'none';
      if (this._helperContainer) {
        this._helperContainer.style.display = 'none';
      }

      // Reset plus icons for next animation
      if (this._rightPlus) {
        this._rightPlus.style.opacity = '0';
        this._rightPlus.style.transform = 'translateY(-50%) scale(0)';
        this._rightPlus.style.fontSize = '0px';
        this._rightPlus.style.pointerEvents = 'none'; // Disable when hidden
      }
      if (this._bottomPlus) {
        this._bottomPlus.style.opacity = '0';
        this._bottomPlus.style.transform = 'translateX(-50%) scale(0)';
        this._bottomPlus.style.fontSize = '0px';
        this._bottomPlus.style.pointerEvents = 'none'; // Disable when hidden
      }
    }
  }

  update(): void {
    if (this._isVisible) {
      this.updateOverlay();
    }
  }

  show(): void {
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

    // Create sibling (same as Enter key)
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
    if (this._overlayContainer && this._overlayContainer.parentElement) {
      this._overlayContainer.parentElement.removeChild(this._overlayContainer);
    }
  }
}

export default HTMLSelectedShadow;
