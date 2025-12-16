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
describe('Ellipse Suite', () => {
  // Ellipse tests ...
  it('Ellipse Fill', () => {
    cy.visit('/iframe.html?args=&id=shapes-ellipse--fill&viewMode=story');
    cy.matchImageSnapshot('ellipse-fill');
  });

  it('Ellipse Stroke', () => {
    cy.visit('/iframe.html?args=&id=shapes-ellipse--fill&viewMode=story');
    cy.matchImageSnapshot('ellipse-stroke');
  });

  it('Ellipse Size', () => {
    cy.visit('/iframe.html?args=&id=shapes-ellipse--size&viewMode=story');
    cy.matchImageSnapshot('ellipse-size');
  });
});
