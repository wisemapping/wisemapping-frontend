/// <reference types="cypress" />
describe('Change topic position', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Move up node "Mind Mapping"', () => {
    const position = { clientX: 270, clientY: 160 };
    cy.contains('Mind Mapping').trigger('mousedown');
    cy.get('body').trigger('mousemove', position);
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('moveupNode');
  });

  it('Move down node "Mind Mapping"', () => {
    cy.contains('Mind Mapping').trigger('mousedown');
    cy.get('body').trigger('mousemove', { clientX: 350, clientY: 380 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('movedownNode');
  });

  it('Move default position node "Mind Mapping"', () => {
    cy.contains('Mind Mapping').trigger('mousedown');
    cy.get('body').trigger('mousemove', { clientX: 270, clientY: 240 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('moveDefaultPosition');
  });

  it('Move left node "Mind Mapping"', () => {
    cy.contains('Mind Mapping').trigger('mousedown');
    cy.get('body').trigger('mousemove', { clientX: 700, clientY: 240 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('moveleftNode');
  });
});
