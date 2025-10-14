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

import { Text, Group } from '@wisemapping/web2d';
import { $assert } from './util/assert';
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
      const shapeType = this._topic.getShapeType();
      if (shapeType !== 'line') {
        const model = this._topic.getModel();
        const theme = ThemeFactory.create(model, this._topic.getThemeVariant());
        const fontColor = theme.getFontColor(this._topic);
        this._svgText.setColor(fontColor);
      }
    }
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
      }
      console.warn(`No Unicode mapping found for icon: ${iconName}`);
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
      star: '\ue838',
      favorite: '\ue87d',
      'thumbs-up': '\ue8dc',
      'check-circle': '\ue86c',
      warning: '\ue002',
      error: '\ue000',
      info: '\ue88e',
      help: '\ue887',
      add: '\ue145',
      delete: '\ue872',
      edit: '\ue3c9',
      save: '\ue161',
      search: '\ue8b6',
      settings: '\ue8b8',

      // Navigation
      home: '\ue88a',
      work: '\ue8f9',
      business: '\ue7ee',

      // Communication
      email: '\ue0be',
      phone: '\ue0cd',
      message: '\ue0c9',
      share: '\ue80d',

      // Technology
      computer: '\ue30a',
      smartphone: '\ue32c',
      tablet: '\ue32f',
      laptop: '\ue31e',

      // Transportation
      'directions-car': '\ue531',
      flight: '\ue539',
      train: '\ue570',
      'directions-bike': '\ue52f',
      'directions-walk': '\ue536',
      'location-on': '\ue55f',
      'two-wheeler': '\ue9ca',
      'directions-run': '\ue566',

      // Education & Creative
      school: '\ue80c',
      palette: '\ue40a',
      brush: '\ue3ae',
      lightbulb: '\ue0f0',
      'flash-on': '\ue3e7',
      flash: '\ue3e7', // Same as flash-on
      security: '\ue32a',
      lock: '\ue897',
      'menu-book': '\ue421',
      assignment: '\ue85d',
      build: '\ue869',
      science: '\uea4b',

      // Lifestyle
      restaurant: '\ue56c',
      'shopping-cart': '\ue8cc',
      'local-grocery-store': '\ue547',
      'local-hospital': '\ue548',
      'sports-soccer': '\uea2c',
      'sports-basketball': '\uea26',
      gamepad: '\ue30f',
      book: '\ue865',
      'local-cafe': '\ue541',
      'shopping-bag': '\ue8cb',

      // Media & Controls
      play: '\ue037',
      pause: '\ue034',
      stop: '\ue047',
      'skip-next': '\ue044',
      'skip-previous': '\ue045',
      'fast-forward': '\ue01f',
      'fast-rewind': '\ue020',
      'volume-up': '\ue050',
      'volume-down': '\ue04d',
      'volume-off': '\ue04f',
      mic: '\ue31d',
      'mic-off': '\ue02b',
      videocam: '\ue04b',
      'videocam-off': '\ue04c',
      fullscreen: '\ue5d0',
      'fullscreen-exit': '\ue5d1',
      'zoom-in': '\ue8ff',
      'zoom-out': '\ue900',

      // People & Communication
      'account-circle': '\ue853',
      person: '\ue7fd',
      group: '\ue7ef',
      mail: '\ue158',
      chat: '\ue0b7',
      notifications: '\ue7f4',

      // Technology & Devices
      'phone-android': '\ue324',
      tv: '\ue333',
      headphones: '\ue30f',
      camera: '\ue3af',
      image: '\ue3f4',
      'video-file': '\ue1a2',
      'audio-file': '\ue1a0',
      folder: '\ue2c7',
      'cloud-upload': '\ue2c3',
      wifi: '\ue63e',
      bluetooth: '\ue1a7',
      storage: '\ue1db',
      memory: '\ue322',

      // Business & Finance
      money: '\ue227',
      'trending-up': '\ue8e5',
      'pie-chart': '\ue6c3',
      'bar-chart': '\ue26b',
      timeline: '\ue922',
      assessment: '\ue85f',
      description: '\ue873',
      schedule: '\ue8b5',
      'calendar-today': '\ue935',
      event: '\ue878',
      'event-available': '\ue614',
      'event-busy': '\ue615',
      'access-time': '\ue192',
      timer: '\ue425',
      'date-range': '\ue916',
      today: '\ue8df',
      update: '\ue923',
      history: '\ue889',

      // Transportation & Location
      location: '\ue55f',
      car: '\ue531',
      bike: '\ue52f',
      walk: '\ue536',

      // Lifestyle & Activities
      'grocery-store': '\ue547',
      hospital: '\ue548',
      soccer: '\uea2c',
      basketball: '\uea26',
      tennis: '\uea32',
      fitness: '\ueb43',
      music: '\ue405',
      movie: '\ue02c',

      // Creative & Design
      'photo-camera': '\ue412',
      'color-lens': '\ue40a',
      'auto-fix': '\ue3e0',
      'filter-vintage': '\ue3e3',
      gradient: '\ue3e9',
      texture: '\ue421',

      // Nature & Weather
      sunny: '\ue430',
      snow: '\ueb3b',
      fire: '\ue80e',
      'invert-colors': '\ue891',
      opacity: '\ue91c',
      park: '\ue63f',
      nature: '\ue406',

      // Food & Drink
      'wine-bar': '\ue7eb',
      coffee: '\uef4a',
      cake: '\ue7e9',
      'ice-cream': '\uea69',
      cookie: '\ueaac',
      bakery: '\uea53',

      // Health & Medical
      'medical-services': '\uef4d',
      'health-safety': '\ue1f5',
      coronavirus: '\uf221',
      vaccines: '\ue138',
      medication: '\uef4e',
      sick: '\uef80',

      // Social Media
      facebook: '\uf234',
      twitter: '\uf099',
      instagram: '\uf16d',
      linkedin: '\uf08c',
      youtube: '\uf167',
      whatsapp: '\uf232',

      // Additional General Icons
      close: '\ue5cd',
      check: '\ue5ca',
      cancel: '\ue5c9',
      done: '\ue876',
      clear: '\ue14c',
      remove: '\ue15b',
      'add-circle': '\ue147',
      'remove-circle': '\ue15c',
      'expand-more': '\ue5cf',
      'expand-less': '\ue5ce',
      'arrow-down': '\ue313',
      'arrow-up': '\ue316',
      'arrow-left': '\ue314',
      'arrow-right': '\ue315',

      // Actions & Navigation
      'open-in-new': '\ue89e',
      launch: '\ue895',
      link: '\ue157',
      'link-off': '\ue16f',
      'content-copy': '\ue14d',
      'content-cut': '\ue14e',
      'content-paste': '\ue14f',
      undo: '\ue166',
      redo: '\ue15a',
      print: '\ue8ad',
      'print-disabled': '\ue8ae',
      pdf: '\ue415',
      download: '\ue2c4',
      upload: '\ue2c6',
      refresh: '\ue5d5',

      // Documents & Notes
      article: '\uef42',
      note: '\ue8d9',
      'sticky-note': '\ue1fc',
      task: '\ue8f5',
      checklist: '\ue6b1',
      list: '\ue896',

      // Views & Layout
      'view-list': '\ue8ef',
      'view-module': '\ue8f0',
      dashboard: '\ue871',
      table: '\ue265',
      'view-column': '\ue8f1',
      'view-headline': '\ue8f2',
      'view-stream': '\ue8f3',
      'view-week': '\ue8f4',
      'view-day': '\ue8ee',
      'view-agenda': '\ue8ed',
      'view-carousel': '\ue8f6',
      'view-comfy': '\ue8f7',
      'view-compact': '\ue8f8',
      'view-sidebar': '\ue8f9',
      'view-quilt': '\ue8fa',
      'view-array': '\ue8fb',
      'view-kanban': '\ue8fc',
      'view-timeline': '\ue8fd',
      'view-ar': '\ue8fe',

      // Additional Business & Productivity Icons (40 new icons)
      'account-balance': '\ue84f',
      'business-center': '\ueb3f',
      'work-outline': '\ue940',
      badge: '\uea67',
      contacts: '\ue0ba',
      store: '\ue8d1',
      'shopping-basket': '\ue8cb',
      receipt: '\ue8b0',
      'credit-card': '\ue870',
      payment: '\ue8a1',

      // Files & Folders
      'create-new-folder': '\ue2cc',
      'folder-open': '\ue2c8',
      'file-copy': '\ue173',
      'insert-drive-file': '\ue24d',
      'attach-file': '\ue226',

      // Communication & Social
      forum: '\ue0bf',
      comment: '\ue0b9',
      announcement: '\ue85a',
      campaign: '\uef49',
      feedback: '\ue87f',

      // Project Management
      flag: '\ue153',
      bookmark: '\ue866',
      'bookmark-border': '\ue867',
      label: '\ue892',
      'label-important': '\ue937',
      extension: '\ue87b',
      'dashboard-customize': '\ue99b',

      // Transportation
      'directions-subway': '\ue534',
      'directions-bus': '\ue530',
      'local-shipping': '\ue558',

      // Tools & Construction
      construction: '\uea3c',
      handyman: '\uf10b',
      engineering: '\uea3d',

      // Emotions & Feedback
      'sentiment-satisfied': '\ue815',
      mood: '\ue7f2',
      'emoji-emotions': '\uea22',

      // Time & Productivity
      alarm: '\ue855',
      'alarm-on': '\ue857',
      'hourglass-empty': '\ue88b',
      pending: '\uef64',

      // Analytics & Data (10 icons)
      analytics: '\uef3e',
      insights: '\uf092',
      'data-usage': '\ue1af',
      'cloud-done': '\ue876',
      'cloud-off': '\ue16a',
      'cloud-queue': '\ue2c2',
      'table-view': '\uf1be',
      api: '\uf1b7',
      query: '\ue8b5',
      'bar-chart-outlined': '\ue26b',

      // Industry & Professional (15 icons)
      factory: '\uebbc',
      agriculture: '\uea79',
      biotech: '\uea3a',
      'real-estate': '\ue59d',
      'local-pharmacy': '\ue54c',
      'medical-information': '\uebed',
      'school-outlined': '\ue80c',
      'local-library': '\ue54b',
      museum: '\uea36',
      theater: '\ue8da',
      'sports-esports': '\uea36',
      apartment: '\uea40',
      domain: '\ue7ee',
      'local-cafe-outlined': '\ue541',
      'local-dining': '\ue56c',

      // Actions & Controls (20 icons)
      'play-circle': '\ue038',
      'pause-circle': '\ue039',
      'stop-circle': '\ue047',
      replay: '\ue042',
      'forward-10': '\ue056',
      'replay-10': '\ue059',
      shuffle: '\ue043',
      repeat: '\ue040',
      'repeat-one': '\ue041',
      sort: '\ue164',
      'filter-list': '\ue152',
      'filter-alt': '\uef4f',
      'search-off': '\uea76',
      'find-in-page': '\ue880',
      'find-replace': '\ue881',
      visibility: '\ue8f4',
      'visibility-off': '\ue8f5',
      compare: '\ue3ba',
      flip: '\ue3e1',
      'rotate-left': '\ue419',

      // Status & Indicators (15 icons)
      'priority-high': '\ue645',
      'new-releases': '\ue031',
      'fiber-new': '\ue05e',
      verified: '\uef76',
      'verified-user': '\ue8e8',
      'workspace-premium': '\ue99b',
      stars: '\ue8d0',
      grade: '\ue885',
      'military-tech': '\uea3f',
      'trending-flat': '\ue8e2',
      'trending-down': '\ue8e3',
      circle: '\uef4a',
      'radio-button-checked': '\ue837',
      'radio-button-unchecked': '\ue836',
      'check-box': '\ue834',

      // Content & Media (15 icons)
      'library-books': '\ue02f',
      'photo-library': '\ue413',
      'video-library': '\ue04a',
      collections: '\ue3b6',
      'perm-media': '\ue8aa',
      slideshow: '\ue41b',
      theaters: '\ue8da',
      'live-tv': '\ue639',
      podcasts: '\uf048',
      'speaker-notes': '\ue8cd',
      'format-quote': '\ue244',
      'library-music': '\ue030',
      'library-add': '\ue02e',
      'video-call': '\ue070',
      'photo-camera-front': '\ue412',
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
