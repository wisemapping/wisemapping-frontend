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

/// <reference types="cypress" />
/// <reference types="cypress-axe" />

import type { Result } from 'axe-core';

/*
 * Automated accessibility scan (axe-core via cypress-axe).
 *
 * ---------------------------------------------------------------------------
 * THIS SPEC IS INTENTIONALLY REPORTING-ONLY. IT MUST NOT FAIL THE RUN.
 * ---------------------------------------------------------------------------
 * The codebase has never been scanned by axe, so there is a pre-existing
 * backlog of violations. The pre-push hook runs `yarn lint && yarn test`, so a
 * spec that asserted on those findings would block every push until the whole
 * backlog is fixed. Instead, every scan below passes `skipFailures = true` to
 * cy.checkA11y() and prints what it found through a non-throwing reporter.
 *
 * Turning enforcement on is a deliberate follow-up, to be done once the
 * findings currently printed by this spec have been triaged and either fixed
 * or explicitly excluded. At that point drop `SKIP_FAILURES` (or narrow it to
 * a `runOnly`/`rules` allowlist of the rules already clean) so regressions
 * start failing the build.
 */
const SKIP_FAILURES = true;

/**
 * Non-throwing reporter. cy.log() only writes to the in-browser command log,
 * which `cypress run` does not print, so violations are pushed to the Node
 * process via the `log`/`table` tasks registered in cypress/plugins/index.ts.
 */
const reportViolations =
  (label: string) =>
  (violations: Result[]): void => {
    cy.task(
      'log',
      `[a11y] ${label}: ${violations.length} rule violation(s) ` +
        `across ${violations.reduce((total, v) => total + v.nodes.length, 0)} element(s) ` +
        `(reporting-only, not failing the run)`,
    );

    cy.task(
      'table',
      violations.map((violation) => ({
        page: label,
        rule: violation.id,
        impact: violation.impact ?? 'n/a',
        elements: violation.nodes.length,
        target: violation.nodes
          .map((node) => node.target.join(' '))
          .slice(0, 3)
          .join(' | '),
        help: violation.help,
      })),
    );
  };

type PageUnderTest = {
  /** Human readable name used in the reported output. */
  name: string;
  path: string;
  /** Pages that must render in their logged-out state. */
  unauthenticated?: boolean;
  /** Extra waits so axe scans a settled DOM rather than a loading skeleton. */
  waitUntilReady?: () => void;
};

const PAGES: PageUnderTest[] = [
  { name: 'Login', path: '/c/login', unauthenticated: true },
  { name: 'Registration', path: '/c/registration', unauthenticated: true },
  { name: 'Forgot password', path: '/c/forgot-password', unauthenticated: true },
  {
    name: 'Maps',
    path: '/c/maps',
    waitUntilReady: () => {
      cy.get('.MuiCard-root').should('have.length', 10);
    },
  },
  {
    name: 'Admin accounts',
    path: '/c/admin/accounts',
    waitUntilReady: () => {
      cy.get('.MuiTableBody-root', { timeout: 10000 }).should('be.visible');
    },
  },
];

const THEME_MODES = ['light', 'dark'] as const;

describe('Accessibility (axe-core, reporting-only)', () => {
  THEME_MODES.forEach((mode) => {
    describe(`${mode} mode`, () => {
      PAGES.forEach((page) => {
        it(`scans ${page.name} (${page.path})`, () => {
          if (page.unauthenticated) {
            cy.clearCookie('jwt-auth-token');
          }

          // ThemeContext reads the 'themeMode' key on boot, so it has to be
          // seeded before the app's first render rather than after cy.visit().
          cy.visit(page.path, {
            onBeforeLoad: (win) => {
              win.localStorage.setItem('themeMode', mode);
            },
          });
          cy.waitForPageLoaded();
          page.waitUntilReady?.();

          cy.injectAxe();
          cy.checkA11y(
            undefined,
            undefined,
            reportViolations(`${page.name} [${mode}]`),
            SKIP_FAILURES,
          );
        });
      });
    });
  });
});
