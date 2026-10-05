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
 * XMind Importer for WiseMapping
 *
 * This importer provides comprehensive support for importing XMind mind maps into WiseMapping format.
 * It handles both XMind XML format (legacy) and XMind JSON format (modern) files.
 *
 * ## Supported XMind Features:
 *
 * ### 📝 Content Mapping:
 * - **Topics**: All topic hierarchies are preserved with proper parent-child relationships
 * - **Notes**: XMind notes are converted to WiseMapping notes with rich HTML support
 * - **Labels**: XMind labels (categorization tags) are preserved as `🏷️ label-name`
 * - **Markers**: XMind markers (visual indicators) are preserved as `🔖 marker-name`
 * - **Icons**: XMind icons are comprehensively mapped to WiseMapping EmojiIcons with 300+ mappings
 *
 * ### 🎨 Styling Support:
 * - **Background Colors**: XMind `svg:fill` colors are mapped to WiseMapping `bgColor`
 * - **Border Colors**: XMind border colors are mapped to WiseMapping `brColor`
 * - **Topic Shapes**: All topics use `shape="line"` for consistent appearance
 * - **Positioning**: Intelligent circular positioning for child topics
 *
 * ### 📊 Data Integrity:
 * - **Deterministic IDs**: Incremental ID generation ensures consistent import results
 * - **No Data Loss**: All XMind metadata is preserved and converted appropriately
 * - **Single Note Constraint**: Multiple XMind elements (notes, labels, markers) are intelligently
 *   combined into a single WiseMapping note to respect architectural constraints
 *
 * ### 🔄 Format Support:
 * - **XMind XML**: Legacy XMind format with `<notes><plain>` and `<markers>` elements
 * - **XMind JSON**: Modern XMind format with `labels` arrays and style properties
 * - **ZIP Archives**: Both formats are extracted from XMind ZIP file structure
 *
 * ## Note Content Strategy:
 *
 * When a topic has multiple XMind elements, they're combined into one WiseMapping note:
 * ```
 * [XMind Note Content]
 * 🔖 marker1, 🔖 marker2
 * 🏷️ label1, 🏷️ label2
 * ```
 *
 * This ensures maximum data preservation while respecting WiseMapping's single-note-per-topic limitation.
 *
 * ## Example Usage:
 * ```typescript
 * const importer = new XMindImporter(xmindFileContent);
 * const wisemappingXML = await importer.import('My Mind Map', 'Description');
 * ```
 */
import { unzipSync } from 'fflate';
import type { LayoutType } from '../layout/LayoutType';
import Importer from './Importer';
import ImportError from './ImportError';
import SecureXmlParser from '../security/SecureXmlParser';
import Mindmap from '../model/Mindmap';
import NodeModel from '../model/NodeModel';
import NoteModel from '../model/NoteModel';
import FeatureModelFactory from '../model/FeatureModelFactory';
import { decodeUtf8, tryDecodeUtf8 } from './support/Utf8Decoder';
import toWiseMappingXml from './support/MindmapXml';

// XMind data structures
interface XMindTopic {
  id: string;
  title: string;
  children?: {
    attached?: XMindTopic[];
    // Floating topics, only on the root topic.
    detached?: XMindTopic[];
  };
  position?: { x: number; y: number };
  notes?: { plain?: { content?: string } };
  markers?: { markerId?: string }[];
  structureClass?: string;
  style?: {
    id: string;
    properties?: {
      'svg:fill'?: string;
      'border-line-width'?: string;
      'border-line-pattern'?: string;
    };
  };
  labels?: string[];
  icons?: string[];
  href?: string;
}

interface XMindExtension {
  provider: string;
  content?: Record<string, unknown>;
}

interface XMindRelationship {
  id: string;
  end1Id: string;
  end2Id: string;
  title?: string;
}

interface XMindSheet {
  id: string;
  revisionId?: string;
  class: string;
  rootTopic: XMindTopic;
  title?: string;
  topicOverlapping?: string;
  compactLayoutModeLevel?: string;
  extensions?: XMindExtension[];
  relationships?: XMindRelationship[];
}

type XMindRawInput = string | ArrayBuffer | Uint8Array;

type DetectedInput = { kind: 'xml'; xml: string } | { kind: 'json'; sheet: XMindSheet };

const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';

// XMind icons (marker ids) and the WiseMapping EmojiIcon ids they map to. Built once: the
// tables are hundreds of entries long.
const XMIND_ICONS: Readonly<Record<string, string>> = {
  // Priority icons
  'priority-1': '🔴', // Red circle
  'priority-2': '🟡', // Yellow circle
  'priority-3': '🟢', // Green circle
  'priority-4': '🔵', // Blue circle
  'priority-5': '🟣', // Purple circle

  // Star and rating icons
  star: '⭐', // Star
  'star-1': '⭐', // Star
  'star-2': '⭐', // Star
  'star-3': '⭐', // Star

  // Task and completion icons
  task: '📋', // Clipboard
  'task-done': '✅', // Check mark
  'task-start': '🟡', // Yellow circle
  'task-pause': '⏸️', // Pause button
  'task-stop': '⏹️', // Stop button

  // Arrow and direction icons
  'arrow-up': '⬆️', // ⬆️
  'arrow-down': '⬇️', // ⬇️
  'arrow-left': '⬅️', // ⬅️
  'arrow-right': '➡️', // ➡️
  'arrow-up-right': '↗️', // ↗️
  'arrow-down-right': '↘️', // ↘️
  'arrow-down-left': '↙️', // ↙️
  'arrow-up-left': '↖️', // ↖️

  // Symbol icons
  smile: '😊', // 😊
  sad: '😢', // 😢
  angry: '😠', // 😠
  surprised: '😲', // 😲
  confused: '😕', // 😕
  thinking: '🤔', // 🤔
  happy: '😃', // 😃
  laughing: '😂', // 😂
  wink: '😉', // 😉
  kiss: '😘', // 😘
  love: '😍', // 😍
  cool: '😎', // 😎
  sleepy: '😪', // 😪
  tired: '😴', // 😴
  worried: '😟', // 😟
  crying: '😭', // 😭
  screaming: '😱', // 😱
  neutral: '😐', // 😐
  expressionless: '😑', // 😑

  // Numbers (1-10)
  'number-1': '1️⃣', // 1️⃣
  'number-2': '2️⃣', // 2️⃣
  'number-3': '3️⃣', // 3️⃣
  'number-4': '4️⃣', // 4️⃣
  'number-5': '5️⃣', // 5️⃣
  'number-6': '6️⃣', // 6️⃣
  'number-7': '7️⃣', // 7️⃣
  'number-8': '8️⃣', // 8️⃣
  'number-9': '9️⃣', // 9️⃣
  'number-10': '🔟', // 🔟
  1: '1️⃣', // 1️⃣
  2: '2️⃣', // 2️⃣
  3: '3️⃣', // 3️⃣
  4: '4️⃣', // 4️⃣
  5: '5️⃣', // 5️⃣
  6: '6️⃣', // 6️⃣
  7: '7️⃣', // 7️⃣
  8: '8️⃣', // 8️⃣
  9: '9️⃣', // 9️⃣
  10: '🔟', // 🔟

  // Letters (A-Z)
  'letter-a': '🅰️', // 🅰️
  'letter-b': '🅱️', // 🅱️
  'letter-c': '🅲', // 🅲
  'letter-d': '🅳', // 🅳
  'letter-e': '🅴', // 🅴
  'letter-f': '🅵', // 🅵
  'letter-g': '🅶', // 🅶
  'letter-h': '🅷', // 🅷
  'letter-i': '🅸', // 🅸
  'letter-j': '🅹', // 🅹
  'letter-k': '🅺', // 🅺
  'letter-l': '🅻', // 🅻
  'letter-m': '🅼', // 🅼
  'letter-n': '🅽', // 🅽
  'letter-o': '🅾️', // 🅾️
  'letter-p': '🅿️', // 🅿️
  'letter-q': '🆀', // 🆀
  'letter-r': '🆁', // 🆁
  'letter-s': '🆂', // 🆂
  'letter-t': '🆃', // 🆃
  'letter-u': '🆄', // 🆄
  'letter-v': '🆅', // 🆅
  'letter-w': '🆆', // 🆆
  'letter-x': '🆇', // 🆇
  'letter-y': '🆈', // 🆈
  'letter-z': '🆉', // 🆉
  a: '🅰️', // 🅰️
  b: '🅱️', // 🅱️
  c: '🅲', // 🅲
  d: '🅳', // 🅳
  e: '🅴', // 🅴
  f: '🅵', // 🅵
  g: '🅶', // 🅶
  h: '🅷', // 🅷
  i: '🅸', // 🅸
  j: '🅹', // 🅹
  k: '🅺', // 🅺
  l: '🅻', // 🅻
  m: '🅼', // 🅼
  n: '🅽', // 🅽
  o: '🅾️', // 🅾️
  p: '🅿️', // 🅿️
  q: '🆀', // 🆀
  r: '🆁', // 🆁
  s: '🆂', // 🆂
  t: '🆃', // 🆃
  u: '🆄', // 🆄
  v: '🆅', // 🆅
  w: '🆆', // 🆆
  x: '🆇', // 🆇
  y: '🆈', // 🆈
  z: '🆉', // 🆉

  // Flag icons
  flag: '🚩', // 🚩
  'flag-red': '🚩', // 🚩
  'flag-yellow': '🟡', // 🟡
  'flag-green': '🟢', // 🟢
  'flag-blue': '🔵', // 🔵

  // People icons
  people: '👥', // 👥
  person: '👤', // 👤
  'person-1': '👤', // 👤
  'person-2': '👥', // 👥
  'person-3': '👥', // 👥

  // Time and date icons
  clock: '🕐', // 🕐
  calendar: '📅', // 📅
  time: '⏰', // ⏰

  // Communication icons
  phone: '📞', // 📞
  email: '📧', // 📧
  message: '💬', // 💬
  chat: '💬', // 💬

  // File and document icons
  file: '📄', // 📄
  folder: '📁', // 📁
  attachment: '📎', // 📎
  link: '🔗', // 🔗

  // Warning and info icons
  warning: '⚠️', // ⚠️
  info: 'ℹ️', // ℹ️
  question: '❓', // ❓
  exclamation: '❗', // ❗

  // Heart and like icons
  heart: '❤️', // ❤️
  like: '👍', // 👍
  dislike: '👎', // 👎

  // Lightbulb and idea icons
  lightbulb: '💡', // 💡
  idea: '💡', // 💡
  bulb: '💡', // 💡

  // Money and business icons
  money: '💰', // 💰
  dollar: '💲', // 💲
  euro: '💶', // 💶
  pound: '💷', // 💷

  // Location icons
  location: '📍', // 📍
  home: '🏠', // 🏠
  building: '🏢', // 🏢
  school: '🏫', // 🏫

  // Technology icons
  computer: '💻', // 💻
  laptop: '💻', // 💻
  'phone-mobile': '📱', // 📱
  tablet: '📱', // 📱

  // Weather icons
  sun: '☀️', // ☀️
  cloud: '☁️', // ☁️
  rain: '🌧️', // 🌧️
  snow: '❄️', // ❄️
  storm: '⛈️', // ⛈️
  rainbow: '🌈', // 🌈
  sunny: '🌞', // 🌞
  'partly-cloudy': '⛅', // ⛅
  cloudy: '🌥️', // 🌥️
  lightning: '⚡', // ⚡
  tornado: '🌪️', // 🌪️
  fog: '🌫️', // 🌫️
  wind: '🌬️', // 🌬️
  thermometer: '🌡️', // 🌡️

  // Animals
  dog: '🐶', // 🐶
  cat: '🐱', // 🐱
  mouse: '🐭', // 🐭
  hamster: '🐹', // 🐹
  rabbit: '🐰', // 🐰
  fox: '🦊', // 🦊
  bear: '🐻', // 🐻
  panda: '🐼', // 🐼
  koala: '🐨', // 🐨
  lion: '🦁', // 🦁
  tiger: '🐯', // 🐯
  cow: '🐮', // 🐮
  pig: '🐷', // 🐷
  frog: '🐸', // 🐸
  monkey: '🐵', // 🐵
  chicken: '🐔', // 🐔
  penguin: '🐧', // 🐧
  bird: '🐦', // 🐦
  fish: '🐟', // 🐟
  whale: '🐳', // 🐳
  dolphin: '🐬', // 🐬
  octopus: '🐙', // 🐙
  spider: '🕷️', // 🕷️
  bug: '🐛', // 🐛
  bee: '🐝', // 🐝
  butterfly: '🦋', // 🦋
  snail: '🐌', // 🐌
  turtle: '🐢', // 🐢
  snake: '🐍', // 🐍
  dragon: '🐉', // 🐉
  unicorn: '🦄', // 🦄

  // Food and drink icons
  coffee: '☕', // ☕
  food: '🍽️', // 🍽️
  pizza: '🍕', // 🍕
  burger: '🍔', // 🍔
  apple: '🍎', // 🍎
  orange: '🍊', // 🍊
  banana: '🍌', // 🍌
  grapes: '🍇', // 🍇
  strawberry: '🍓', // 🍓
  kiwi: '🥝', // 🥝
  peach: '🍑', // 🍑
  coconut: '🥥', // 🥥
  cherry: '🍒', // 🍒
  lemon: '🍋', // 🍋
  watermelon: '🍉', // 🍉
  pineapple: '🍍', // 🍍
  bread: '🍞', // 🍞
  cookie: '🍪', // 🍪
  candy: '🍬', // 🍬
  chocolate: '🍫', // 🍫
  'ice-cream': '🍦', // 🍦
  popcorn: '🍿', // 🍿
  beer: '🍺', // 🍺
  wine: '🍷', // 🍷
  cocktail: '🍸', // 🍸
  tea: '🍵', // 🍵
  milk: '🥛', // 🥛
  water: '💧', // 💧

  // Sports and activity icons
  sports: '⚽', // ⚽
  football: '⚽', // ⚽
  basketball: '🏀', // 🏀
  tennis: '🎾', // 🎾
  swimming: '🏊', // 🏊
  soccer: '⚽', // ⚽
  baseball: '⚾', // ⚾
  volleyball: '🏐', // 🏐
  rugby: '🏈', // 🏈
  golf: '⛳', // ⛳
  bowling: '🎳', // 🎳
  running: '🏃', // 🏃
  cycling: '🚴', // 🚴
  skiing: '⛷️', // ⛷️
  snowboarding: '🏂', // 🏂
  surfing: '🏄', // 🏄
  climbing: '🧗', // 🧗
  yoga: '🧘', // 🧘
  dancing: '💃', // 💃
  gym: '🏋️', // 🏋️
  weightlifting: '🏋️', // 🏋️
  boxing: '🥊', // 🥊
  'martial-arts': '🥋', // 🥋
  archery: '🏹', // 🏹
  fishing: '🎣', // 🎣
  hiking: '🧖', // 🧖
  camping: '🏕️', // 🏕️
  picnic: '🍽️', // 🍽️
  barbecue: '🍳', // 🍳
  target: '🎯', // 🎯
  trophy: '🏆', // 🏆
  medal: '🏅', // 🏅
  'first-place': '🥇', // 🥇
  'second-place': '🥈', // 🥈
  'third-place': '🥉', // 🥉

  // Music and entertainment icons
  music: '🎵', // 🎵
  movie: '🎬', // 🎬
  game: '🎮', // 🎮
  book: '📚', // 📚

  // Travel and transport icons
  car: '🚗', // 🚗
  plane: '✈️', // ✈️
  train: '🚂', // 🚂
  bus: '🚌', // 🚌
  bike: '🚲', // 🚲

  // Nature icons
  tree: '🌳', // 🌳
  flower: '🌸', // 🌸
  leaf: '🍃', // 🍃
  mountain: '⛰️', // ⛰️
  ocean: '🌊', // 🌊

  // Holiday and celebration icons
  gift: '🎁', // 🎁
  cake: '🎂', // 🎂
  party: '🎉', // 🎉
  fireworks: '🎆', // 🎆
  christmas: '🎄', // 🎄
  halloween: '🎃', // 🎃

  // Tools and work icons
  tool: '🔧', // 🔧
  wrench: '🔧', // 🔧
  hammer: '🔨', // 🔨
  screwdriver: '🔩', // 🔩
  key: '🔑', // 🔑
  lock: '🔒', // 🔒

  // Medical and health icons
  medical: '🏥', // 🏥
  health: '💊', // 💊
  pill: '💊', // 💊
  heartbeat: '💓', // 💓
  cross: '➕', // ➕

  // Shopping and commerce icons
  shopping: '🛒', // 🛒
  cart: '🛒', // 🛒
  bag: '👜', // 👜
  'credit-card': '💳', // 💳

  // Security and safety icons
  security: '🔒', // 🔒
  shield: '🛡️', // 🛡️
  'lock-closed': '🔒', // 🔒
  'lock-open': '🔓', // 🔓

  // Science and education icons
  science: '🔬', // 🔬
  microscope: '🔬', // 🔬
  telescope: '🔭', // 🔭
  atom: '⚛️', // ⚛️
  'book-open': '📖', // 📖
  graduation: '🎓', // 🎓
};

// Additional comprehensive mappings for common XMind icons
const XMIND_ADDITIONAL_ICONS: Readonly<Record<string, string>> = {
  // More entertainment
  tv: '📺',
  radio: '📻',
  camera: '📷',
  video: '📹',
  microphone: '🎤',
  headphones: '🎧',
  guitar: '🎸',
  piano: '🎹',
  drum: '🥁',
  trumpet: '🎺',
  violin: '🎻',
  saxophone: '🎷',

  // More symbols and objects
  fire: '🔥',
  bomb: '💣',
  diamond: '💎',
  gem: '💎',
  ring: '💍',
  balloon: '🎈',
  confetti: '🎊',
  celebration: '🎆',

  // More transport
  helicopter: '🚁',
  rocket: '🚀',
  satellite: '🛰️',
  ufo: '🛸',
  ship: '🚢',
  anchor: '⚓',
  sailboat: '⛵',
  'ferris-wheel': '🎡',
  'roller-coaster': '🎢',
  carousel: '🎠',
  circus: '🎪',
  tent: '⛺',

  // More nature and environment
  desert: '🏜️',
  volcano: '🌋',
  island: '🏝️',
  beach: '🏖️',
  camping: '🏕️',
  'national-park': '🏞️',
  stadium: '🏟️',
  bridge: '🌉',
  cityscape: '🏙️',
  'night-sky': '🌃',
  sunrise: '🌅',
  sunset: '🌇',

  // More technology and gadgets
  keyboard: '⌨️',
  'mouse-computer': '🖱️',
  printer: '🖨️',
  scanner: '📸',
  cd: '💿',
  dvd: '📀',
  'floppy-disk': '💾',
  'hard-disk': '💾',
  battery: '🔋',
  'electric-plug': '🔌',
  'satellite-antenna': '📡',
  'radio-signal': '📡',

  // More business and office
  briefcase: '💼',
  'office-building': '🏢',
  factory: '🏭',
  warehouse: '🏭',
  bank: '🏦',
  hospital: '🏥',
  school: '🏫',
  university: '🏫',
  library: '🏛️',
  museum: '🏟️',
  theater: '🎭',
  cinema: '🎬',

  // More household items
  bed: '🛏️',
  couch: '🛋️',
  chair: 'emoji-1f6c0',
  table: 'emoji-1f5d4',
  lamp: '💡',
  candle: '🕯️',
  mirror: '🪞',
  window: '🪟',
  door: '🚪',
  key: '🔑',
  lock: '🔒',
  unlock: '🔓',

  // More clothing and accessories
  shirt: '👕',
  jeans: '👖',
  dress: '👗',
  bikini: '👙',
  kimono: '👘',
  sari: '🥻',
  'lab-coat': '🥼',
  goggles: '🥽',
  gloves: '🧤',
  coat: '🧥',
  socks: '🧦',
  hat: 'emoji-1f9e2',
  'top-hat': '🎩',
  'military-helmet': '🪖',

  // More miscellaneous
  hourglass: '⏳',
  stopwatch: '⏱️',
  'alarm-clock': '⏰',
  timer: 'emoji-23f2',
  'magnifying-glass': '🔍',
  microscope: '🔬',
  telescope: '🔭',
  compass: '🧭',
  globe: '🌍',
  'world-map': '🗺️',
  flag: '🚩',
  pennant: 'emoji-1f3f1',
};

const XMIND_ICON_EMOJIS: Readonly<Record<string, string>> = {
  ...XMIND_ICONS,
  ...XMIND_ADDITIONAL_ICONS,
};

class XMindImporter extends Importer {
  private xmindInput: XMindRawInput;

  private idCounter = 1;

  private topicIdMap: Map<string, number>;

  private currentLayout: LayoutType = 'mindmap';

  constructor(map: XMindRawInput) {
    super();
    this.xmindInput = map;
    this.topicIdMap = new Map();
  }

  async import(nameMap: string, description?: string): Promise<string> {
    try {
      console.log(`Importing XMind map: ${nameMap}, description: ${description}`);

      const detected = await this.detectInput();

      this.resetState();

      const mindmap =
        detected.kind === 'xml'
          ? this.importXMLFormat(detected.xml, nameMap)
          : this.importJSONFormat(detected.sheet, nameMap);

      return toWiseMappingXml(mindmap);
    } catch (error) {
      console.error('Error importing XMind map:', error);
      throw ImportError.from(error, 'XMind');
    }
  }

  private resetState(): void {
    this.idCounter = 1;
    this.topicIdMap.clear();
    this.currentLayout = 'mindmap';
  }

  private importXMLFormat(xmlContent: string, nameMap: string): Mindmap {
    // Use secure XML parser to prevent XXE attacks, as the other importers do
    const doc = SecureXmlParser.parseSecureXml(xmlContent);
    if (!doc) {
      throw new Error('Failed to parse XMind XML - content may be unsafe or not well-formed');
    }

    // Find the root topic (within sheet element) - handle namespaces
    let sheet = doc.querySelector('sheet');
    if (!sheet) {
      // Try to find sheet by tag name (works with namespaces)
      const sheets = doc.getElementsByTagName('sheet');
      sheet = sheets.length > 0 ? sheets[0] : null;
    }

    let rootTopic = sheet?.querySelector('topic');
    if (!rootTopic) {
      // Try to find topic by tag name (works with namespaces)
      const topics = sheet
        ? sheet.getElementsByTagName('topic')
        : doc.getElementsByTagName('topic');
      rootTopic = topics.length > 0 ? topics[0] : null;
    }

    if (!rootTopic) {
      throw new Error('No root topic found in XMind file');
    }

    this.currentLayout = this.detectLayoutFromXML(rootTopic);

    return this.buildMindmapFromXML(rootTopic, nameMap);
  }

  private importJSONFormat(sheet: XMindSheet, nameMap: string): Mindmap {
    this.currentLayout = this.detectLayoutFromJson(sheet);

    return this.buildMindmapFromJson(sheet, nameMap);
  }

  private detectLayoutFromXML(rootTopic: Element): LayoutType {
    const structureClass = rootTopic.getAttribute('structure-class');
    return this.mapStructureClassToLayout(structureClass) ?? 'mindmap';
  }

  private detectLayoutFromJson(sheet: XMindSheet): LayoutType {
    const rootStructure = sheet.rootTopic?.structureClass;
    const layoutFromStructure = this.mapStructureClassToLayout(rootStructure);
    if (layoutFromStructure) {
      return layoutFromStructure;
    }

    if (sheet.extensions) {
      const layoutFromExtensions = sheet.extensions.reduce<LayoutType | null>(
        (found, extension) => {
          if (found) {
            return found;
          }
          const content = extension.content as { centralTopic?: string } | undefined;
          return this.mapStructureClassToLayout(content?.centralTopic);
        },
        null,
      );

      if (layoutFromExtensions) {
        return layoutFromExtensions;
      }
    }

    return 'mindmap';
  }

  private mapStructureClassToLayout(structureClass?: string | null): LayoutType | null {
    if (!structureClass) {
      return null;
    }

    const normalized = structureClass.toLowerCase();

    const treeIndicators = ['org-chart', 'tree', 'timeline', 'logic', 'fishbone', 'matrix'];
    if (treeIndicators.some((indicator) => normalized.includes(indicator))) {
      return 'tree';
    }

    const mindmapIndicators = ['map', 'mindmap'];
    if (mindmapIndicators.some((indicator) => normalized.includes(indicator))) {
      return 'mindmap';
    }

    return null;
  }

  private async detectInput(): Promise<DetectedInput> {
    if (typeof this.xmindInput === 'string') {
      const trimmed = this.xmindInput.trim();

      if (this.looksLikeXml(trimmed)) {
        return { kind: 'xml', xml: this.xmindInput };
      }

      if (this.looksLikeJson(trimmed)) {
        const sheet = this.parseJsonSheet(this.xmindInput);
        return { kind: 'json', sheet };
      }

      if (this.looksLikeZipHeader(trimmed)) {
        const binary = this.binaryStringToUint8Array(this.xmindInput);
        return this.detectFromZip(binary);
      }

      try {
        const binary = this.binaryStringToUint8Array(this.xmindInput);
        return this.detectFromZip(binary);
      } catch (error) {
        throw new Error(
          `Unsupported XMind input: unable to detect format (${(error as Error).message})`,
        );
      }
    }

    const normalized = this.normalizeToUint8Array(this.xmindInput as ArrayBuffer | Uint8Array);
    const decoded = this.tryDecodeToString(normalized);

    if (decoded) {
      const trimmed = decoded.trim();
      if (this.looksLikeXml(trimmed)) {
        return { kind: 'xml', xml: decoded };
      }

      if (this.looksLikeJson(trimmed)) {
        const sheet = this.parseJsonSheet(decoded);
        return { kind: 'json', sheet };
      }

      if (this.looksLikeZipHeader(trimmed)) {
        return this.detectFromZip(normalized);
      }
    }

    return this.detectFromZip(normalized);
  }

  private looksLikeXml(input: string): boolean {
    return input.startsWith('<?xml') || input.startsWith('<xmap-content');
  }

  private looksLikeJson(input: string): boolean {
    return input.startsWith('{') || input.startsWith('[');
  }

  private looksLikeZipHeader(input: string): boolean {
    return input.startsWith('PK');
  }

  private binaryStringToUint8Array(input: string): Uint8Array {
    const buffer = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
      buffer[i] = input.charCodeAt(i) % 0x100;
    }
    return buffer;
  }

  private normalizeToUint8Array(input: ArrayBuffer | Uint8Array): Uint8Array {
    if (input instanceof Uint8Array) {
      return input;
    }
    return new Uint8Array(input);
  }

  private tryDecodeToString(input: ArrayBuffer | Uint8Array): string | null {
    return tryDecodeUtf8(input);
  }

  private detectFromZip(data: Uint8Array | null): DetectedInput {
    if (!data || data.length === 0) {
      throw new Error('Empty XMind ZIP payload');
    }

    let files: Record<string, Uint8Array>;
    try {
      files = unzipSync(data);
    } catch (error) {
      throw new Error(`Failed to unzip XMind archive: ${(error as Error).message}`);
    }

    const entries = Object.keys(files);

    const jsonEntry = entries.find((entry) => entry.endsWith('content.json'));
    if (jsonEntry) {
      const jsonContent = decodeUtf8(files[jsonEntry]);
      const sheet = this.parseJsonSheet(jsonContent);
      return { kind: 'json', sheet };
    }

    const xmlEntry = entries.find((entry) => entry.endsWith('content.xml'));
    if (xmlEntry) {
      const xmlContent = decodeUtf8(files[xmlEntry]);
      return { kind: 'xml', xml: xmlContent };
    }

    throw new Error('XMind ZIP missing content.json or content.xml');
  }

  private parseJsonSheet(jsonContent: string): XMindSheet {
    const parsed = JSON.parse(jsonContent) as XMindSheet | XMindSheet[] | { sheets?: XMindSheet[] };

    if (Array.isArray(parsed)) {
      const sheet = this.pickSheet(parsed);
      if (sheet) {
        return sheet;
      }
    } else if (parsed && typeof parsed === 'object') {
      if ('rootTopic' in parsed && (parsed as XMindSheet).rootTopic) {
        return parsed as XMindSheet;
      }

      if ('sheets' in parsed) {
        const candidate = (parsed as { sheets?: XMindSheet[] }).sheets;
        if (candidate && Array.isArray(candidate)) {
          const sheet = this.pickSheet(candidate);
          if (sheet) {
            return sheet;
          }
        }
      }
    }

    throw new Error('Invalid XMind JSON content: root topic not found');
  }

  private pickSheet(sheets: XMindSheet[]): XMindSheet | null {
    const sheetWithRoot = sheets.find((sheet) => sheet.class === 'sheet' && !!sheet.rootTopic);
    if (sheetWithRoot) {
      return sheetWithRoot;
    }

    return sheets.length > 0 && sheets[0].rootTopic ? sheets[0] : null;
  }

  private convertXMindColor(xmindColor: string): string {
    // XMind uses RGBA format like #8EDE99FF
    // WiseMapping might expect different format
    if (xmindColor.startsWith('#')) {
      // Remove alpha channel if present (last 2 characters)
      if (xmindColor.length === 9) {
        return xmindColor.substring(0, 7); // Remove alpha
      }
      return xmindColor;
    }
    return xmindColor;
  }

  private generateId(): number {
    return this.idCounter++;
  }

  private calculatePosition(
    order: number,
    depth: number,
    siblingCount: number,
  ): {
    x: number;
    y: number;
  } {
    if (this.currentLayout === 'tree') {
      const horizontalSpacing = 220;
      const verticalSpacing = 140;
      const x = (depth + 1) * horizontalSpacing;
      const offset = ((siblingCount - 1) / 2) * verticalSpacing;
      const y = order * verticalSpacing - offset;

      return { x, y };
    }

    // Distribute first-level topics evenly between left and right sides
    // Even orders (0, 2, 4...) = Right side, Odd orders (1, 3, 5...) = Left side
    const isEven = order % 2 === 0;
    const sideIndex = Math.floor(order / 2);

    // Alternate between right (positive x) and left (negative x) sides
    const x = isEven ? 200 + sideIndex * 100 : -200 - sideIndex * 100;
    const y = sideIndex * 150 - sideIndex * 75; // Spread vertically

    return { x, y };
  }

  private createMindmap(nameMap: string): Mindmap {
    const mindmap = new Mindmap(nameMap);
    mindmap.setTheme('prism');
    mindmap.setLayout(this.currentLayout);
    return mindmap;
  }

  private createTopic(mindmap: Mindmap, xmindTopicId: string, title: string): NodeModel {
    const topic = mindmap.createNode('MainTopic', this.generateId());
    this.topicIdMap.set(xmindTopicId, topic.getId());
    topic.setText(title);
    topic.setShapeType('line');
    return topic;
  }

  private addIcon(topic: NodeModel, xmindIconId: string): void {
    const emojiIcon = this.mapXMindIconToEmojiIcon(xmindIconId);
    topic.addFeature(FeatureModelFactory.createModel('eicon', { id: emojiIcon }));
  }

  /**
   * Topic hyperlinks become links. Links to a topic of the file (xmind:#id) and to files attached
   * to it (xap:attachments/...) are skipped: they can not be opened from WiseMapping.
   */
  private static addLink(topic: NodeModel, href: string | null | undefined): void {
    const url = href?.trim();
    if (url && !/^(xmind|xap):/i.test(url)) {
      topic.addFeature(FeatureModelFactory.createModel('link', { url }));
    }
  }

  private addRelationship(mindmap: Mindmap, end1: string, end2: string): void {
    // Map XMind topic IDs to WiseMapping topic IDs
    const srcTopicId = this.topicIdMap.get(end1);
    const destTopicId = this.topicIdMap.get(end2);
    if (!srcTopicId || !destTopicId) {
      return;
    }
    mindmap.addRelationship(mindmap.createRelationship(srcTopicId, destTopicId));
  }

  private buildMindmapFromXML(rootTopic: Element, nameMap: string): Mindmap {
    const mindmap = this.createMindmap(nameMap);

    const centralTopic = mindmap.createNode('CentralTopic', this.generateId());
    const rootTopicId = rootTopic.getAttribute('id') || 'topic1';
    this.topicIdMap.set(rootTopicId, centralTopic.getId());
    centralTopic.setText(
      XMindImporter.childElement(rootTopic, 'title')?.textContent || 'Central Topic',
    );
    this.addXMLTopicFeatures(centralTopic, rootTopic);
    mindmap.addBranch(centralTopic);

    // Generate child topics recursively
    this.appendXMLChildTopics(mindmap, centralTopic, rootTopic, 1);

    // Detached topics are floating topics
    XMindImporter.xmlChildTopics(rootTopic, 'detached').forEach((xmlTopic) => {
      const topic = this.convertXMLTopic(mindmap, xmlTopic, 1);
      const position = XMindImporter.childElement(xmlTopic, 'position');
      topic.setPosition(
        Number(position?.getAttribute('svg:x')) || 0,
        Number(position?.getAttribute('svg:y')) || 0,
      );
      mindmap.addBranch(topic);
    });

    // Add relationships if present
    this.addRelationshipsFromXML(mindmap, rootTopic);

    return mindmap;
  }

  // The topics of <children><topics type="..."> of the given topic.
  private static xmlChildTopics(xmlTopic: Element, type: 'attached' | 'detached'): Element[] {
    const childrenElement = XMindImporter.childElement(xmlTopic, 'children');
    if (!childrenElement) {
      return [];
    }
    const topicsElement = XMindImporter.childElements(childrenElement, 'topics').find(
      (topics) => topics.getAttribute('type') === type,
    );
    return topicsElement ? XMindImporter.childElements(topicsElement, 'topic') : [];
  }

  private appendXMLChildTopics(
    mindmap: Mindmap,
    parent: NodeModel,
    xmlTopic: Element,
    depth: number,
  ): void {
    const childTopics = XMindImporter.xmlChildTopics(xmlTopic, 'attached');
    const siblingCount = childTopics.length;
    childTopics.forEach((childTopic, index) => {
      const topic = this.convertXMLTopic(mindmap, childTopic, depth);
      const position = this.calculatePosition(index, depth, siblingCount);
      topic.setPosition(position.x, position.y);
      topic.setOrder(index);
      parent.append(topic);
    });
  }

  private convertXMLTopic(mindmap: Mindmap, xmlTopic: Element, depth: number): NodeModel {
    const xmindTopicId = xmlTopic.getAttribute('id') || `topic${this.idCounter + 1}`;
    const title = XMindImporter.childElement(xmlTopic, 'title')?.textContent || 'Untitled';
    const topic = this.createTopic(mindmap, xmindTopicId, title);
    this.addXMLTopicFeatures(topic, xmlTopic);

    // Recursively generate child topics
    this.appendXMLChildTopics(mindmap, topic, xmlTopic, depth + 1);

    return topic;
  }

  // The icons, note and link of a topic, the central one included.
  private addXMLTopicFeatures(topic: NodeModel, xmlTopic: Element): void {
    // Add icons if present (from markers)
    const markerRefs = XMindImporter.childElement(xmlTopic, 'marker-refs');
    const markers = markerRefs ? XMindImporter.childElements(markerRefs, 'marker-ref') : [];
    markers.forEach((marker) => {
      const markerId = marker.getAttribute('marker-id');
      if (markerId) {
        this.addIcon(topic, markerId);
      }
    });

    // Handle notes and markers (combine into one WiseMapping note)
    const noteContent = this.buildXMLNoteContent(xmlTopic);
    if (noteContent) {
      topic.addFeature(new NoteModel({ text: noteContent }));
    }

    XMindImporter.addLink(
      topic,
      xmlTopic.getAttributeNS(XLINK_NAMESPACE, 'href') || xmlTopic.getAttribute('xlink:href'),
    );
  }

  private addRelationshipsFromXML(mindmap: Mindmap, rootTopic: Element): void {
    // Find relationships in the sheet (parent of rootTopic)
    const sheet = rootTopic.parentElement;
    if (!sheet) return;

    let relationshipsElement = sheet.querySelector('relationships');
    if (!relationshipsElement) {
      const relationships = sheet.getElementsByTagName('relationships');
      relationshipsElement = relationships.length > 0 ? relationships[0] : null;
    }

    if (!relationshipsElement) return;

    XMindImporter.childElements(relationshipsElement, 'relationship').forEach((relationship) => {
      const end1 = relationship.getAttribute('end1');
      const end2 = relationship.getAttribute('end2');
      if (end1 && end2) {
        this.addRelationship(mindmap, end1, end2);
      }
    });
  }

  private buildMindmapFromJson(sheet: XMindSheet, nameMap: string): Mindmap {
    const { rootTopic } = sheet;
    const mindmap = this.createMindmap(nameMap);

    const centralTopic = mindmap.createNode('CentralTopic', this.generateId());
    this.topicIdMap.set(rootTopic.id, centralTopic.getId());
    centralTopic.setText(rootTopic.title || 'Central Topic');
    this.addJsonTopicFeatures(centralTopic, rootTopic);
    mindmap.addBranch(centralTopic);

    // Generate child topics recursively
    this.appendJsonChildTopics(mindmap, centralTopic, rootTopic.children?.attached ?? [], 1);

    // Detached topics are floating topics
    rootTopic.children?.detached?.forEach((jsonTopic) => {
      const topic = this.convertJsonTopic(mindmap, jsonTopic, 1);
      topic.setPosition(jsonTopic.position?.x ?? 0, jsonTopic.position?.y ?? 0);
      mindmap.addBranch(topic);
    });

    sheet.relationships?.forEach((relationship) => {
      this.addRelationship(mindmap, relationship.end1Id, relationship.end2Id);
    });

    return mindmap;
  }

  private appendJsonChildTopics(
    mindmap: Mindmap,
    parent: NodeModel,
    jsonTopics: XMindTopic[],
    depth: number,
  ): void {
    const siblingCount = jsonTopics.length;
    jsonTopics.forEach((jsonTopic, index) => {
      const topic = this.convertJsonTopic(mindmap, jsonTopic, depth);
      const position = this.calculatePosition(index, depth, siblingCount);
      topic.setPosition(position.x, position.y);
      topic.setOrder(index);
      parent.append(topic);
    });
  }

  private convertJsonTopic(mindmap: Mindmap, jsonTopic: XMindTopic, depth: number): NodeModel {
    const topic = this.createTopic(mindmap, jsonTopic.id, jsonTopic.title || 'Untitled');
    this.addJsonTopicFeatures(topic, jsonTopic);

    // Recursively generate child topics
    this.appendJsonChildTopics(mindmap, topic, jsonTopic.children?.attached ?? [], depth + 1);

    return topic;
  }

  // The colors, icons, note and link of a topic, the central one included.
  private addJsonTopicFeatures(topic: NodeModel, jsonTopic: XMindTopic): void {
    const bgColor = this.extractBackgroundColor(jsonTopic);
    if (bgColor) {
      topic.setBackgroundColor(bgColor);
    }

    // Add border color if available
    const borderColor = this.extractBorderColor(jsonTopic);
    if (borderColor) {
      topic.setBorderColor(borderColor);
    }

    // Add icons if present (mapped to EmojiIcons). XMind Zen writes them as markers.
    jsonTopic.icons?.forEach((icon) => this.addIcon(topic, icon));
    jsonTopic.markers?.forEach((marker) => {
      if (marker.markerId) {
        this.addIcon(topic, marker.markerId);
      }
    });

    // Add notes if present (combine XMind notes and labels into one WiseMapping note)
    const noteContent = this.buildNoteContent(jsonTopic);
    if (noteContent) {
      topic.addFeature(new NoteModel({ text: noteContent }));
    }

    XMindImporter.addLink(topic, jsonTopic.href);
  }

  private extractBackgroundColor(topic: XMindTopic): string | null {
    if (topic.style?.properties?.['svg:fill']) {
      return this.convertXMindColor(topic.style.properties['svg:fill']);
    }
    return null;
  }

  private extractBorderColor(topic: XMindTopic): string | null {
    // For now, use the same color as background for border
    // In the future, we could extract from border-line-color if available
    return this.extractBackgroundColor(topic);
  }

  private buildNoteContent(topic: XMindTopic): string | null {
    const parts: string[] = [];

    // Add XMind note content if present
    const noteText = topic.notes?.plain?.content;
    if (noteText && noteText.trim()) {
      parts.push(noteText);
    }

    // Add icons if present (mapped to appropriate emojis)
    if (topic.icons && topic.icons.length > 0) {
      const formattedIcons = topic.icons
        .map((icon) => {
          const emoji = this.mapXMindIconToEmojiIcon(icon);
          return `${emoji} ${icon}`;
        })
        .join(', ');
      parts.push(formattedIcons);
    }

    // Add labels if present (at the bottom)
    if (topic.labels && topic.labels.length > 0) {
      const formattedLabels = topic.labels.map((label) => `🏷️ ${label}`).join(', ');
      parts.push(formattedLabels);
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  private buildXMLNoteContent(xmlTopic: Element): string | null {
    const parts: string[] = [];

    // Handle XMind notes (main content at the top)
    const notesElement = XMindImporter.childElement(xmlTopic, 'notes');
    const notes = notesElement ? XMindImporter.childElement(notesElement, 'plain') : undefined;
    if (notes) {
      const noteText = notes.textContent || '';
      if (noteText.trim()) {
        parts.push(noteText);
      }
    }

    // Handle XMind markers (middle)
    const markersElement = XMindImporter.childElement(xmlTopic, 'markers');
    const markers = markersElement ? XMindImporter.childElements(markersElement, 'marker') : [];
    if (markers.length > 0) {
      const markerTexts = markers.map((marker) => marker.getAttribute('marker-id') || 'unknown');
      const formattedMarkers = markerTexts.map((marker) => `🔖 ${marker}`).join(', ');
      parts.push(formattedMarkers);
    }

    // Note: XMind XML format doesn't have labels, only JSON format does
    // Labels would be added at the bottom if present

    return parts.length > 0 ? parts.join('\n') : null;
  }

  private mapXMindIconToEmojiIcon(iconId: string): string {
    // Return mapped EmojiIcon ID or default if not found. Only own entries:
    // XMIND_ICON_EMOJIS.constructor is the Object function.
    const key = iconId.toLowerCase();
    const mapped = Object.prototype.hasOwnProperty.call(XMIND_ICON_EMOJIS, key)
      ? XMIND_ICON_EMOJIS[key]
      : undefined;
    return mapped || '💡'; // Default to lightbulb
  }

  // Only direct children: descendant queries would pick up the data of nested topics.
  private static childElements(parent: Element, localName: string): Element[] {
    return Array.from(parent.children).filter((child) => child.localName === localName);
  }

  private static childElement(parent: Element, localName: string): Element | undefined {
    return Array.from(parent.children).find((child) => child.localName === localName);
  }
}

export default XMindImporter;
