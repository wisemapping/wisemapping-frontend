/// <reference types="cypress" />
describe('Topic Icon Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Open panel', () => {
    cy.onClickToolbarButton('Add Icon');
    // Icon images must be loaded. No better solution than wait.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.matchImageSnapshot('icons-pannel');
  });

  it('Add new icon', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    cy.get('[aria-label="grinning"]').click();
    cy.matchImageSnapshot('add-new-icon');
  });

  it('Verify image icons load correctly', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify that the icon panel is open and contains the "Icon" title
    cy.contains('Icon').should('be.visible');

    // Verify that images are loaded in the panel (this confirms webpack asset processing works)
    cy.get('img').should('have.length.gt', 0);

    // Check that at least one image has a src attribute (confirming image loading works)
    cy.get('img').first().should('have.attr', 'src').and('not.be.empty');

    // Test that icon functionality works by clicking on an icon
    cy.get('[aria-label="grinning"]').should('be.visible').click();

    // Take a snapshot to verify the test completes successfully
    cy.matchImageSnapshot('verify-icon-fix-works');
  });

  it('Verify icons panel with "show images" enabled loads PNG/SVG icons correctly', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Find and click the "Show images" switch to enable image mode
    // Target the actual switch input element
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for image icons to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify that image icons are now displayed instead of emojis
    // The image icons should be rendered as img elements with src attributes
    cy.get('img').should('have.length.gt', 0);

    // Enhanced validation: Check that ALL images have valid src attributes
    cy.get('img').each(($img) => {
      cy.wrap($img)
        .should('have.attr', 'src')
        .and('not.be.empty')
        .and('not.include', 'undefined')
        .and('not.include', '../assets/'); // Should not contain raw relative paths
    });

    // Test clicking on an image icon to verify functionality
    // The images are rendered inside clickable containers, so we need to find the right element
    cy.get('img').first().parent().click({ force: true });

    // Take a snapshot to verify the image icons loaded correctly
    cy.matchImageSnapshot('show-images-enabled-works');
  });

  it('Verify no network errors when loading image icons', () => {
    // Monitor network requests for 404 errors
    cy.intercept('**/*.svg', (req) => {
      // If any SVG request would result in 404, fail the test
      req.continue((res) => {
        if (res.statusCode === 404) {
          throw new Error(`404 error loading SVG: ${req.url}`);
        }
      });
    }).as('svgRequests');

    cy.intercept('**/*.png', (req) => {
      // If any PNG request would result in 404, fail the test
      req.continue((res) => {
        if (res.statusCode === 404) {
          throw new Error(`404 error loading PNG: ${req.url}`);
        }
      });
    }).as('pngRequests');

    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Enable image mode
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for all images to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);

    // The test passes if no network errors were thrown above
    cy.matchImageSnapshot('no-network-errors-image-icons');
  });

  it('Remove icon from topic', () => {
    // First add an emoji icon
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Add a regular emoji (should be in emoji mode by default)
    cy.get('[aria-label="grinning"]').click();

    // Wait for icon to be applied
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Now add an image icon to the same topic to replace the emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for image icons to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Add an image icon to replace the emoji
    cy.get('img').first().parent().click({ force: true });

    // Wait for change to apply
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Take a snapshot to verify the icon was replaced
    cy.matchImageSnapshot('icon-replaced-successfully');
  });

  it('Replace emoji with different emoji', () => {
    // Add first emoji
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Click grinning emoji
    cy.get('[aria-label="grinning"]').click();

    // Wait for application
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Replace with a different emoji
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Click a different emoji - try to find a heart emoji or use a different one
    cy.get('[aria-label*="heart"]').first().click();

    // Take snapshot to verify emoji replacement
    cy.matchImageSnapshot('emoji-replaced-with-different-emoji');
  });
});
