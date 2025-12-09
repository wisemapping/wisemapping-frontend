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
      // huge2 is a very large map that needs more time to load
      const timeout = mapId === 'huge2' ? 240000 : 120000;
      
      cy.visit(`/viewmode.html?id=${mapId}`);
      
      // Wait for loading spinner to disappear with extended timeout for huge maps
      cy.get('[aria-label="vortex-loading"]', { timeout }).should('not.exist');
      
      // Wait for SVG canvas to be visible
      cy.get('svg > path').should('be.visible');
      
      // Wait for at least one topic node to be rendered (ensures map content is loaded)
      cy.get('svg rect', { timeout: 10000 }).should('exist');
      
      // Wait for fonts to load
      cy.document().its('fonts.status').should('equal', 'loaded');
      
      // Additional wait for huge maps to ensure all nodes are rendered
      if (mapId === 'huge2' || mapId === 'huge') {
        cy.wait(2000); // Extra time for large maps to finish rendering
      }
      
      cy.matchImageSnapshot(`map-${mapId}`);
    });
  });
});
