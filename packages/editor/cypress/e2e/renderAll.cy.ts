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
