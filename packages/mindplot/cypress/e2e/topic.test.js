context('Topic suite', () => {
  it('topic border', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--border-style&viewMode=story');
    cy.matchImageSnapshot('topic-border');
  });

  it('topic style', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--font-style&viewMode=story');
    cy.matchImageSnapshot('topic-style');
  });

  it('topic color', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--background-color&viewMode=story');
    cy.matchImageSnapshot('topic-color');
  });
  // Review topic use of designer ...
  it.skip('topic note feature', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--note-feature&viewMode=story');
    cy.matchImageSnapshot('topic-note');
  });
  it.skip('topic link feature', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--link-feature&viewMode=story');
    cy.matchImageSnapshot('topic-link-feature');
  });
  it('topic icon feature', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--icon-feature&viewMode=story');
    cy.matchImageSnapshot('topic-icon-feature');
  });
  it('topic shape line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-line&viewMode=story');
    cy.matchImageSnapshot('topic-shape-line');
  });
  it('topic ellipse line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-ellipse&viewMode=story');
    cy.matchImageSnapshot('topic-shape-ellipse');
  });
  it('topic none line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-none&viewMode=story');
    cy.matchImageSnapshot('topic-shape-none');
  });
});