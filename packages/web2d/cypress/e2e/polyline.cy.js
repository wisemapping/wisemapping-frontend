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
describe('Polyline Suite', () => {
  // Polyline tests ...
  it('Polyline Stroke', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--stroke&viewMode=story');
    cy.matchImageSnapshot('polyline-stroke');
  });

  it('Polyline Straight', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--straight&viewMode=story');
    cy.matchImageSnapshot('polyline-straight');
  });

  it('Polyline Middle Straight', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--middle-straight&viewMode=story');
    cy.matchImageSnapshot('polyline-middle-straight');
  });

  it('Polyline Curved', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--curved&viewMode=story');
    cy.matchImageSnapshot('polyline-curved');
  });

  it('Polyline Middle Curved', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--middle-curved&viewMode=story');
    cy.matchImageSnapshot('polyline-middle-curved');
  });
});
