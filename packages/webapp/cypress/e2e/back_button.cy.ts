/// <reference types="cypress" />

describe('Editor Back Button', () => {
    beforeEach(() => {
        cy.visit('/c/maps/1/edit');
        cy.waitForEditorLoaded();
    });

    it('should navigate back to maps list when back button is clicked', () => {
        // Click the back button (arrow icon)
        // The button has a tooltip "Back to maps list" which becomes the aria-label
        cy.get('[aria-label="Back to maps list"]').click();

        // Verify navigation to map list
        // Note: The app might redirect to /c/maps or /c/maps/ depending on router config, allow both
        cy.location('pathname').should('match', /\/c\/maps\/?$/);
    });
});

describe('Try Mode Back Button', () => {
    it('should navigate back to previous page when back button is clicked', () => {
        // 1. Start at a "previous" page
        cy.visit('/c/maps');

        // 2. Navigate to the try mode URL
        // We use window.location to simulate a real navigation that pushes to history, 
        // effectively similar to clicking a link or cy.visit (which also works for history usually)
        cy.visit('/c/maps/1/try');
        cy.waitForEditorLoaded();

        // 3. Click the back button
        cy.get('[aria-label="Back to maps list"]').click();

        // 4. Verify we are back at the previous page
        cy.location('pathname').should('match', /\/c\/maps\/?$/);
    });
});
