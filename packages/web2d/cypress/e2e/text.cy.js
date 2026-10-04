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
describe('Text Suite', () => {
  // Rect tests ...
  it('Text Multiline', () => {
    cy.visit('/iframe.html?args=&id=shapes-text--multiline&viewMode=story');
    cy.matchImageSnapshot('text-multiline');
  });

  it('Text Empty Lines', () => {
    cy.visit('/iframe.html?args=&id=shapes-text--empty-lines&viewMode=story');
    cy.get('text').first().find('tspan').should('have.length', 3);
    cy.matchImageSnapshot('text-empty-lines');
  });

  it('Text Trailing Newline', () => {
    cy.visit('/iframe.html?args=&id=shapes-text--trailing-newline&viewMode=story');
    cy.get('text').first().find('tspan').should('have.length', 2);
    cy.matchImageSnapshot('text-trailing-newline');
  });

  it('Text CRLF', () => {
    cy.visit('/iframe.html?args=&id=shapes-text--crlf&viewMode=story');
    cy.get('text').first().find('tspan').should('have.length', 2);
    cy.matchImageSnapshot('text-crlf');
  });

  it('Text Empty', () => {
    cy.visit('/iframe.html?args=&id=shapes-text--empty&viewMode=story');
    cy.get('tspan').should('have.length', 0);
    cy.matchImageSnapshot('text-empty');
  });

  it('Text Bold Italic', () => {
    cy.visit('/iframe.html?args=&id=shapes-text--bold-italic&viewMode=story');
    cy.get('text').first().should('have.attr', 'font-weight', '900');
    cy.matchImageSnapshot('text-bold-italic');
  });
});
