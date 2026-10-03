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
import { EditorRenderMode } from '@wisemapping/mindplot';
import Capability from '../../../src/classes/action/capability';
import ActionType from '../../../src/classes/action/action-type';

const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const setUserAgent = (ua: string): void => {
  Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
};

const MODES: EditorRenderMode[] = [
  'edition-owner',
  'edition-editor',
  'edition-viewer',
  'viewonly-public',
  'viewonly-private',
  'showcase',
  'desktop',
];

const ACTIONS: ActionType[] = [
  'undo-changes',
  'redo-changes',
  'history',
  'save',
  'print',
  'export',
  'publish',
  'share',
  'info',
  'account',
  'edition-toolbar',
  'sign-up',
  'starred',
  'appbar-title',
  'keyboard-shortcuts',
  'theme',
  'layout',
  'rename',
  'outline-view',
];

/** Actions the locked-map rule suppresses regardless of render mode. */
const LOCKED_SUPPRESSED: ActionType[] = [
  'save',
  'keyboard-shortcuts',
  'edition-toolbar',
  'publish',
  'redo-changes',
  'undo-changes',
];

/**
 * Characterization test for the render-mode capability matrix.
 *
 * `isHidden` is the only gate the editor chrome consults, and it is driven by a
 * 19-action x 8-mode table of exclusion lists. The table is easy to edit and
 * impossible to review by eye, so this pins the full cross-product: every
 * (action, mode, platform, locked) combination is asserted, which is what makes
 * restructuring the table safe.
 *
 * The expectation is derived from the table's shape -- hidden when the mode is
 * listed for the platform, plus the locked-map override -- not copied from the
 * implementation's control flow, so a behavioural change in either shows up
 * here as a failure rather than passing by construction.
 */
describe('Capability.isHidden', () => {
  afterEach(() => {
    setUserAgent(DESKTOP_UA);
  });

  describe('platform detection', () => {
    it('reports desktop for a desktop user agent', () => {
      setUserAgent(DESKTOP_UA);
      expect(new Capability('edition-owner', false).isMobile).toBe(false);
    });

    it('reports mobile for a phone user agent', () => {
      setUserAgent(MOBILE_UA);
      expect(new Capability('edition-owner', false).isMobile).toBe(true);
    });

    it('is captured once at construction, so later UA changes are ignored', () => {
      setUserAgent(DESKTOP_UA);
      const capability = new Capability('edition-owner', false);
      setUserAgent(MOBILE_UA);
      // Documents a real limitation: a rotated tablet or resized window never
      // re-evaluates this. Any move to a media query must update this test.
      expect(capability.isMobile).toBe(false);
    });
  });

  describe('owner editing a map (the fullest capability set)', () => {
    const visible = (action: ActionType): boolean =>
      !new Capability('edition-owner', false).isHidden(action);

    it.each([
      'undo-changes',
      'redo-changes',
      'save',
      'print',
      'export',
      'publish',
      'share',
      'info',
      'account',
      'edition-toolbar',
      'starred',
      'keyboard-shortcuts',
      'history',
      'theme',
      'layout',
      'rename',
      'outline-view',
    ] as ActionType[])('shows %s', (action) => {
      expect(visible(action)).toBe(true);
    });

    it('hides sign-up (the user is already signed in)', () => {
      expect(visible('sign-up')).toBe(false);
    });
  });

  describe('public read-only view', () => {
    const hidden = (action: ActionType): boolean =>
      new Capability('viewonly-public', false).isHidden(action);

    it.each([
      'undo-changes',
      'redo-changes',
      'save',
      'publish',
      'share',
      'edition-toolbar',
      'keyboard-shortcuts',
      'history',
      'theme',
      'rename',
      'starred',
      'layout',
    ] as ActionType[])('hides %s', (action) => {
      expect(hidden(action)).toBe(true);
    });

    it.each(['print', 'export', 'info', 'account', 'outline-view'] as ActionType[])(
      'still shows %s',
      (action) => {
        expect(hidden(action)).toBe(false);
      },
    );

    it('hides sign-up here too', () => {
      // 'sign-up' is listed hidden for every mode except 'showcase', so the
      // app bar's sign-up button is reachable in showcase mode alone. Public
      // viewers -- the one audience it is for -- never see it.
      expect(hidden('sign-up')).toBe(true);
    });
  });

  describe('locked map', () => {
    it.each(LOCKED_SUPPRESSED)('hides %s even for an owner', (action) => {
      expect(new Capability('edition-owner', true).isHidden(action)).toBe(true);
    });

    it('leaves every other action exactly as the unlocked owner has it', () => {
      const locked = new Capability('edition-owner', true);
      const unlocked = new Capability('edition-owner', false);
      ACTIONS.filter((a) => !LOCKED_SUPPRESSED.includes(a)).forEach((action) => {
        expect(locked.isHidden(action)).toBe(unlocked.isHidden(action));
      });
    });

    it('never un-hides something the render mode already hid', () => {
      MODES.forEach((mode) => {
        const locked = new Capability(mode, true);
        const unlocked = new Capability(mode, false);
        ACTIONS.forEach((action) => {
          if (unlocked.isHidden(action)) {
            expect(locked.isHidden(action)).toBe(true);
          }
        });
      });
    });
  });

  describe('full cross-product', () => {
    // Mirrors the table in capability/index.ts. Kept as data so the assertion
    // below can state the rule once instead of enumerating 500+ expectations.
    const HIDDEN_DESKTOP: Partial<Record<ActionType, EditorRenderMode[]>> = {
      'redo-changes': ['viewonly-public', 'viewonly-private', 'edition-viewer'],
      'undo-changes': ['viewonly-public', 'viewonly-private', 'edition-viewer'],
      save: ['showcase', 'viewonly-public', 'viewonly-private', 'edition-viewer'],
      print: ['showcase', 'desktop'],
      publish: [
        'showcase',
        'viewonly-public',
        'viewonly-private',
        'edition-viewer',
        'edition-editor',
        'desktop',
      ],
      share: [
        'showcase',
        'viewonly-public',
        'viewonly-private',
        'edition-viewer',
        'edition-editor',
        'desktop',
      ],
      info: ['showcase', 'desktop'],
      account: ['showcase', 'desktop'],
      'edition-toolbar': ['viewonly-public', 'viewonly-private', 'edition-viewer'],
      'keyboard-shortcuts': ['viewonly-public', 'viewonly-private', 'edition-viewer'],
      history: ['viewonly-public', 'viewonly-private', 'edition-viewer', 'showcase', 'desktop'],
      'sign-up': [
        'viewonly-public',
        'viewonly-private',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
        'desktop',
      ],
      starred: ['showcase', 'viewonly-private', 'viewonly-public', 'desktop'],
      theme: ['viewonly-public', 'viewonly-private', 'edition-viewer'],
      rename: [
        'showcase',
        'viewonly-public',
        'viewonly-private',
        'edition-viewer',
        'edition-editor',
      ],
      'outline-view': ['showcase'],
      layout: ['showcase', 'viewonly-public', 'viewonly-private', 'edition-viewer', 'desktop'],
    };

    const HIDDEN_MOBILE_EXTRA: Partial<Record<ActionType, EditorRenderMode[]>> = {
      print: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
        'desktop',
      ],
      publish: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
        'desktop',
      ],
      share: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
        'desktop',
      ],
      info: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
        'desktop',
      ],
      'keyboard-shortcuts': ['edition-editor', 'edition-owner', 'showcase'],
      history: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
        'desktop',
      ],
      export: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
      ],
      'appbar-title': [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
      ],
      starred: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
        'desktop',
      ],
      theme: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
      ],
      rename: [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
      ],
      'outline-view': [
        'viewonly-public',
        'viewonly-private',
        'showcase',
        'edition-viewer',
        'edition-editor',
        'edition-owner',
      ],
    };

    const expectedHidden = (
      action: ActionType,
      mode: EditorRenderMode,
      isMobile: boolean,
      isLocked: boolean,
    ): boolean => {
      if (isLocked && LOCKED_SUPPRESSED.includes(action)) {
        return true;
      }
      if (HIDDEN_DESKTOP[action]?.includes(mode)) {
        return true;
      }
      return Boolean(isMobile && HIDDEN_MOBILE_EXTRA[action]?.includes(mode));
    };

    it.each([
      ['desktop', DESKTOP_UA, false],
      ['mobile', MOBILE_UA, true],
    ] as [string, string, boolean][])('matches the table on %s', (_label, ua, isMobile) => {
      setUserAgent(ua);
      [false, true].forEach((isLocked) => {
        MODES.forEach((mode) => {
          const capability = new Capability(mode, isLocked);
          ACTIONS.forEach((action) => {
            expect({ action, mode, isLocked, hidden: capability.isHidden(action) }).toEqual({
              action,
              mode,
              isLocked,
              hidden: expectedHidden(action, mode, isMobile, isLocked),
            });
          });
        });
      });
    });
  });
});
