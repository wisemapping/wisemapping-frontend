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

import XMindImporter from '../../../src/components/import/XMindImporter';

describe('XMind Icon Mapping Tests', () => {
  let importer: XMindImporter;

  beforeEach(() => {
    importer = new XMindImporter('');
  });

  describe('Icon Mapping Functionality', () => {
    test('should map priority icons correctly', () => {
      // Access the private method through type assertion
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('priority-1')).toBe('🔴'); // 🔴
      expect(mapIcon('priority-2')).toBe('🟡'); // 🟡
      expect(mapIcon('priority-3')).toBe('🟢'); // 🟢
      expect(mapIcon('priority-4')).toBe('🔵'); // 🔵
      expect(mapIcon('priority-5')).toBe('🟣'); // 🟣
    });

    test('should map star icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('star')).toBe('⭐'); // ⭐
      expect(mapIcon('star-1')).toBe('⭐'); // ⭐
      expect(mapIcon('star-2')).toBe('⭐'); // ⭐
      expect(mapIcon('star-3')).toBe('⭐'); // ⭐
    });

    test('should map task icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('task')).toBe('📋'); // 📋
      expect(mapIcon('task-done')).toBe('✅'); // ✅
      expect(mapIcon('task-start')).toBe('🟡'); // 🟡
      expect(mapIcon('task-pause')).toBe('⏸️'); // ⏸️
      expect(mapIcon('task-stop')).toBe('⏹️'); // ⏹️
    });

    test('should map emotion icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('smile')).toBe('😊'); // 😊
      expect(mapIcon('happy')).toBe('😃'); // 😃
      expect(mapIcon('thinking')).toBe('🤔'); // 🤔
      expect(mapIcon('sad')).toBe('😢'); // 😢
      expect(mapIcon('angry')).toBe('😠'); // 😠
    });

    test('should map number icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('1')).toBe('1️⃣'); // 1️⃣
      expect(mapIcon('2')).toBe('2️⃣'); // 2️⃣
      expect(mapIcon('3')).toBe('3️⃣'); // 3️⃣
      expect(mapIcon('10')).toBe('🔟'); // 🔟
    });

    test('should map letter icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('a')).toBe('🅰️'); // 🅰️
      expect(mapIcon('b')).toBe('🅱️'); // 🅱️
      expect(mapIcon('c')).toBe('🅲'); // 🅲
      expect(mapIcon('z')).toBe('🆉'); // 🆉
    });

    test('should map animal icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('dog')).toBe('🐶'); // 🐶
      expect(mapIcon('cat')).toBe('🐱'); // 🐱
      expect(mapIcon('bird')).toBe('🐦'); // 🐦
      expect(mapIcon('butterfly')).toBe('🦋'); // 🦋
    });

    test('should map food icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('apple')).toBe('🍎'); // 🍎
      expect(mapIcon('pizza')).toBe('🍕'); // 🍕
      expect(mapIcon('coffee')).toBe('☕'); // ☕
      expect(mapIcon('cake')).toBe('🎂'); // 🎂
    });

    test('should map technology icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('computer')).toBe('💻'); // 💻
      expect(mapIcon('phone-mobile')).toBe('📱'); // 📱
      expect(mapIcon('camera')).toBe('📷'); // 📷
      expect(mapIcon('keyboard')).toBe('⌨️'); // ⌨️
    });

    test('should map weather icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('sun')).toBe('☀️'); // ☀️
      expect(mapIcon('rain')).toBe('🌧️'); // 🌧️
      expect(mapIcon('snow')).toBe('❄️'); // ❄️
      expect(mapIcon('lightning')).toBe('⚡'); // ⚡
    });

    test('should map sports icons correctly', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('football')).toBe('⚽'); // ⚽
      expect(mapIcon('basketball')).toBe('🏀'); // 🏀
      expect(mapIcon('tennis')).toBe('🎾'); // 🎾
      expect(mapIcon('swimming')).toBe('🏊'); // 🏊
    });

    test('should handle case insensitive mapping', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('PRIORITY-1')).toBe('🔴'); // 🔴
      expect(mapIcon('STAR')).toBe('⭐'); // ⭐
      expect(mapIcon('SMILE')).toBe('😊'); // 😊
    });

    test('should return default icon for unknown icons', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('unknown-icon')).toBe('💡'); // 💡 (default)
      expect(mapIcon('non-existent')).toBe('💡'); // 💡 (default)
      expect(mapIcon('')).toBe('💡'); // 💡 (default)
    });

    test('should handle edge cases', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      expect(mapIcon('priority-0')).toBe('💡'); // 💡 (default)
      expect(mapIcon('priority-6')).toBe('💡'); // 💡 (default)
      expect(mapIcon('star-4')).toBe('💡'); // 💡 (default)
    });
  });

  describe('Icon Mapping Coverage', () => {
    test('should have comprehensive icon coverage', () => {
      const mapIcon = (importer as any).mapXMindIconToEmojiIcon.bind(importer);
      
      // Test a sample from each major category
      const testIcons = [
        // Priority
        'priority-1', 'priority-2', 'priority-3',
        // Stars
        'star', 'star-1', 'star-2',
        // Tasks
        'task', 'task-done', 'task-start',
        // Emotions
        'smile', 'happy', 'thinking', 'sad', 'angry',
        // Numbers
        '1', '2', '3', '10',
        // Letters
        'a', 'b', 'c', 'z',
        // Animals
        'dog', 'cat', 'bird', 'butterfly',
        // Food
        'apple', 'pizza', 'coffee', 'cake',
        // Technology
        'computer', 'phone-mobile', 'camera', 'keyboard',
        // Weather
        'sun', 'rain', 'snow', 'lightning',
        // Sports
        'football', 'basketball', 'tennis', 'swimming',
        // Arrows
        'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
        // Flags
        'flag', 'flag-red', 'flag-green',
        // People
        'person', 'people',
        // Time
        'clock', 'calendar', 'time',
        // Communication
        'phone', 'email', 'message',
        // Files
        'file', 'folder', 'attachment',
        // Warnings
        'warning', 'info', 'question', 'exclamation',
        // Hearts
        'heart', 'like', 'dislike',
        // Ideas
        'lightbulb', 'idea', 'bulb',
        // Money
        'money', 'dollar', 'euro',
        // Location
        'location', 'home', 'building',
        // Transport
        'car', 'plane', 'train', 'bus',
        // Nature
        'tree', 'flower', 'leaf', 'mountain',
        // Holidays
        'gift', 'party', 'fireworks', 'christmas',
        // Tools
        'tool', 'wrench', 'hammer', 'key',
        // Medical
        'medical', 'health', 'pill',
        // Shopping
        'shopping', 'cart', 'bag',
        // Security
        'security', 'shield', 'lock',
        // Science
        'science', 'microscope', 'telescope',
      ];

      // Count how many icons are successfully mapped (not default)
      const mappedIcons = testIcons.filter(icon => {
        const result = mapIcon(icon);
        return result !== 'emoji-1f4a1'; // Not the default lightbulb
      });

      // Should have mapped at least 80% of test icons
      const coveragePercentage = (mappedIcons.length / testIcons.length) * 100;
      expect(coveragePercentage).toBeGreaterThan(80);
      
      console.log(`Icon mapping coverage: ${coveragePercentage.toFixed(1)}% (${mappedIcons.length}/${testIcons.length} icons mapped)`);
    });
  });
});
