/// <reference types="cypress" />
describe('Image Emoji Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add image emoji to topic', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode by checking the "Show images" switch  
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for image icons to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify that image icons are displayed
    cy.get('img').should('have.length.gt', 0);

    // Click on the first image icon to add it
    cy.get('img').first().parent().click({ force: true });

    // Take a snapshot to verify the image emoji was added
    cy.matchImageSnapshot('image-emoji-added');
  });

  it('Replace image emoji with another image emoji', () => {
    // First add an image emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for image icons to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Add the first image icon
    cy.get('img').first().parent().click({ force: true });

    // Wait a bit for the icon to be applied
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Now replace it with a different image emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode again
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for image icons to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Click on a different image (second one) to replace the first
    cy.get('img').eq(1).parent().click({ force: true });

    // Take a snapshot to verify the image emoji was replaced
    cy.matchImageSnapshot('image-emoji-replaced');
  });

  it('Switch between emoji and image modes', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Initially in emoji mode - verify emoji elements are present
    cy.get('[aria-label="grinning"]').should('be.visible');

    // Switch to image mode
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for switch
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify image icons are now visible and emoji picker is not
    cy.get('img').should('have.length.gt', 0);
    cy.get('[aria-label="grinning"]').should('not.exist');

    // Switch back to emoji mode
    cy.get('input[type="checkbox"]').uncheck({ force: true });

    // Wait for switch
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify emoji picker is back
    cy.get('[aria-label="grinning"]').should('be.visible');
    
    // Close the panel by pressing escape
    cy.get('body').type('{esc}');
    
    // Take a snapshot of the final state
    cy.matchImageSnapshot('emoji-mode-active');
  });

  it('Add emoji vs image emoji have different values', () => {
    // Add a regular emoji first
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Click on a regular emoji (should be in emoji mode by default)
    cy.get('[aria-label="grinning"]').click();

    // Now add an image emoji to another topic
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for images to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Add an image icon
    cy.get('img').first().parent().click({ force: true });

    // Take a snapshot showing both types of icons
    cy.matchImageSnapshot('emoji-and-image-emoji-comparison');
  });

  it('Verify image emoji renders correctly in topic', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for images
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Click on a specific image icon to add it
    cy.get('img').first().parent().click({ force: true });

    // Wait for the icon to be applied to the topic
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify the topic now has some visual change - check for SVG or image elements
    cy.get('[test-id="3"]').should('be.visible');
    
    // Look for any image-related elements that might have been added
    cy.get('svg image, img').should('have.length.gt', 0);

    // Take a snapshot to verify proper rendering
    cy.matchImageSnapshot('image-emoji-renders-in-topic');
  });
});