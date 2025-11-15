/**
 * Regression tests to ensure Storybook stories load without errors
 */
context('Storybook Regression Tests', () => {
  it('connection stories load and render successfully', () => {
    const connectionStories = ['classic', 'prism', 'robot', 'sunrise', 'ocean'];

    connectionStories.forEach((variant) => {
      cy.visit(`/iframe.html?args=&id=mindplot-connection--${variant}&viewMode=story`);

      // Wait for the story to load
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Verify content is rendered with SVG
      cy.get('body').should('contain.html', '<svg');
      cy.get('svg').should('exist').and('be.visible');

      // Main validation: story should render successfully with SVG content
      // (The core functionality is working if SVG renders correctly)
    });
  });

  it('topic stories load and render successfully', () => {
    const topicStories = [
      'border-style',
      'font-style',
      'background-color',
      'icon-feature',
      'shape-none',
      'shape-ellipse',
      'shape-line',
    ];

    topicStories.forEach((variant) => {
      cy.visit(`/iframe.html?args=&id=mindplot-topic--${variant}&viewMode=story`);

      // Wait for the story to load
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Verify content is rendered with SVG
      cy.get('body').should('contain.html', '<svg');
      cy.get('svg').should('exist').and('be.visible');

      // Main validation: story should render successfully with SVG content
      // (The core functionality is working if SVG renders correctly)
    });
  });

  it('mindplot components render with expected structure', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--classic&viewMode=story');

    // Wait for the story to load
    cy.get('body', { timeout: 15000 }).should('be.visible');

    // Verify SVG elements are present (indicating successful render)
    cy.get('svg').should('exist').and('be.visible');

    // Verify the story loaded without showing error elements
    cy.get('[data-testid="error-message"]').should('not.exist');
    cy.get('.error').should('not.exist');
  });

  it.skip('supports inserting a newline at the caret using modifier + Enter', () => {
    cy.visit('/iframe.html?args=&id=mindplot-texteditor--multiline-editor&viewMode=story');

    cy.contains('Border Style', { timeout: 15000 }).should('be.visible').dblclick({ force: true });

    // Wait for the editor container to exist and be displayed (it has height: 0 by design)
    cy.get('#textContainer', { timeout: 5000 })
      .should('exist')
      .should('have.css', 'display', 'block');

    // Wait for the textarea to exist and have the expected value
    // Note: textarea may not be "visible" per Cypress due to container height: 0,
    // but it's still functional and can be interacted with
    cy.get('#textContainer textarea', { timeout: 5000 })
      .should('exist')
      .and('have.value', 'Border Style')
      .as('multilineEditor');

    // Set cursor position and verify state before triggering keydown
    cy.get('@multilineEditor').then(($textarea) => {
      const textarea = $textarea.get(0);
      expect(textarea).to.not.be.undefined;
      if (textarea instanceof HTMLTextAreaElement) {
        // Ensure textarea has the expected value
        expect(textarea.value).to.eq('Border Style');
        // Focus and set selection
        textarea.focus();
        textarea.setSelectionRange(1, 1);
        // Verify selection was set correctly
        expect(textarea.selectionStart).to.eq(1);
        expect(textarea.selectionEnd).to.eq(1);
      }
    });

    // Wait a bit to ensure focus and selection are applied
    cy.wait(100);

    // Verify state one more time before triggering the event
    cy.get('@multilineEditor').then(($textarea) => {
      const textarea = $textarea.get(0);
      if (textarea instanceof HTMLTextAreaElement) {
        // Ensure textarea still has the value and selection
        expect(textarea.value).to.eq('Border Style');
        expect(textarea.selectionStart).to.eq(1);
        expect(textarea.selectionEnd).to.eq(1);
      }
    });

    // Trigger the keydown event on the textarea element
    cy.get('@multilineEditor').then(($textarea) => {
      const textarea = $textarea.get(0);
      if (textarea instanceof HTMLTextAreaElement) {
        // Ensure textarea has the correct value and selection before event
        if (textarea.value !== 'Border Style') {
          textarea.value = 'Border Style';
        }
        textarea.focus();
        textarea.setSelectionRange(1, 1);

        // Verify one final time
        expect(textarea.value).to.eq('Border Style');
        expect(textarea.selectionStart).to.eq(1);
        expect(textarea.selectionEnd).to.eq(1);

        // Create and dispatch a proper KeyboardEvent
        // Note: We need to set code property separately as it's not always set by constructor
        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          metaKey: true,
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        // Set code property explicitly (required by the handler)
        Object.defineProperty(keydownEvent, 'code', {
          value: 'Enter',
          writable: false,
        });
        textarea.dispatchEvent(keydownEvent);
      }
    });

    // Wait for the event handler to process and update the textarea
    cy.wait(100);

    // Verify the textarea has the expected value with newline
    cy.get('@multilineEditor').should('have.value', 'B\norder Style');

    cy.get('@multilineEditor').should(($textarea) => {
      const textarea = $textarea.get(0);
      expect(textarea).to.not.be.undefined;
      if (textarea instanceof HTMLTextAreaElement) {
        expect(textarea.selectionStart).to.eq(2);
        expect(textarea.selectionEnd).to.eq(2);
      }
    });
  });
});
