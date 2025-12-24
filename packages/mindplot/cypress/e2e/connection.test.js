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
context('Connection suite', () => {
  // Test to ensure all stories load without import/export errors
  it('all stories load successfully without errors', () => {
    const stories = ['classic', 'prism', 'robot', 'sunrise', 'ocean', 'aurora', 'retro'];

    stories.forEach((story) => {
      cy.visit(`/iframe.html?args=&id=mindplot-connection--${story}&viewMode=story`);

      // Wait for story to load
      cy.get('body', { timeout: 10000 }).should('be.visible');

      // Ensure the story content is rendered (should contain SVG elements from mindplot)
      cy.get('body').should('contain.html', '<svg');
      cy.get('svg').should('exist').and('be.visible');

      // Main validation: story should render successfully with SVG content
    });
  });

  it('classic theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--classic&viewMode=story');
    cy.matchImageSnapshot('connection-classic');
  });

  it('prism theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--prism&viewMode=story');
    cy.matchImageSnapshot('connection-prism');
  });

  it('robot theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--robot&viewMode=story');
    cy.matchImageSnapshot('connection-robot');
  });

  it('sunrise theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--sunrise&viewMode=story');
    cy.matchImageSnapshot('connection-sunrise');
  });

  it('aurora theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--aurora&viewMode=story');
    cy.matchImageSnapshot('connection-aurora');
  });

  it('retro theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--retro&viewMode=story');
    cy.matchImageSnapshot('connection-retro');
  });
});
