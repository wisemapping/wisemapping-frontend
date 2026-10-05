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
import Icon from './Icon';
import SizeType from './SizeType';
import PositionType from './PositionType';
import FeatureModel from './model/FeatureModel';
import Topic from './Topic';
import ThemeFactory from './theme/ThemeFactory';
import ImageEmojiFeature from './ImageEmojiFeature';

// Material Icons Unicode codepoints: the codepoints of the 'Material Icons' font that
// MindplotWebComponent loads, as listed in google/material-design-icons
// font/MaterialIcons-Regular.codepoints (checked by test/unit/features/material-icon-codepoints.test.ts).
// A name that is not a Material Icons name stands for the icon the editor's image picker shows.
// Built once: it was rebuilt on every lookup, several times per redraw.
export const MATERIAL_ICON_CODEPOINTS: { readonly [key: string]: string } = {
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
  business: '\ue0af',

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
  'location-on': '\ue0c8',
  'two-wheeler': '\ue9f9',
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
  'menu-book': '\uea19',
  assignment: '\ue85d',
  build: '\ue869',
  science: '\uea4b',

  // Lifestyle
  restaurant: '\ue56c',
  'shopping-cart': '\ue8cc',
  'local-grocery-store': '\ue547',
  'local-hospital': '\ue548',
  'sports-soccer': '\uea2f',
  'sports-basketball': '\uea26',
  gamepad: '\ue30f',
  book: '\ue865',
  'local-cafe': '\ue541',
  'shopping-bag': '\uf1cc',

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
  mic: '\ue029',
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
  headphones: '\uf01f',
  camera: '\ue3af',
  image: '\ue3f4',
  'video-file': '\ueb87',
  'audio-file': '\ueb82',
  folder: '\ue2c7',
  'cloud-upload': '\ue2c3',
  wifi: '\ue63e',
  bluetooth: '\ue1a7',
  storage: '\ue1db',
  memory: '\ue322',

  // Business & Finance
  money: '\ue227',
  'trending-up': '\ue8e5',
  'pie-chart': '\ue6c4',
  'bar-chart': '\ue26b',
  timeline: '\ue922',
  assessment: '\ue85c',
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
  location: '\ue0c8',
  car: '\ue531',
  bike: '\ue52f',
  walk: '\ue536',

  // Lifestyle & Activities
  'grocery-store': '\ue547',
  hospital: '\ue548',
  soccer: '\uea2f',
  basketball: '\uea26',
  tennis: '\uea32',
  fitness: '\ueb43',
  music: '\ue405',
  movie: '\ue02c',

  // Creative & Design
  'photo-camera': '\ue412',
  'color-lens': '\ue3b7',
  'auto-fix': '\ue663',
  'filter-vintage': '\ue3e3',
  gradient: '\ue3e9',
  texture: '\ue421',

  // Nature & Weather
  sunny: '\ue430',
  snow: '\ueb3b',
  fire: '\ue80e',
  'invert-colors': '\ue891',
  opacity: '\ue91c',
  park: '\uea63',
  nature: '\ue406',

  // Food & Drink
  'wine-bar': '\uf1e8',
  coffee: '\uefef',
  cake: '\ue7e9',
  'ice-cream': '\uea69',
  cookie: '\ueaac',
  bakery: '\uea53',

  // Health & Medical
  'medical-services': '\uf109',
  'health-safety': '\ue1d5',
  coronavirus: '\uf221',
  vaccines: '\ue138',
  medication: '\uf033',
  sick: '\uf220',

  // Social Media. The font has no Twitter, Instagram, LinkedIn, YouTube or WhatsApp icon: those
  // are drawn from BRAND_ICON_PATHS.
  facebook: '\uf234',

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
  'print-disabled': '\ue9cf',
  pdf: '\ue415',
  download: '\uf090',
  upload: '\uf09b',
  refresh: '\ue5d5',

  // Documents & Notes
  article: '\uef42',
  note: '\ue06f',
  'sticky-note': '\uf1fc',
  task: '\uf075',
  checklist: '\ue6b1',
  list: '\ue896',

  // Views & Layout
  'view-list': '\ue8ef',
  'view-module': '\ue8f0',
  dashboard: '\ue871',
  table: '\ue265',
  'view-column': '\ue8ec',
  'view-headline': '\ue8ee',
  'view-stream': '\ue8f2',
  'view-week': '\ue8f3',
  'view-day': '\ue8ed',
  'view-agenda': '\ue8e9',
  'view-carousel': '\ue8eb',
  'view-comfy': '\ue42a',
  'view-compact': '\ue42b',
  'view-sidebar': '\uf114',
  'view-quilt': '\ue8f1',
  'view-array': '\ue8ea',
  'view-kanban': '\ueb7f',
  'view-timeline': '\ueb85',
  'view-ar': '\ue9fe',

  // Additional Business & Productivity Icons (40 new icons)
  'account-balance': '\ue84f',
  'business-center': '\ueb3f',
  'work-outline': '\ue943',
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
  'directions-subway': '\ue533',
  'directions-bus': '\ue530',
  'local-shipping': '\ue558',

  // Tools & Construction
  construction: '\uea3c',
  handyman: '\uf10b',
  engineering: '\uea3d',

  // Emotions & Feedback
  'sentiment-satisfied': '\ue813',
  mood: '\ue7f2',
  'emoji-emotions': '\uea22',

  // Time & Productivity
  alarm: '\ue855',
  'alarm-on': '\ue858',
  'hourglass-empty': '\ue88b',
  pending: '\uef64',

  // Analytics & Data (10 icons)
  analytics: '\uef3e',
  insights: '\uf092',
  'data-usage': '\ue1af',
  'cloud-done': '\ue2bf',
  'cloud-off': '\ue2c1',
  'cloud-queue': '\ue2c2',
  'table-view': '\uf1be',
  api: '\uf1b7',
  query: '\ue4fc',
  'bar-chart-outlined': '\ue26b',

  // Industry & Professional (15 icons)
  factory: '\uebbc',
  agriculture: '\uea79',
  biotech: '\uea3a',
  'real-estate': '\ue73a',
  'local-pharmacy': '\ue550',
  'medical-information': '\uebed',
  'school-outlined': '\ue80c',
  'local-library': '\ue54b',
  museum: '\uea36',
  theater: '\uea66',
  'sports-esports': '\uea28',
  apartment: '\uea40',
  domain: '\ue7ee',
  'local-cafe-outlined': '\ue541',
  'local-dining': '\ue556',

  // Actions & Controls (20 icons)
  'play-circle': '\ue1c4',
  'pause-circle': '\ue1a2',
  'stop-circle': '\uef71',
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
  compare: '\ue3b9',
  flip: '\ue3e8',
  'rotate-left': '\ue419',

  // Status & Indicators (15 icons)
  'priority-high': '\ue645',
  'new-releases': '\ue031',
  'fiber-new': '\ue05e',
  verified: '\uef76',
  'verified-user': '\ue8e8',
  'workspace-premium': '\ue7af',
  stars: '\ue8d0',
  grade: '\ue885',
  'military-tech': '\uea3f',
  'trending-flat': '\ue8e4',
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
  'perm-media': '\ue8a7',
  slideshow: '\ue41b',
  theaters: '\ue8da',
  'live-tv': '\ue639',
  podcasts: '\uf048',
  'speaker-notes': '\ue8cd',
  'format-quote': '\ue244',
  'library-music': '\ue030',
  'library-add': '\ue02e',
  'video-call': '\ue070',
  'photo-camera-front': '\uef69',
};

// Brand icons the 'Material Icons' font does not have. They are drawn from the path of the
// @mui/icons-material icon the editor's image picker shows for them, on its 24×24 grid
// (@mui/icons-material 9.4.0, MIT licence, Copyright (c) 2014 Call-Em-All).
/* eslint-disable max-len -- path data copied verbatim */
export const BRAND_ICON_PATHS: { readonly [key: string]: string } = {
  twitter:
    'M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z',
  instagram:
    'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z',
  linkedin:
    'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
  youtube:
    'M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z',
  whatsapp:
    'M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z',
};
/* eslint-enable max-len */

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
  private _svgIcon: Icon | undefined;

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
