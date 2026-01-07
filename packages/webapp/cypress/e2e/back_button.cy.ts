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
