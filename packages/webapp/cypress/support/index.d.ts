/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to wait for the editor to be fully loaded.
         */
        waitForEditorLoaded(): Chainable<void>;

        /**
         * Custom command to wait for the page to be fully loaded.
         */
        waitForPageLoaded(): Chainable<void>;

        /**
         * Custom command to match image snapshot
         */
        matchImageSnapshot(nameOrOptions?: string | Object): Chainable<void>;
    }
}
