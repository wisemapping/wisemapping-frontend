/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
/// <reference types="cypress" />
describe.skip('Mobile Text Editing Suite', () => {
    beforeEach(() => {
        cy.visit('/map-render/html/editor.html');
        cy.waitEditorLoaded();

        // Capture and log any console errors
        cy.window().then((win) => {
            win.addEventListener('error', (e) => {
                console.log('========== WINDOW ERROR ==========');
                console.log('Message:', e.message);
                console.log('Filename:', e.filename);
                console.log('Line:', e.lineno, 'Col:', e.colno);
                console.log('Error object:', e.error);
                console.log('==================================');
            });
        });
    });

    it('should allow editing text after double-tap on mobile', () => {
        // Select a topic
        cy.focusTopicByText('Mind Mapping');

        // Get the topic element
        cy.get('svg > g > g[test-id="1"]').as('topic');

        // Simulate mobile double-tap by triggering dblclick event
        cy.get('@topic').dblclick();

        // Wait for the text editor to appear
        cy.get('#textContainer', { timeout: 5000 }).should('be.visible');

        // Get the textarea element
        cy.get('#textContainer textarea').as('textarea');

        // Verify the textarea is visible
        cy.get('@textarea').should('be.visible');

        // The key test: can we type immediately?
        // Clear and type new text
        cy.get('@textarea').clear().type('Updated Text');

        // Verify the text was updated
        cy.get('@textarea').should('have.value', 'Updated Text');

        // Take snapshot
        cy.matchImageSnapshot('mobile-double-tap-text-editing-works');
    });

    it('should maintain editor visibility when helper elements would appear', () => {
        // Select a leaf topic (one without children)
        cy.focusTopicByText('Mind Mapping');

        // Add a child topic first
        cy.get('body').type('{tab}');
        cy.wait(300);

        // Type some text for the new topic
        cy.get('#textContainer textarea').should('be.visible');
        cy.get('#textContainer textarea').type('Test Topic{enter}');
        cy.wait(300);

        // Now select this new topic (which should show helper elements)
        cy.focusTopicByText('Test Topic');

        // Wait for any helper elements to potentially appear
        cy.wait(500);

        // Double-click to edit
        cy.get('svg > g > g').contains('Test Topic').parent().parent().dblclick();

        // Wait for the text editor to appear
        cy.get('#textContainer textarea', { timeout: 5000 }).should('be.visible');

        // Verify we can type (this is the real test)
        cy.get('#textContainer textarea').type(' Modified');

        // Verify the text includes our modification
        cy.get('#textContainer textarea').should('contain.value', 'Modified');

        // Take snapshot
        cy.matchImageSnapshot('mobile-editing-with-helpers');
    });
});
