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
describe('Note Markdown and nested lists', () => {
  const note = () => cy.get('[contenteditable="true"]').first();

  const openNote = (topicId: number) => {
    cy.focusTopicById(topicId);
    cy.onClickToolbarButton('Add Note');
    note().should('be.visible');
  };

  const pressTab = (shiftKey = false) =>
    note().trigger('keydown', { key: 'Tab', code: 'Tab', keyCode: 9, shiftKey });

  // Cypress types a long text faster than React can follow (more than about 50 characters in one
  // type() reach React's nested update limit, with or without Markdown): type in short runs.
  const typeRuns = (...runs: string[]) => runs.forEach((run) => note().type(run));

  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
    openNote(3);
    note().clear();
  });

  it('turns "- " into a bulleted list and nests items with Tab and Shift+Tab', () => {
    note().type('- first{enter}second');
    note().find('ul > li').should('have.length', 2);

    pressTab();
    note().find('ul > li > ul > li').should('have.length', 1).and('have.text', 'second');

    note().type('{enter}deeper');
    pressTab();
    note().find('ul > li > ul > li > ul > li').should('have.text', 'deeper');

    pressTab(true);
    note().find('ul > li > ul > li').should('have.length', 2);
    note().find('ul ul ul').should('not.exist');
  });

  it('leaves a level, then the list, with Enter on an empty item', () => {
    note().type('- a{enter}b');
    pressTab();
    note().type('{enter}{enter}');
    // The empty item moved up a level.
    note().children('ul').children('li').should('have.length', 2);
    note().type('c{enter}{enter}after');
    note().find('ul li').last().should('have.text', 'c');
    note().children().last().should('have.prop', 'tagName', 'DIV').and('have.text', 'after');
  });

  it('breaks the line inside an item with Shift+Enter', () => {
    note().type('- one{shift+enter}two');
    note().find('li').should('have.length', 1).find('br').should('exist');
    note().find('li').should('contain.text', 'one').and('contain.text', 'two');
  });

  it('turns "1. " into a numbered list and "## " into a heading', () => {
    note().type('## Plan{enter}');
    note().find('h2').should('have.text', 'Plan');
    note().type('1. step');
    note().find('ol > li').should('have.text', 'step');
  });

  it('converts inline Markdown, with the text after it plain', () => {
    typeRuns('**bold** and *it* ', 'and ~~old~~ and ', '`code` end');
    note().find('strong').should('have.text', 'bold');
    note().find('em').should('have.text', 'it');
    note().find('s').should('have.text', 'old');
    note().find('code').should('have.text', 'code');
    note()
      .invoke('text')
      .then((text) => text.replace(/\u00a0/g, ' '))
      .should('eq', 'bold and it and old and code end');
    note()
      .find('strong, em, s, code')
      .each(($span) => {
        expect($span.text()).not.to.contain('and');
      });
  });

  it('makes links of safe addresses only', () => {
    typeRuns('[site](https://example.org) ', 'and [bad](javascript:void0) ');
    note().find('a').should('have.length', 1).and('have.attr', 'href', 'https://example.org');
    note().should('contain.text', '[bad](javascript:void0)');
  });

  it('opens a link with Ctrl+click and keeps the caret on a plain click', () => {
    note().type('[site](https://example.org) ');
    cy.window().then((win) => {
      cy.stub(win, 'open').as('open');
    });
    note().find('a').click();
    cy.get('@open').should('not.have.been.called');
    note().find('a').click({ ctrlKey: true });
    cy.get('@open').should(
      'have.been.calledWith',
      'https://example.org',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('saves nested lists and shows them, with links opening in a new tab, in the tooltip', () => {
    typeRuns('- parent{enter}child ', '[site](https://example.org) ');
    pressTab();
    cy.contains('Accept').click();

    openNote(3);
    note().find('ul > li > ul > li').should('contain.text', 'child');
    cy.contains('Accept').click();

    cy.get('mindplot-component')
      .shadow()
      .find('[test-id="topic-note-icon"]', { timeout: 5000 })
      .first()
      .trigger('mouseenter', { force: true });
    cy.get('mindplot-component')
      .shadow()
      .find('#mindplot-svg-tooltip-content-note ul > li > ul > li a', { timeout: 2000 })
      .should('have.attr', 'href', 'https://example.org')
      .and('have.attr', 'target', '_blank')
      .and('have.attr', 'rel', 'noopener noreferrer');
  });

  it('restores the typed Markdown with undo right after the conversion', () => {
    note().type('- ');
    note().find('ul > li').should('exist');
    note().type('{ctrl}z');
    note().find('ul').should('not.exist');
    note()
      .invoke('text')
      .then((text) => text.replace(/\u00a0/g, ' '))
      .should('eq', '- ');
  });

  it('converts pasted Markdown text', () => {
    note().trigger('paste', {
      clipboardData: {
        getData: (type: string) => (type === 'text/plain' ? '- one\n    - **two**\n- three' : ''),
      },
    });
    note().find('ul > li > ul > li > strong').should('have.text', 'two');
    note().children('ul').children('li').should('have.length', 2);
  });

  it('shows nested lists indented', () => {
    typeRuns('- one{enter}two{enter}three');
    pressTab();
    note().find('ul ul ul').should('not.exist');
    note().type('{enter}four');
    pressTab();
    note().find('ul ul ul > li').should('have.text', 'four');
    note()
      .find('li')
      .then(($items) => {
        const left = (i: number) => $items[i].getBoundingClientRect().left;
        // one, two: level 1; three: level 2; four: level 3.
        expect(left(1)).to.eq(left(0));
        expect(left(2)).to.be.greaterThan(left(1));
        expect(left(3)).to.be.greaterThan(left(2));
      });
  });
});
