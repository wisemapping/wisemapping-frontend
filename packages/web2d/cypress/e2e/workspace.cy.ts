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
describe('Workspace Suite', () => {
  it('Workspace Visibility', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--visibility&viewMode=story');
    cy.matchImageSnapshot('workspace-visibility');
  });

  it('Workspace Position', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--position&viewMode=story');
    cy.matchImageSnapshot('workspace-position');
  });

  it('Workspace Coords Size', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--coords-size&viewMode=story');
    cy.matchImageSnapshot('workspace-coord-size');
  });

  it('Workspace Coords Origin', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--coords-origin&viewMode=story');
    cy.matchImageSnapshot('workspace-coord-origin');
  });

  it('Workspace Fractional Coords', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--fractional-coords&viewMode=story');
    cy.get('svg').first().should('have.attr', 'viewBox', '-68.65 -68.65 137.3 137.3');
    cy.get('svg')
      .eq(1)
      .invoke('attr', 'viewBox')
      .then((viewBox) => {
        const [x, y] = String(viewBox).split(' ').map(Number);
        expect(x).to.be.closeTo(-57, 0.0001);
        expect(y).to.be.closeTo(-57, 0.0001);
      });
    cy.matchImageSnapshot('workspace-fractional-coords');
  });
});
