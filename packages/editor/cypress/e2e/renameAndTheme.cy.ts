/// <reference types="cypress" />
describe('Rename and Theme functionality', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Select root node
    cy.focusTopicByText('Mind Mapping');
  });

  it('should rename the mind map title', () => {
    // Click on the title to enter edit mode
    cy.get('[data-testid="app-bar-title"]').click();
    
    // Clear the existing title and type new title
    cy.get('[data-testid="app-bar-title"] input').clear().type('My New Mind Map Title');
    
    // Press Enter to save
    cy.get('[data-testid="app-bar-title"] input').type('{enter}');
    
    // Wait for the title to update and verify it
    cy.get('[data-testid="app-bar-title"] input').should('have.value', 'My New Mind Map Title');
    
    // Take snapshot
    cy.matchImageSnapshot('rename-mindmap-title');
  });

  it('should cancel rename when pressing Escape', () => {
    // Get the current title first
    cy.get('[data-testid="app-bar-title"] input').then(($input) => {
      const originalTitle = $input.val();
      
      // Click on the title to enter edit mode
      cy.get('[data-testid="app-bar-title"]').click();
      
      // Type new title
      cy.get('[data-testid="app-bar-title"] input').clear().type('This should be cancelled');
      
      // Press Escape to cancel
      cy.get('[data-testid="app-bar-title"] input').type('{esc}');
      
      // Wait for the title to revert and verify it
      cy.get('[data-testid="app-bar-title"] input').should('have.value', originalTitle);
      
      // Take snapshot
      cy.matchImageSnapshot('cancel-rename-mindmap-title');
    });
  });

  it('should show tooltip on title hover', () => {
    // Hover over the title
    cy.get('[data-testid="app-bar-title"]').trigger('mouseover');
    
    // Verify tooltip appears with "Rename" text
    cy.get('[role="tooltip"]').should('contain', 'Rename');
    
    // Take snapshot
    cy.matchImageSnapshot('title-tooltip-hover');
  });

  it('should open theme dialog and select a theme', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Verify theme dialog is open
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').should('contain', 'Choose Theme');
    
    // Verify theme options are present
    cy.get('[role="dialog"]').should('contain', 'Classic');
    cy.get('[role="dialog"]').should('contain', 'Summer');
    cy.get('[role="dialog"]').should('contain', 'Dark');
    cy.get('[role="dialog"]').should('contain', 'Robot');
    
    // Select a different theme (e.g., Summer)
    cy.get('[role="dialog"]').contains('Summer').click();
    
    // Click Apply Theme button
    cy.get('[role="dialog"]').contains('Apply Theme').click();
    
    // Verify dialog is closed
    cy.get('[role="dialog"]').should('not.exist');
    
    // Take snapshot
    cy.matchImageSnapshot('theme-selection-dialog');
  });

  it('should cancel theme selection', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Verify theme dialog is open
    cy.get('[role="dialog"]').should('be.visible');
    
    // Select a theme
    cy.get('[role="dialog"]').contains('Summer').click();
    
    // Click Cancel button
    cy.get('[role="dialog"]').contains('Cancel').click();
    
    // Verify dialog is closed
    cy.get('[role="dialog"]').should('not.exist');
    
    // Take snapshot
    cy.matchImageSnapshot('theme-cancel-dialog');
  });

  it('should show theme description in dialog', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Verify theme dialog is open
    cy.get('[role="dialog"]').should('be.visible');
    
    // Verify theme description is present
    cy.get('[role="dialog"]').should('contain', 'A theme defines the visual style of your mind map');
    
    // Verify theme cards have descriptions
    cy.get('[role="dialog"]').should('contain', 'Clean and professional design with blue accents');
    cy.get('[role="dialog"]').should('contain', 'Bright and vibrant orange theme');
    cy.get('[role="dialog"]').should('contain', 'Modern dark theme with purple accents');
    cy.get('[role="dialog"]').should('contain', 'Tech-inspired green theme');
    
    // Take snapshot
    cy.matchImageSnapshot('theme-descriptions-dialog');
  });

  it('should close theme dialog when clicking outside', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Verify theme dialog is open
    cy.get('[role="dialog"]').should('be.visible');
    
    // Click outside the dialog (on the backdrop)
    cy.get('[role="dialog"]').parent().click(0, 0);
    
    // Verify dialog is closed
    cy.get('[role="dialog"]').should('not.exist');
    
    // Take snapshot
    cy.matchImageSnapshot('theme-dialog-backdrop-close');
  });
});
