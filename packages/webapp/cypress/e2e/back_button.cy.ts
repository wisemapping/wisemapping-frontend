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
    it('should navigate back to maps list when back button is clicked', () => {
        // 1. Visit the try mode URL directly
        cy.visit('/c/maps/1/try');
        cy.waitForEditorLoaded();

        // 2. Mock the history.back method to verify it is called
        cy.window().then((win) => {
            cy.spy(win.history, 'back').as('historyBack');
        });

        // 3. Click the back button
        cy.get('[aria-label="Back to maps list"]').click();

        // 4. Verify history.back was called
        cy.get('@historyBack').should('have.been.calledOnce');
    });
});

