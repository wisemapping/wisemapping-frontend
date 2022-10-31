context('Edit Topic', () => {
  // TODO: review why click({force: true}) is needed in these tests
  // also, why is the element outside the viewport in screenshots?
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.reload();
    cy.get('[test-id=1]').click();
  });

  it('Change Main Topic Text', () => {
    cy.get('body').type('New Title Main Topic{enter}');
    cy.get('[test-id=1] > text > tspan').should('have.text', 'New Title Main Topic');
    cy.matchImageSnapshot('changeMainTopicText');
  });

  it('Change Font Size', () => {

    // Go to the minimal size.
    cy.get(`[aria-label="Font Style"]`).trigger('mouseover');
    cy.get(`[aria-label="Smaller"]`).click();
    cy.get(`[aria-label="Smaller"]`).click();


    // cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '8.1');
    cy.matchImageSnapshot('changeFontSizeSmall');

    cy.get(`[aria-label="Font Style"]`).trigger('mouseover');
    cy.get(`[aria-label="Bigger"]`).click();
    // cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '10.8');
    cy.matchImageSnapshot('changeFontSizeNormal');

    cy.get(`[aria-label="Font Style"]`).trigger('mouseover');
    cy.get(`[aria-label="Bigger"]`).click();
    // cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '13.4');
    cy.matchImageSnapshot('changeFontSizeLarge');

    cy.get(`[aria-label="Font Style"]`).trigger('mouseover');
    cy.get(`[aria-label="Bigger"]`).click();

    // cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '20.2');
    cy.matchImageSnapshot('changeFontSizeHuge');

    // Can not scale it more.
    cy.get(`[aria-label="Bigger"]`).click();
    // cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '20.2');
    cy.matchImageSnapshot('changeFontSizeHuge');

  });

  // it('Change Font To Italic', () => {
  //   cy.get(`[aria-label="Font Style"]`).trigger('mouseover');
  //   cy.contains(`[data-test-id="FormactItalicIcon"]`).click();

  //   cy.get('[test-id=1] > text').invoke('attr', 'font-family').should('eq', 'Times');
  //   cy.matchImageSnapshot('changeFontType');
  // });

  // it('Change Font Italic', () => {
  //   cy.get(`[aria-label="Font Style"]`).trigger('mouseover');
  //   cy.contains('[data-testid="FormatItalicIcon"]').click();

  //   cy.get('[test-id=1] > text').invoke('attr', 'font-style').should('eq', 'italic');

  //   cy.matchImageSnapshot('changeFontItalic');
  // });

  // it('Change Font color', () => {
  //   cy.get('#fontColorTip').click();
  //   cy.get('[title="RGB (153, 0, 255)"]').click({ force: true });

  //   cy.get('[test-id=1] > text').invoke('attr', 'fill').should('eq', 'rgb(153, 0, 255)');

  //   cy.matchImageSnapshot('changeFontColor');
  // });
});
