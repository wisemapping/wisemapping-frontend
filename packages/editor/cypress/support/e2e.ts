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

import './commands';

type ConsoleArg = { stack?: string; toString?: () => string } | null | undefined;
type ConsoleSpy = { callCount: number; getCalls: () => { args: ConsoleArg[] }[] };

// console.warn calls the pages under test make on purpose. Any other warning fails the test.
const ALLOWED_WARNINGS: RegExp[] = [
  // Designer.copyToClipboard / pasteClipboard: headless Chrome denies the system clipboard (the
  // page has no focus, or no clipboard-read permission), so the designer uses its internal one.
  /^System clipboard not available(?: for reading)?, using internal clipboard/,
  // LocalStorageManager.load: a map fetch that fails is retried before giving up with an error.
  /^Fetch failed for \S+, retrying in 500ms/,
];

const formatArg = (arg: ConsoleArg): string => {
  if (arg && arg.stack) {
    return `${arg.toString?.()}\nStack: ${arg.stack}`;
  }
  return arg && arg.toString ? arg.toString() : JSON.stringify(arg);
};

// The spies are kept here, not read back from win.console: the Vite dev client wraps
// console.error/warn after the page starts loading when it forwards the browser console to the
// terminal (server.forwardConsole, on by default under AI agents). The wrapper still calls the
// spy, but win.console.warn is then no longer the spy.
const consoleSpies = new WeakMap<Window, { error: ConsoleSpy; warn: ConsoleSpy }>();

Cypress.on('window:before:load', (win) => {
  consoleSpies.set(win, {
    error: cy.spy(win.console, 'error') as unknown as ConsoleSpy,
    warn: cy.spy(win.console, 'warn') as unknown as ConsoleSpy,
  });
});

afterEach(() => {
  cy.window({ log: false }).then((win) => {
    const spies = consoleSpies.get(win);
    if (!spies) {
      // Only a test that never loaded a page has no spies ...
      expect(win.location.href, 'page without console spies').to.equal('about:blank');
      return;
    }
    const errorSpy = spies.error;
    const warnSpy = spies.warn;

    if (errorSpy.callCount > 0) {
      const calls = errorSpy.getCalls();

      // Log each error with full details
      console.log('\n========== CONSOLE ERRORS DETECTED ==========');
      console.log(`Total errors: ${calls.length}`);

      calls.forEach((call, index) => {
        console.log(`\n--- Error ${index + 1} ---`);
        call.args.forEach((arg, argIndex) => {
          console.log(`Arg ${argIndex}:`, arg);
          // If it's an error object, log the stack
          if (arg && arg.stack) {
            console.log('Stack:', arg.stack);
          }
        });
      });

      console.log('\n============================================\n');

      // Create a detailed error message
      const errorMessages = calls.map(
        (c, i) => `Error ${i + 1}: ${c.args.map(formatArg).join(' ')}`,
      );

      throw new Error(
        `Console Errors present (${calls.length} total):\n\n${errorMessages.join('\n\n')}`,
      );
    }

    const warnings = warnSpy
      .getCalls()
      .map((c) => c.args.map(formatArg).join(' '))
      .filter((message) => !ALLOWED_WARNINGS.some((allowed) => allowed.test(message)));
    if (warnings.length > 0) {
      const warningMessages = warnings.map((message, i) => `Warning ${i + 1}: ${message}`);
      throw new Error(
        `Console warnings present (${warnings.length} total):\n\n${warningMessages.join('\n\n')}`,
      );
    }
  });
});
