/// <reference types="cypress" />

declare namespace Cypress {
  interface Cypress {
    /**
     * Internal Cypress API, missing from the public typings. `state('window')` is the AUT window,
     * undefined when the test has not loaded a page (cy.request() only).
     */
    state(key: 'window'): AUTWindow | undefined;
  }

  interface Chainable {
    /**
     * Custom command to access the editor web component shadow root.
     */
    getMindplotShadowRoot(): Chainable<JQuery<HTMLElement>>;

    /**
     * Custom command to wait for the editor to be fully loaded.
     */
    waitForEditorLoaded(): Chainable<void>;

    /**
     * Custom command to wait for the page to be fully loaded.
     */
    waitForPageLoaded(): Chainable<void>;
  }
}
