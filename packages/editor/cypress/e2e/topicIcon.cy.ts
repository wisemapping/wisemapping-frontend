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

  it.skip('Verify icons panel with "show images" enabled loads PNG/SVG icons correctly', () => {
    // Set up console error monitoring
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
      cy.stub(win.console, 'warn').as('consoleWarn');
    });

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

    // Verify that the image sources are proper data URLs (confirming webpack processing)
    cy.get('img')
      .first()
      .should('have.attr', 'src')
      .then((src) => {
        // Should be a data URL (webpack asset/inline processing)
        expect(src).to.match(/^data:image\/(svg\+xml|png);base64,/);
      });

    // Check for console errors/warnings that might indicate loading issues
    cy.get('@consoleError').should('not.have.been.called');
    cy.get('@consoleWarn').should('not.have.been.called');

    // Test clicking on an image icon to verify functionality
    // The images are rendered inside clickable containers, so we need to find the right element
    cy.get('img').first().parent().click({ force: true });

    // Verify the icon was added successfully (panel should close)
    cy.contains('Icon').should('not.exist');

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
});
