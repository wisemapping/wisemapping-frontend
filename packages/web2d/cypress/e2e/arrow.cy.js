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
describe('Arrow Suite', () => {
  it('Arrow Default', () => {
    cy.visit('/iframe.html?args=&id=shapes-arrow--default&viewMode=story');
    // 8 directions plus the two y = 0 arrows.
    cy.get('path').should('have.length', 10);
    cy.matchImageSnapshot('arrow-default');
  });

  it('Arrow Thick', () => {
    cy.visit('/iframe.html?args=&id=shapes-arrow--thick&viewMode=story');
    cy.get('path').first().should('have.attr', 'stroke-width', '5');
    cy.matchImageSnapshot('arrow-thick');
  });

  it('Arrow Dashed', () => {
    cy.visit('/iframe.html?args=&id=shapes-arrow--dashed&viewMode=story');
    // W-ARROWDASH: setDashed(true, 3, 3) writes "33" today.
    cy.get('path').first().should('have.attr', 'stroke-dasharray');
    cy.matchImageSnapshot('arrow-dashed');
  });
});
