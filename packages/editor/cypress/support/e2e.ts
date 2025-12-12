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

Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'error');
  cy.spy(win.console, 'warn');
});

afterEach(() => {
  cy.window({ log: false }).then((win) => {
    // Check if the methods are spies by verifying they have the 'callCount' property
    const errorSpy = win.console.error as unknown as { callCount?: number; getCalls: () => any[] };
    const warnSpy = win.console.warn as unknown as { callCount?: number };

    if (errorSpy && typeof errorSpy.callCount === 'number' && errorSpy.callCount > 0) {
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
      const errorMessages = calls.map((c, i) => {
        const args = c.args.map((a: any) => {
          if (a && a.stack) {
            return `${a.toString()}\nStack: ${a.stack}`;
          }
          return a && a.toString ? a.toString() : JSON.stringify(a);
        });
        return `Error ${i + 1}: ${args.join(' ')}`;
      });

      throw new Error(`Console Errors present (${calls.length} total):\n\n${errorMessages.join('\n\n')}`);
    }

    if (warnSpy && typeof warnSpy.callCount === 'number') {
      // expect(win.console.warn).to.have.callCount(0);
    }
  });
});
