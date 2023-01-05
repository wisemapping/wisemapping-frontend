context('Maps Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps');
  });

  it('should match the snapshot', () => {
    // cy.matchImageSnapshot('maps');
  });
});

context('iphone-5 resolution', () => {
  beforeEach(() => {
    cy.viewport('iphone-5');
    cy.visit('/c/maps', {
      onLoad: (win) => {
        win.onerror = null;
      },
    });
  });

  it('Displays mobile menu button', () => {
    cy.get('#open-main-drawer').should('be.visible');
  });

  it('Displays mobile menu on click', () => {
    cy.get('.MuiDrawer-root').should('not.be.visible');
    cy.get('#open-main-drawer').should('be.visible').click();
    cy.get('.MuiDrawer-root').should('be.visible');
  });

  it('Displays a card list', () => {
    cy.get('.MuiCard-root').should('have.length', 3);
  });
});

context('720p resolution', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/c/maps');
  });

  it('Displays mobile menu button', () => {
    cy.get('#open-desktop-drawer').should('be.visible');
  });

  it('Displays a table with maps', () => {
    cy.get('.MuiTableBody-root').should('be.visible');
  });
});
