const BASE_URL = 'http://localhost:8080';

context('Playground', () => {
  it('every test page should match its snapshot', () => {
    cy.visit(BASE_URL);
    cy.get('a').forEach(($el) => {
      const url = `${BASE_URL}${$el.attr('href')}`;
      cy.visit(url);
      cy.matchImageSnapshot($el.text());
    });
  });
});
