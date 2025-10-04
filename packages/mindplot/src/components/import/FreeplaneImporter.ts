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
import Importer from './Importer';
import SecureXmlParser from '../security/SecureXmlParser';

class FreeplaneImporter extends Importer {
  private freeplaneInput: string;

  private idCounter: number = 1;

  constructor(map: string) {
    super();
    this.freeplaneInput = map;
  }

  import(nameMap: string, _description?: string): Promise<string> {
    try {
      // Use secure XML parser to prevent XXE attacks
      const freeplaneDoc = SecureXmlParser.parseSecureXml(this.freeplaneInput);
      if (!freeplaneDoc) {
        throw new Error('Failed to parse Freeplane XML - content may be unsafe');
      }

      // Find the root node
      const rootNode = freeplaneDoc.querySelector('node');
      if (!rootNode) {
        throw new Error('No root node found in Freeplane XML');
      }

      // Generate WiseMapping XML directly
      const wiseMappingXML = this.generateWiseMappingXML(rootNode, nameMap);

      return Promise.resolve(wiseMappingXML);
    } catch (error) {
      console.error('Error importing Freeplane map:', error);
      // Fallback to basic map
      return Promise.resolve(this.createFallbackMap(nameMap, error as Error));
    }
  }

  private generateWiseMappingXML(rootNode: Element, mapName: string): string {
    const centralTitle = rootNode.getAttribute('TEXT') || 'Central Topic';
    const centralId = this.generateId();

    let xml = `<map name="${this.escapeXml(mapName)}" version="tango" theme="prism">\n`;
    xml += `    <topic central="true" text="${this.escapeXml(centralTitle)}" id="${centralId}">\n`;

    // Process child nodes
    const childNodes = rootNode.querySelectorAll(':scope > node');
    childNodes.forEach((childNode, index) => {
      xml += this.generateChildTopicXML(childNode as Element, index);
    });

    xml += '    </topic>\n';
    xml += '</map>';

    return xml;
  }

  private generateChildTopicXML(freeplaneNode: Element, order: number, depth: number = 0): string {
    const topicId = this.generateId();
    const title = freeplaneNode.getAttribute('TEXT') || 'Untitled';
    const position = this.calculatePosition(order);

    const indent = '        '.repeat(depth + 1);
    let xml = `${indent}<topic position="${position.x},${position.y}" order="${order}" text="${this.escapeXml(title)}" shape="line" id="${topicId}">\n`;

    // Add icons if present
    const icons = freeplaneNode.querySelectorAll('icon');
    if (icons.length > 0) {
      icons.forEach((icon) => {
        const builtin = icon.getAttribute('BUILTIN');
        if (builtin) {
          const emojiIcon = this.mapFreeplaneIconToEmojiIcon(builtin);
          xml += `${indent}    <eicon id="${emojiIcon}"/>\n`;
        }
      });
    }

    // Add notes if present
    const noteContent = this.buildNoteContent(freeplaneNode);
    if (noteContent) {
      xml += `${indent}    <note><![CDATA[${noteContent}]]></note>\n`;
    }

    // Add links if present
    const link = freeplaneNode.getAttribute('LINK');
    if (link) {
      xml += `${indent}    <link url="${this.escapeXml(link)}" urlType="url"/>\n`;
    }

    // Process child nodes recursively
    const childNodes = freeplaneNode.querySelectorAll(':scope > node');
    childNodes.forEach((childNode, childIndex) => {
      xml += this.generateChildTopicXML(childNode as Element, childIndex, depth + 1);
    });

    xml += `${indent}</topic>\n`;

    return xml;
  }

  private buildNoteContent(freeplaneNode: Element): string | null {
    const parts: string[] = [];

    // Handle Freeplane notes
    const noteElements = freeplaneNode.querySelectorAll('richcontent[TYPE="NOTE"]');
    noteElements.forEach((noteElement) => {
      const htmlContent = noteElement.innerHTML;
      if (htmlContent) {
        // For simple HTML like <p>text</p>, preserve the original format
        // Don't sanitize for now to preserve the exact format
        const trimmedContent = htmlContent.trim();
        if (trimmedContent) {
          parts.push(trimmedContent);
        }
      }
    });

    return parts.length > 0 ? parts.join('\n') : null;
  }

  private mapFreeplaneIconToEmojiIcon(builtin: string): string {
    const iconMap: Record<string, string> = {
      // Priority and status icons
      flag_red: '🔴',
      flag_yellow: '🟡',
      flag_green: '🟢',
      flag_blue: '🔵',
      flag_orange: '🟠',
      flag_pink: '🩷',
      flag_purple: '🟣',

      // Star and rating icons
      star: '⭐',
      star_yellow: '⭐',
      star_red: '⭐',
      star_green: '⭐',
      star_blue: '⭐',

      // Task and completion icons
      task: '📋',
      task_done: '✅',
      task_start: '🟡',
      task_pause: '⏸️',
      task_stop: '⏹️',

      // Arrow and direction icons
      arrow_up: '⬆️',
      arrow_down: '⬇️',
      arrow_left: '⬅️',
      arrow_right: '➡️',
      arrow_up_right: '↗️',
      arrow_down_right: '↘️',
      arrow_down_left: '↙️',
      arrow_up_left: '↖️',

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
      number_1: '1️⃣',
      number_2: '2️⃣',
      number_3: '3️⃣',
      number_4: '4️⃣',
      number_5: '5️⃣',
      number_6: '6️⃣',
      number_7: '7️⃣',
      number_8: '8️⃣',
      number_9: '9️⃣',
      number_10: '🔟',

      // Letters (A-Z)
      letter_a: '🅰️',
      letter_b: '🅱️',
      letter_c: '🅲',
      letter_d: '🅳',
      letter_e: '🅴',
      letter_f: '🅵',
      letter_g: '🅶',
      letter_h: '🅷',
      letter_i: '🅸',
      letter_j: '🅹',
      letter_k: '🅺',
      letter_l: '🅻',
      letter_m: '🅼',
      letter_n: '🅽',
      letter_o: '🅾️',
      letter_p: '🅿️',
      letter_q: '🆀',
      letter_r: '🆁',
      letter_s: '🆂',
      letter_t: '🆃',
      letter_u: '🆄',
      letter_v: '🆅',
      letter_w: '🆆',
      letter_x: '🆇',
      letter_y: '🆈',
      letter_z: '🆉',

      // People icons
      people: '👥',
      person: '👤',
      person_1: '👤',
      person_2: '👥',
      person_3: '👥',

      // Time and calendar icons
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
      phone_mobile: '📱',
      tablet: '📱',

      // Weather icons
      sun: '☀️',
      cloud: '☁️',
      rain: '🌧️',
      snow: '❄️',
      storm: '⛈️',
      rainbow: '🌈',
      sunny: '🌞',
      partly_cloudy: '⛅',
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
      ice_cream: '🍦',
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
      martial_arts: '🥋',
      archery: '🏹',
      fishing: '🎣',
      hiking: '🧖',
      camping: '🏕️',
      picnic: '🍽️',
      barbecue: '🍳',
      target: '🎯',
      trophy: '🏆',
      medal: '🏅',
      first_place: '🥇',
      second_place: '🥈',
      third_place: '🥉',

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
      credit_card: '💳',

      // Security and safety icons
      security: '🔒',
      shield: '🛡️',
      lock_closed: '🔒',
      lock_open: '🔓',

      // Science and education icons
      science: '🔬',
      microscope: '🔬',
      telescope: '🔭',
      atom: '⚛️',
      book_open: '📖',
      graduation: '🎓',
    };

    // Return mapped emoji or default if not found
    return iconMap[builtin.toLowerCase()] || '💡'; // Default to lightbulb
  }

  private generateId(): string {
    return (this.idCounter++).toString();
  }

  private calculatePosition(order: number): { x: number; y: number } {
    // Distribute first-level topics evenly between left and right sides
    // Even orders (0, 2, 4...) = Right side, Odd orders (1, 3, 5...) = Left side
    const isEven = order % 2 === 0;
    const sideIndex = Math.floor(order / 2);

    // Alternate between right (positive x) and left (negative x) sides
    const x = isEven ? 200 + sideIndex * 100 : -200 - sideIndex * 100;
    const y = sideIndex * 150 - sideIndex * 75; // Spread vertically

    return { x, y };
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private createFallbackMap(nameMap: string, error: Error): string {
    return `<map name="${this.escapeXml(nameMap)}" version="tango">
        <topic central="true" text="Freeplane Import Error" id="1">
            <note><![CDATA[Freeplane import failed: ${this.escapeXml(error.message)}
Please check the file format and try again.]]></note>
        </topic>
    </map>`;
  }
}

export default FreeplaneImporter;
