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
describe('Element Events Suite', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?args=&id=shapes-element--events&viewMode=story');
  });

  it('Element Events', () => {
    cy.matchImageSnapshot('element-events');
  });

  it('Element Events dispatches click, dblclick, mouseover and mouseout', () => {
    cy.get('rect').click(5, 5);
    cy.get('rect').dblclick(5, 5);
    cy.get('ellipse').trigger('mouseover');
    cy.get('ellipse').trigger('mouseout');
    cy.get('[data-testid="event-log"] li')
      .then((items) => [...items].map((i) => i.textContent))
      .should('include.members', [
        'rect:click',
        'rect:dblclick',
        'ellipse:mouseover',
        'ellipse:mouseout',
      ]);
  });
});

describe('Element Events Registration Suite', () => {
  const visit = (args: string) =>
    cy.visit(`/iframe.html?args=${args}&id=shapes-element--events-registration&viewMode=story`);

  it('Element Events Registration', () => {
    visit('');
    cy.matchImageSnapshot('element-events-registration');
  });

  it('Element Events Registration with nothing enabled logs nothing', () => {
    visit('');
    cy.get('ellipse').last().click();
    cy.get('[data-testid="event-log"] li').should('have.length', 0);
  });

  it('Element Events Registration stops propagation at the inner circle', () => {
    visit('enableForWorkspace:!true;enableForInnerCircle:!true;stopEventPropagation:!true');
    cy.get('ellipse').last().click();
    cy.get('[data-testid="event-log"] li')
      .then((items) => [...items].map((i) => i.textContent).filter((e) => e.endsWith(':click')))
      .should('deep.equal', ['inner:click']);
  });

  it('Element Events Registration bubbles to the workspace', () => {
    visit('enableForWorkspace:!true;enableForInnerCircle:!true;stopEventPropagation:!false');
    cy.get('ellipse').last().click();
    cy.get('[data-testid="event-log"] li')
      .then((items) => [...items].map((i) => i.textContent).filter((e) => e.endsWith(':click')))
      .should('deep.equal', ['inner:click', 'workspace:click']);
  });
});
