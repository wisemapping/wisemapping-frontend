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

/** The value of an own entry of an icon table: a table also inherits constructor, toString... */
export const ownEntry = (
  table: Readonly<Record<string, string>>,
  key: string,
): string | undefined =>
  Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;

const prefixed = (
  prefix: string,
  table: Readonly<Record<string, string>>,
): Record<string, string> =>
  Object.fromEntries(Object.entries(table).map(([key, emoji]) => [`${prefix}${key}`, emoji]));

/** 1 to 9 as keycap emoji (the digit, the emoji variation selector and U+20E3), 10 as 🔟. */
export const NUMBER_EMOJIS: Readonly<Record<string, string>> = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;
    return [String(number), number === 10 ? '🔟' : `${number}\uFE0F\u20E3`];
  }),
);

/**
 * a to z as the negative squared Latin capital letters, 🅰 (U+1F170) to 🆉. A, B, O and P are
 * emoji written with the emoji variation selector, the others are symbols.
 */
export const LETTER_EMOJIS: Readonly<Record<string, string>> = Object.fromEntries(
  Array.from('abcdefghijklmnopqrstuvwxyz', (letter, index) => [
    letter,
    String.fromCodePoint(0x1f170 + index) + ('abop'.includes(letter) ? '\uFE0F' : ''),
  ]),
);

/** priority-1 to priority-5, from the highest. */
export const PRIORITY_EMOJIS: Readonly<Record<string, string>> = {
  'priority-1': '🔴',
  'priority-2': '🟡',
  'priority-3': '🟢',
  'priority-4': '🔵',
  'priority-5': '🟣',
};

/**
 * Icons named after what they show (smile, arrow-up, coffee...) and their emoji, for the XMind
 * importer. Lower case, words separated by hyphens.
 */
export const NAMED_ICON_EMOJIS: Readonly<Record<string, string>> = {
  // Flag and star icons
  'flag-yellow': '🟡',
  'flag-green': '🟢',
  'flag-blue': '🔵',
  star: '⭐',

  // Task and completion icons
  task: '📋',
  'task-done': '✅',
  'task-start': '🟡',
  'task-pause': '⏸️',
  'task-stop': '⏹️',

  // Arrow and direction icons
  'arrow-up': '⬆️',
  'arrow-down': '⬇️',
  'arrow-left': '⬅️',
  'arrow-right': '➡️',
  'arrow-up-right': '↗️',
  'arrow-down-right': '↘️',
  'arrow-down-left': '↙️',
  'arrow-up-left': '↖️',

  // Symbol icons
  smile: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  confused: '😕',
  thinking: '🤔',
  happy: '😃',
  laughing: '😂',
  wink: '😉',
  kiss: '😘',
  love: '😍',
  cool: '😎',
  sleepy: '😪',
  tired: '😴',
  worried: '😟',
  crying: '😭',
  screaming: '😱',
  neutral: '😐',
  expressionless: '😑',

  // Numbers (1-10)
  ...prefixed('number-', NUMBER_EMOJIS),

  // Letters (A-Z)
  ...prefixed('letter-', LETTER_EMOJIS),

  // People icons
  people: '👥',
  person: '👤',
  'person-1': '👤',
  'person-2': '👥',
  'person-3': '👥',

  // Time and communication icons
  clock: '🕐',
  calendar: '📅',
  time: '⏰',
  phone: '📞',
  email: '📧',
  message: '💬',
  chat: '💬',

  // File and document icons
  file: '📄',
  folder: '📁',
  attachment: '📎',
  link: '🔗',

  // Warning and info icons
  warning: '⚠️',
  info: 'ℹ️',
  question: '❓',
  exclamation: '❗',

  // Heart and like icons
  heart: '❤️',
  like: '👍',
  dislike: '👎',

  // Idea and lightbulb icons
  lightbulb: '💡',
  idea: '💡',
  bulb: '💡',

  // Money and currency icons
  money: '💰',
  dollar: '💲',
  euro: '💶',
  pound: '💷',

  // Location and building icons
  location: '📍',
  home: '🏠',
  building: '🏢',
  school: '🏫',

  // Technology icons
  computer: '💻',
  laptop: '💻',
  'phone-mobile': '📱',
  tablet: '📱',

  // Weather icons
  sun: '☀️',
  cloud: '☁️',
  rain: '🌧️',
  snow: '❄️',
  storm: '⛈️',
  rainbow: '🌈',
  sunny: '🌞',
  'partly-cloudy': '⛅',
  cloudy: '🌥️',
  lightning: '⚡',
  tornado: '🌪️',
  fog: '🌫️',
  wind: '🌬️',
  thermometer: '🌡️',

  // Animals
  dog: '🐶',
  cat: '🐱',
  mouse: '🐭',
  hamster: '🐹',
  rabbit: '🐰',
  fox: '🦊',
  bear: '🐻',
  panda: '🐼',
  koala: '🐨',
  lion: '🦁',
  tiger: '🐯',
  cow: '🐮',
  pig: '🐷',
  frog: '🐸',
  monkey: '🐵',
  chicken: '🐔',
  penguin: '🐧',
  bird: '🐦',
  fish: '🐟',
  whale: '🐳',
  dolphin: '🐬',
  octopus: '🐙',
  spider: '🕷️',
  bug: '🐛',
  bee: '🐝',
  butterfly: '🦋',
  snail: '🐌',
  turtle: '🐢',
  snake: '🐍',
  dragon: '🐉',
  unicorn: '🦄',

  // Food and drink icons
  coffee: '☕',
  food: '🍽️',
  pizza: '🍕',
  burger: '🍔',
  apple: '🍎',
  orange: '🍊',
  banana: '🍌',
  grapes: '🍇',
  strawberry: '🍓',
  kiwi: '🥝',
  peach: '🍑',
  coconut: '🥥',
  cherry: '🍒',
  lemon: '🍋',
  watermelon: '🍉',
  pineapple: '🍍',
  bread: '🍞',
  cookie: '🍪',
  candy: '🍬',
  chocolate: '🍫',
  'ice-cream': '🍦',
  popcorn: '🍿',
  beer: '🍺',
  wine: '🍷',
  cocktail: '🍸',
  tea: '🍵',
  milk: '🥛',
  water: '💧',

  // Sports and activity icons
  sports: '⚽',
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  swimming: '🏊',
  soccer: '⚽',
  baseball: '⚾',
  volleyball: '🏐',
  rugby: '🏈',
  golf: '⛳',
  bowling: '🎳',
  running: '🏃',
  cycling: '🚴',
  skiing: '⛷️',
  snowboarding: '🏂',
  surfing: '🏄',
  climbing: '🧗',
  yoga: '🧘',
  dancing: '💃',
  gym: '🏋️',
  weightlifting: '🏋️',
  boxing: '🥊',
  'martial-arts': '🥋',
  archery: '🏹',
  fishing: '🎣',
  hiking: '🧖',
  camping: '🏕️',
  picnic: '🍽️',
  barbecue: '🍳',
  target: '🎯',
  trophy: '🏆',
  medal: '🏅',
  'first-place': '🥇',
  'second-place': '🥈',
  'third-place': '🥉',

  // Music and entertainment icons
  music: '🎵',
  movie: '🎬',
  game: '🎮',
  book: '📚',

  // Travel and transport icons
  car: '🚗',
  plane: '✈️',
  train: '🚂',
  bus: '🚌',
  bike: '🚲',

  // Nature icons
  tree: '🌳',
  flower: '🌸',
  leaf: '🍃',
  mountain: '⛰️',
  ocean: '🌊',

  // Holiday and celebration icons
  gift: '🎁',
  cake: '🎂',
  party: '🎉',
  fireworks: '🎆',
  christmas: '🎄',
  halloween: '🎃',

  // Tools and work icons
  tool: '🔧',
  wrench: '🔧',
  hammer: '🔨',
  screwdriver: '🔩',
  key: '🔑',
  lock: '🔒',

  // Medical and health icons
  medical: '🏥',
  health: '💊',
  pill: '💊',
  heartbeat: '💓',
  cross: '➕',

  // Shopping and commerce icons
  shopping: '🛒',
  cart: '🛒',
  bag: '👜',
  'credit-card': '💳',

  // Security and safety icons
  security: '🔒',
  shield: '🛡️',
  'lock-closed': '🔒',
  'lock-open': '🔓',

  // Science and education icons
  science: '🔬',
  microscope: '🔬',
  telescope: '🔭',
  atom: '⚛️',
  'book-open': '📖',
  graduation: '🎓',
};
