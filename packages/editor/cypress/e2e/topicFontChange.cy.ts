describe('Edit Topic', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/editor.html');
    cy.clearLocalStorage('welcome-xml');
    cy.reload();

    // Wait for load complate ...
    cy.get('[aria-label="vortex-loading"]').should('not.exist');
    cy.get('[test-id=1]').click();
  });

  it('Change Main Topic Text', () => {
    cy.get('body').type('New Title Main Topic{enter}');
    cy.get('[test-id=1] > text > tspan').should('have.text', 'New Title Main Topic');

    cy.matchImageSnapshot('changeMainTopicText');
  });

  it('Change Font Size', () => {
    // Go to the minimal size.
    cy.get('[aria-label="Font Style"]').first().trigger('mouseover');
    cy.get('[aria-label="Smaller"]').as('smaller');
    cy.get('@smaller').eq(1).click();
    cy.get('@smaller').eq(1).click();

    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '8.1');
    cy.matchImageSnapshot('changeFontSizeSmall');

    cy.get('[aria-label="Bigger"]').as('bigger');
    cy.get('@bigger').eq(1).click();
    cy.matchImageSnapshot('changeFontSizeNormal');

    cy.get('@bigger').eq(1).click();
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '13.4');
    cy.matchImageSnapshot('changeFontSizeLarge');

    cy.get('@bigger').eq(1).click();
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '20.2');
    cy.matchImageSnapshot('changeFontSizeHuge');

    cy.get('@bigger').eq(1).click();
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '20.2');

    cy.matchImageSnapshot('changeFontSizeHuge');
  });

  it('Change Font To Italic', () => {
    cy.get('[aria-label="Font Style"]').first().trigger('mouseover');
    cy.get('[aria-label^="Italic ').first().click();

    cy.get('[test-id=1] > text').invoke('attr', 'font-style').should('eq', 'italic');

    cy.matchImageSnapshot('changeFontItalic');
  });

  it('Change Font to Bold', () => {
    cy.get(`[aria-label="Font Style"]`).first().trigger('mouseover');
    cy.get('[aria-label^="Bold ').first().click();

    cy.get('[test-id=1] > text').invoke('attr', 'font-weight').should('eq', 'normal');

    cy.matchImageSnapshot('changeFontBold');
  });

  it('Change Font Color', () => {
    cy.get('[aria-label="Font Style"]').eq(1).trigger('mouseover');
    cy.get('[aria-label="Color"]').eq(1).click();
    cy.get('[title="#cc0000"]').click({ force: true });

    cy.get('[test-id=1] > text').invoke('attr', 'fill').should('eq', '#cc0000');

    cy.matchImageSnapshot('changeFontColor');
  });
});
