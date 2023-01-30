describe('Text Suite', () => {
  // Rect tests ...
  it('Text Multiline', () => {
    cy.visit('/iframe.html?args=&id=shapes-text--multiline&viewMode=story');
    cy.matchImageSnapshot('text-multiline');
  });
});
