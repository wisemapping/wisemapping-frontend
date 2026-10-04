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

import FreeplaneImporter from '../../../src/components/import/FreeplaneImporter';

describe('Freeplane Icon Mapping Tests', () => {
  let importer: FreeplaneImporter;

  beforeEach(() => {
    importer = new FreeplaneImporter('');
  });

  describe('Icon Mapping Functionality', () => {
    test('should map priority and status icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('flag_red')).toBe('🔴'); // 🔴
      expect(mapIcon('flag_yellow')).toBe('🟡'); // 🟡
      expect(mapIcon('flag_green')).toBe('🟢'); // 🟢
      expect(mapIcon('flag_blue')).toBe('🔵'); // 🔵
      expect(mapIcon('flag_orange')).toBe('🟠'); // 🟠
      expect(mapIcon('flag_pink')).toBe('🩷'); // 🩷
      expect(mapIcon('flag_purple')).toBe('🟣'); // 🟣
    });

    test('should map star and rating icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('star')).toBe('⭐'); // ⭐
      expect(mapIcon('star_yellow')).toBe('⭐'); // ⭐
      expect(mapIcon('star_red')).toBe('⭐'); // ⭐
      expect(mapIcon('star_green')).toBe('⭐'); // ⭐
      expect(mapIcon('star_blue')).toBe('⭐'); // ⭐
    });

    test('should map task and completion icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('task')).toBe('📋'); // 📋
      expect(mapIcon('task_done')).toBe('✅'); // ✅
      expect(mapIcon('task_start')).toBe('🟡'); // 🟡
      expect(mapIcon('task_pause')).toBe('⏸️'); // ⏸️
      expect(mapIcon('task_stop')).toBe('⏹️'); // ⏹️
    });

    test('should map arrow and direction icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('arrow_up')).toBe('⬆️'); // ⬆️
      expect(mapIcon('arrow_down')).toBe('⬇️'); // ⬇️
      expect(mapIcon('arrow_left')).toBe('⬅️'); // ⬅️
      expect(mapIcon('arrow_right')).toBe('➡️'); // ➡️
      expect(mapIcon('arrow_up_right')).toBe('↗️'); // ↗️
      expect(mapIcon('arrow_down_right')).toBe('↘️'); // ↘️
      expect(mapIcon('arrow_down_left')).toBe('↙️'); // ↙️
      expect(mapIcon('arrow_up_left')).toBe('↖️'); // ↖️
    });

    test('should map emotion icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('smile')).toBe('😊'); // 😊
      expect(mapIcon('sad')).toBe('😢'); // 😢
      expect(mapIcon('angry')).toBe('😠'); // 😠
      expect(mapIcon('surprised')).toBe('😲'); // 😲
      expect(mapIcon('confused')).toBe('😕'); // 😕
      expect(mapIcon('thinking')).toBe('🤔'); // 🤔
      expect(mapIcon('happy')).toBe('😃'); // 😃
      expect(mapIcon('laughing')).toBe('😂'); // 😂
      expect(mapIcon('wink')).toBe('😉'); // 😉
      expect(mapIcon('kiss')).toBe('😘'); // 😘
      expect(mapIcon('love')).toBe('😍'); // 😍
      expect(mapIcon('cool')).toBe('😎'); // 😎
      expect(mapIcon('sleepy')).toBe('😪'); // 😪
      expect(mapIcon('tired')).toBe('😴'); // 😴
      expect(mapIcon('worried')).toBe('😟'); // 😟
      expect(mapIcon('crying')).toBe('😭'); // 😭
      expect(mapIcon('screaming')).toBe('😱'); // 😱
      expect(mapIcon('neutral')).toBe('😐'); // 😐
      expect(mapIcon('expressionless')).toBe('😑'); // 😑
    });

    test('should map number icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('number_1')).toBe('1️⃣'); // 1️⃣
      expect(mapIcon('number_2')).toBe('2️⃣'); // 2️⃣
      expect(mapIcon('number_3')).toBe('3️⃣'); // 3️⃣
      expect(mapIcon('number_4')).toBe('4️⃣'); // 4️⃣
      expect(mapIcon('number_5')).toBe('5️⃣'); // 5️⃣
      expect(mapIcon('number_6')).toBe('6️⃣'); // 6️⃣
      expect(mapIcon('number_7')).toBe('7️⃣'); // 7️⃣
      expect(mapIcon('number_8')).toBe('8️⃣'); // 8️⃣
      expect(mapIcon('number_9')).toBe('9️⃣'); // 9️⃣
      expect(mapIcon('number_10')).toBe('🔟'); // 🔟
    });

    test('should map letter icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('letter_a')).toBe('🅰️'); // 🅰️
      expect(mapIcon('letter_b')).toBe('🅱️'); // 🅱️
      expect(mapIcon('letter_c')).toBe('🅲'); // 🅲
      expect(mapIcon('letter_d')).toBe('🅳'); // 🅳
      expect(mapIcon('letter_e')).toBe('🅴'); // 🅴
      expect(mapIcon('letter_f')).toBe('🅵'); // 🅵
      expect(mapIcon('letter_g')).toBe('🅶'); // 🅶
      expect(mapIcon('letter_h')).toBe('🅷'); // 🅷
      expect(mapIcon('letter_i')).toBe('🅸'); // 🅸
      expect(mapIcon('letter_j')).toBe('🅹'); // 🅹
      expect(mapIcon('letter_k')).toBe('🅺'); // 🅺
      expect(mapIcon('letter_l')).toBe('🅻'); // 🅻
      expect(mapIcon('letter_m')).toBe('🅼'); // 🅼
      expect(mapIcon('letter_n')).toBe('🅽'); // 🅽
      expect(mapIcon('letter_o')).toBe('🅾️'); // 🅾️
      expect(mapIcon('letter_p')).toBe('🅿️'); // 🅿️
      expect(mapIcon('letter_q')).toBe('🆀'); // 🆀
      expect(mapIcon('letter_r')).toBe('🆁'); // 🆁
      expect(mapIcon('letter_s')).toBe('🆂'); // 🆂
      expect(mapIcon('letter_t')).toBe('🆃'); // 🆃
      expect(mapIcon('letter_u')).toBe('🆄'); // 🆄
      expect(mapIcon('letter_v')).toBe('🆅'); // 🆅
      expect(mapIcon('letter_w')).toBe('🆆'); // 🆆
      expect(mapIcon('letter_x')).toBe('🆇'); // 🆇
      expect(mapIcon('letter_y')).toBe('🆈'); // 🆈
      expect(mapIcon('letter_z')).toBe('🆉'); // 🆉
    });

    test('should map people icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('people')).toBe('👥'); // 👥
      expect(mapIcon('person')).toBe('👤'); // 👤
      expect(mapIcon('person_1')).toBe('👤'); // 👤
      expect(mapIcon('person_2')).toBe('👥'); // 👥
      expect(mapIcon('person_3')).toBe('👥'); // 👥
    });

    test('should map time and calendar icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('clock')).toBe('🕐'); // 🕐
      expect(mapIcon('calendar')).toBe('📅'); // 📅
      expect(mapIcon('time')).toBe('⏰'); // ⏰
      expect(mapIcon('phone')).toBe('📞'); // 📞
      expect(mapIcon('email')).toBe('📧'); // 📧
      expect(mapIcon('message')).toBe('💬'); // 💬
      expect(mapIcon('chat')).toBe('💬'); // 💬
    });

    test('should map file and document icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('file')).toBe('📄'); // 📄
      expect(mapIcon('folder')).toBe('📁'); // 📁
      expect(mapIcon('attachment')).toBe('📎'); // 📎
      expect(mapIcon('link')).toBe('🔗'); // 🔗
    });

    test('should map warning and info icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('warning')).toBe('⚠️'); // ⚠️
      expect(mapIcon('info')).toBe('ℹ️'); // ℹ️
      expect(mapIcon('question')).toBe('❓'); // ❓
      expect(mapIcon('exclamation')).toBe('❗'); // ❗
    });

    test('should map heart and like icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('heart')).toBe('❤️'); // ❤️
      expect(mapIcon('like')).toBe('👍'); // 👍
      expect(mapIcon('dislike')).toBe('👎'); // 👎
    });

    test('should map idea and lightbulb icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('lightbulb')).toBe('💡'); // 💡
      expect(mapIcon('idea')).toBe('💡'); // 💡
      expect(mapIcon('bulb')).toBe('💡'); // 💡
    });

    test('should map money and currency icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('money')).toBe('💰'); // 💰
      expect(mapIcon('dollar')).toBe('💲'); // 💲
      expect(mapIcon('euro')).toBe('💶'); // 💶
      expect(mapIcon('pound')).toBe('💷'); // 💷
    });

    test('should map location and building icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('location')).toBe('📍'); // 📍
      expect(mapIcon('home')).toBe('🏠'); // 🏠
      expect(mapIcon('building')).toBe('🏢'); // 🏢
      expect(mapIcon('school')).toBe('🏫'); // 🏫
    });

    test('should map technology icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('computer')).toBe('💻'); // 💻
      expect(mapIcon('laptop')).toBe('💻'); // 💻
      expect(mapIcon('phone_mobile')).toBe('📱'); // 📱
      expect(mapIcon('tablet')).toBe('📱'); // 📱
    });

    test('should map weather icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('sun')).toBe('☀️'); // ☀️
      expect(mapIcon('cloud')).toBe('☁️'); // ☁️
      expect(mapIcon('rain')).toBe('🌧️'); // 🌧️
      expect(mapIcon('snow')).toBe('❄️'); // ❄️
      expect(mapIcon('storm')).toBe('⛈️'); // ⛈️
      expect(mapIcon('rainbow')).toBe('🌈'); // 🌈
      expect(mapIcon('sunny')).toBe('🌞'); // 🌞
      expect(mapIcon('partly_cloudy')).toBe('⛅'); // ⛅
      expect(mapIcon('cloudy')).toBe('🌥️'); // 🌥️
      expect(mapIcon('lightning')).toBe('⚡'); // ⚡
      expect(mapIcon('tornado')).toBe('🌪️'); // 🌪️
      expect(mapIcon('fog')).toBe('🌫️'); // 🌫️
      expect(mapIcon('wind')).toBe('🌬️'); // 🌬️
      expect(mapIcon('thermometer')).toBe('🌡️'); // 🌡️
    });

    test('should map animal icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('dog')).toBe('🐶'); // 🐶
      expect(mapIcon('cat')).toBe('🐱'); // 🐱
      expect(mapIcon('mouse')).toBe('🐭'); // 🐭
      expect(mapIcon('hamster')).toBe('🐹'); // 🐹
      expect(mapIcon('rabbit')).toBe('🐰'); // 🐰
      expect(mapIcon('fox')).toBe('🦊'); // 🦊
      expect(mapIcon('bear')).toBe('🐻'); // 🐻
      expect(mapIcon('panda')).toBe('🐼'); // 🐼
      expect(mapIcon('koala')).toBe('🐨'); // 🐨
      expect(mapIcon('lion')).toBe('🦁'); // 🦁
      expect(mapIcon('tiger')).toBe('🐯'); // 🐯
      expect(mapIcon('cow')).toBe('🐮'); // 🐮
      expect(mapIcon('pig')).toBe('🐷'); // 🐷
      expect(mapIcon('frog')).toBe('🐸'); // 🐸
      expect(mapIcon('monkey')).toBe('🐵'); // 🐵
      expect(mapIcon('chicken')).toBe('🐔'); // 🐔
      expect(mapIcon('penguin')).toBe('🐧'); // 🐧
      expect(mapIcon('bird')).toBe('🐦'); // 🐦
      expect(mapIcon('fish')).toBe('🐟'); // 🐟
      expect(mapIcon('whale')).toBe('🐳'); // 🐳
      expect(mapIcon('dolphin')).toBe('🐬'); // 🐬
      expect(mapIcon('octopus')).toBe('🐙'); // 🐙
      expect(mapIcon('spider')).toBe('🕷️'); // 🕷️
      expect(mapIcon('bug')).toBe('🐛'); // 🐛
      expect(mapIcon('bee')).toBe('🐝'); // 🐝
      expect(mapIcon('butterfly')).toBe('🦋'); // 🦋
      expect(mapIcon('snail')).toBe('🐌'); // 🐌
      expect(mapIcon('turtle')).toBe('🐢'); // 🐢
      expect(mapIcon('snake')).toBe('🐍'); // 🐍
      expect(mapIcon('dragon')).toBe('🐉'); // 🐉
      expect(mapIcon('unicorn')).toBe('🦄'); // 🦄
    });

    test('should map food and drink icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('coffee')).toBe('☕'); // ☕
      expect(mapIcon('food')).toBe('🍽️'); // 🍽️
      expect(mapIcon('pizza')).toBe('🍕'); // 🍕
      expect(mapIcon('burger')).toBe('🍔'); // 🍔
      expect(mapIcon('apple')).toBe('🍎'); // 🍎
      expect(mapIcon('orange')).toBe('🍊'); // 🍊
      expect(mapIcon('banana')).toBe('🍌'); // 🍌
      expect(mapIcon('grapes')).toBe('🍇'); // 🍇
      expect(mapIcon('strawberry')).toBe('🍓'); // 🍓
      expect(mapIcon('kiwi')).toBe('🥝'); // 🥝
      expect(mapIcon('peach')).toBe('🍑'); // 🍑
      expect(mapIcon('coconut')).toBe('🥥'); // 🥥
      expect(mapIcon('cherry')).toBe('🍒'); // 🍒
      expect(mapIcon('lemon')).toBe('🍋'); // 🍋
      expect(mapIcon('watermelon')).toBe('🍉'); // 🍉
      expect(mapIcon('pineapple')).toBe('🍍'); // 🍍
      expect(mapIcon('bread')).toBe('🍞'); // 🍞
      expect(mapIcon('cookie')).toBe('🍪'); // 🍪
      expect(mapIcon('candy')).toBe('🍬'); // 🍬
      expect(mapIcon('chocolate')).toBe('🍫'); // 🍫
      expect(mapIcon('ice_cream')).toBe('🍦'); // 🍦
      expect(mapIcon('popcorn')).toBe('🍿'); // 🍿
      expect(mapIcon('beer')).toBe('🍺'); // 🍺
      expect(mapIcon('wine')).toBe('🍷'); // 🍷
      expect(mapIcon('cocktail')).toBe('🍸'); // 🍸
      expect(mapIcon('tea')).toBe('🍵'); // 🍵
      expect(mapIcon('milk')).toBe('🥛'); // 🥛
      expect(mapIcon('water')).toBe('💧'); // 💧
    });

    test('should map sports and activity icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('sports')).toBe('⚽'); // ⚽
      expect(mapIcon('football')).toBe('⚽'); // ⚽
      expect(mapIcon('basketball')).toBe('🏀'); // 🏀
      expect(mapIcon('tennis')).toBe('🎾'); // 🎾
      expect(mapIcon('swimming')).toBe('🏊'); // 🏊
      expect(mapIcon('soccer')).toBe('⚽'); // ⚽
      expect(mapIcon('baseball')).toBe('⚾'); // ⚾
      expect(mapIcon('volleyball')).toBe('🏐'); // 🏐
      expect(mapIcon('rugby')).toBe('🏈'); // 🏈
      expect(mapIcon('golf')).toBe('⛳'); // ⛳
      expect(mapIcon('bowling')).toBe('🎳'); // 🎳
      expect(mapIcon('running')).toBe('🏃'); // 🏃
      expect(mapIcon('cycling')).toBe('🚴'); // 🚴
      expect(mapIcon('skiing')).toBe('⛷️'); // ⛷️
      expect(mapIcon('snowboarding')).toBe('🏂'); // 🏂
      expect(mapIcon('surfing')).toBe('🏄'); // 🏄
      expect(mapIcon('climbing')).toBe('🧗'); // 🧗
      expect(mapIcon('yoga')).toBe('🧘'); // 🧘
      expect(mapIcon('dancing')).toBe('💃'); // 💃
      expect(mapIcon('gym')).toBe('🏋️'); // 🏋️
      expect(mapIcon('weightlifting')).toBe('🏋️'); // 🏋️
      expect(mapIcon('boxing')).toBe('🥊'); // 🥊
      expect(mapIcon('martial_arts')).toBe('🥋'); // 🥋
      expect(mapIcon('archery')).toBe('🏹'); // 🏹
      expect(mapIcon('fishing')).toBe('🎣'); // 🎣
      expect(mapIcon('hiking')).toBe('🧖'); // 🧖
      expect(mapIcon('camping')).toBe('🏕️'); // 🏕️
      expect(mapIcon('picnic')).toBe('🍽️'); // 🍽️
      expect(mapIcon('barbecue')).toBe('🍳'); // 🍳
      expect(mapIcon('target')).toBe('🎯'); // 🎯
      expect(mapIcon('trophy')).toBe('🏆'); // 🏆
      expect(mapIcon('medal')).toBe('🏅'); // 🏅
      expect(mapIcon('first_place')).toBe('🥇'); // 🥇
      expect(mapIcon('second_place')).toBe('🥈'); // 🥈
      expect(mapIcon('third_place')).toBe('🥉'); // 🥉
    });

    test('should map music and entertainment icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('music')).toBe('🎵'); // 🎵
      expect(mapIcon('movie')).toBe('🎬'); // 🎬
      expect(mapIcon('game')).toBe('🎮'); // 🎮
      expect(mapIcon('book')).toBe('📚'); // 📚
    });

    test('should map travel and transport icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('car')).toBe('🚗'); // 🚗
      expect(mapIcon('plane')).toBe('✈️'); // ✈️
      expect(mapIcon('train')).toBe('🚂'); // 🚂
      expect(mapIcon('bus')).toBe('🚌'); // 🚌
      expect(mapIcon('bike')).toBe('🚲'); // 🚲
    });

    test('should map nature icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('tree')).toBe('🌳'); // 🌳
      expect(mapIcon('flower')).toBe('🌸'); // 🌸
      expect(mapIcon('leaf')).toBe('🍃'); // 🍃
      expect(mapIcon('mountain')).toBe('⛰️'); // ⛰️
      expect(mapIcon('ocean')).toBe('🌊'); // 🌊
    });

    test('should map holiday and celebration icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('gift')).toBe('🎁'); // 🎁
      expect(mapIcon('cake')).toBe('🎂'); // 🎂
      expect(mapIcon('party')).toBe('🎉'); // 🎉
      expect(mapIcon('fireworks')).toBe('🎆'); // 🎆
      expect(mapIcon('christmas')).toBe('🎄'); // 🎄
      expect(mapIcon('halloween')).toBe('🎃'); // 🎃
    });

    test('should map tools and work icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('tool')).toBe('🔧'); // 🔧
      expect(mapIcon('wrench')).toBe('🔧'); // 🔧
      expect(mapIcon('hammer')).toBe('🔨'); // 🔨
      expect(mapIcon('screwdriver')).toBe('🔩'); // 🔩
      expect(mapIcon('key')).toBe('🔑'); // 🔑
      expect(mapIcon('lock')).toBe('🔒'); // 🔒
    });

    test('should map medical and health icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('medical')).toBe('🏥'); // 🏥
      expect(mapIcon('health')).toBe('💊'); // 💊
      expect(mapIcon('pill')).toBe('💊'); // 💊
      expect(mapIcon('heartbeat')).toBe('💓'); // 💓
      expect(mapIcon('cross')).toBe('➕'); // ➕
    });

    test('should map shopping and commerce icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('shopping')).toBe('🛒'); // 🛒
      expect(mapIcon('cart')).toBe('🛒'); // 🛒
      expect(mapIcon('bag')).toBe('👜'); // 👜
      expect(mapIcon('credit_card')).toBe('💳'); // 💳
    });

    test('should map security and safety icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('security')).toBe('🔒'); // 🔒
      expect(mapIcon('shield')).toBe('🛡️'); // 🛡️
      expect(mapIcon('lock_closed')).toBe('🔒'); // 🔒
      expect(mapIcon('lock_open')).toBe('🔓'); // 🔓
    });

    test('should map science and education icons correctly', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('science')).toBe('🔬'); // 🔬
      expect(mapIcon('microscope')).toBe('🔬'); // 🔬
      expect(mapIcon('telescope')).toBe('🔭'); // 🔭
      expect(mapIcon('atom')).toBe('⚛️'); // ⚛️
      expect(mapIcon('book_open')).toBe('📖'); // 📖
      expect(mapIcon('graduation')).toBe('🎓'); // 🎓
    });

    test('should handle case insensitive mapping', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('FLAG_RED')).toBe('🔴'); // 🔴
      expect(mapIcon('STAR')).toBe('⭐'); // ⭐
      expect(mapIcon('SMILE')).toBe('😊'); // 😊
    });

    test('should return default icon for unknown icons', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('unknown-icon')).toBe('💡'); // 💡 (default)
      expect(mapIcon('non-existent')).toBe('💡'); // 💡 (default)
      expect(mapIcon('')).toBe('💡'); // 💡 (default)
    });

    test('should handle edge cases', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      expect(mapIcon('flag_0')).toBe('💡'); // 💡 (default)
      expect(mapIcon('flag_8')).toBe('💡'); // 💡 (default)
      expect(mapIcon('star_5')).toBe('💡'); // 💡 (default)
    });
  });

  describe('Icon Mapping Coverage', () => {
    test('should have comprehensive icon coverage', () => {
      const mapIcon = (importer as any).mapFreeplaneIconToEmojiIcon.bind(importer);

      // Test a representative sample from each category
      const testIcons = [
        // Priority and status
        'flag_red',
        'flag_yellow',
        'flag_green',
        'flag_blue',
        // Stars and ratings
        'star',
        'star_yellow',
        'star_red',
        // Tasks
        'task',
        'task_done',
        'task_start',
        // Arrows
        'arrow_up',
        'arrow_down',
        'arrow_left',
        'arrow_right',
        // Emotions
        'smile',
        'sad',
        'angry',
        'happy',
        'thinking',
        // Numbers
        'number_1',
        'number_2',
        'number_3',
        'number_10',
        // Letters
        'letter_a',
        'letter_b',
        'letter_c',
        'letter_z',
        // People
        'people',
        'person',
        'person_1',
        // Time
        'clock',
        'calendar',
        'time',
        'phone',
        'email',
        // Files
        'file',
        'folder',
        'attachment',
        'link',
        // Warnings
        'warning',
        'info',
        'question',
        'exclamation',
        // Hearts
        'heart',
        'like',
        'dislike',
        // Ideas
        'lightbulb',
        'idea',
        'bulb',
        // Money
        'money',
        'dollar',
        'euro',
        'pound',
        // Location
        'location',
        'home',
        'building',
        'school',
        // Technology
        'computer',
        'laptop',
        'phone_mobile',
        'tablet',
        // Weather
        'sun',
        'cloud',
        'rain',
        'snow',
        'storm',
        // Animals
        'dog',
        'cat',
        'bird',
        'fish',
        'butterfly',
        // Food
        'coffee',
        'pizza',
        'apple',
        'cake',
        // Sports
        'football',
        'basketball',
        'tennis',
        'swimming',
        // Music
        'music',
        'movie',
        'game',
        'book',
        // Travel
        'car',
        'plane',
        'train',
        'bus',
        'bike',
        // Nature
        'tree',
        'flower',
        'mountain',
        'ocean',
        // Holidays
        'gift',
        'cake',
        'party',
        'fireworks',
        // Tools
        'tool',
        'hammer',
        'key',
        'lock',
        // Medical
        'medical',
        'health',
        'pill',
        'heartbeat',
        // Shopping
        'shopping',
        'cart',
        'bag',
        'credit_card',
        // Security
        'security',
        'shield',
        'lock_closed',
        'lock_open',
        // Science
        'science',
        'microscope',
        'telescope',
        'atom',
      ];

      // Test that most icons map to valid emojis (some may return default)
      let mappedCount = 0;
      testIcons.forEach((icon) => {
        const result = mapIcon(icon);
        expect(result.length).toBeGreaterThan(0); // Should not be empty
        expect(typeof result).toBe('string'); // Should be a string
        if (result !== '💡') {
          mappedCount++;
        }
      });

      // At least 80% of icons should map to specific emojis
      expect(mappedCount / testIcons.length).toBeGreaterThan(0.8);
    });
  });
});
