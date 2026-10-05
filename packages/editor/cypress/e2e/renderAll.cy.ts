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

// A module, so that the types and helpers below stay local to this spec.
export {};

type DesignerHandle = {
  getMindmap(): { getId(): string | undefined };
  getModel(): { getTopics(): unknown[] };
};

/**
 * Asserts that the page shows the requested map: its id, and as many topics as its file has.
 * Retried until it holds (up to `timeout`), so it also waits for a large map to finish loading.
 */
const assertMapLoaded = (mapId: string, timeout: number) => {
  cy.readFile(`test/playground/map-render/samples/${mapId}.wxml`).then((xml: string) => {
    const topicsInFile = (xml.match(/<topic[\s>]/g) || []).length;
    cy.window({ timeout }).should((win) => {
      const designer = (win as unknown as { designer?: DesignerHandle }).designer;
      expect(designer, 'designer').to.not.equal(undefined);
      expect(designer?.getMindmap().getId(), 'loaded map').to.equal(mapId);
      expect(designer?.getModel().getTopics(), 'topics').to.have.length(topicsInFile);
    });
  });
};

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

      cy.visit(`/map-render/html/viewmode.html?id=${mapId}`);

      // Wait for loading spinner to disappear with extended timeout for huge maps
      cy.get('[aria-label="vortex-loading"]', { timeout }).should('not.exist');

      // Wait for SVG canvas to be visible
      cy.get('svg > path').should('be.visible');

      // Wait for at least one topic node to be rendered (ensures map content is loaded)
      cy.get('svg rect', { timeout: 10000 }).should('exist');

      // Wait for fonts to load
      cy.document().its('fonts.status').should('equal', 'loaded');

      // Waits for every topic to be loaded (large maps take a while); the snapshot then waits
      // for the markup to settle.
      assertMapLoaded(mapId, timeout);
      cy.matchImageSnapshot(`map-${mapId}`);
    });
  });
});
