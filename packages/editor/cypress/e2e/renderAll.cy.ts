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
describe('Render all sample maps', () => {
  [
    'complex',
    // 'emoji',
    'emptyNodes',
    'error-on-load',
    'huge',
    'huge2',
    'icon-sample',
    'img-support',
    'order',
    //'rel-error',
    'sample1',
    'sample2',
    'sample3',
    'welcome-prism',
    'sample4',
    'sample5',
    'sample6',
    'connection-style',
    'sample8',
    'welcome',
  ].forEach((mapId) => {
    it(`Render map => ${mapId}`, () => {
      cy.visit(`/viewmode.html?id=${mapId}`);
      cy.waitEditorLoaded();

      cy.get('svg > path').should('be.visible');
      cy.get('[aria-label="vortex-loading"]', { timeout: 120000 }).should('not.exist');
      cy.matchImageSnapshot(`map-${mapId}`);
    });
  });
});
