context('Topic suite', () => {
  // Test to ensure all topic stories load without import/export errors
  it('all topic stories load successfully without errors', () => {
    const stories = [
      'border-style',
      'font-style',
      'background-color',
      'icon-feature',
      'shape-none',
      'shape-ellipse',
      'shape-line',
    ];

    stories.forEach((story) => {
      cy.visit(`/iframe.html?args=&id=mindplot-topic--${story}&viewMode=story`);

      // Wait for story to load
      cy.get('body', { timeout: 10000 }).should('be.visible');

      // Ensure the story content is rendered (should contain SVG elements from mindplot)
      cy.get('body').should('contain.html', '<svg');
      cy.get('svg').should('exist').and('be.visible');

      // Main validation: story should render successfully with SVG content
    });
  });

  it('topic border', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--border-style&viewMode=story');
    cy.matchImageSnapshot('topic-border');
  });

  it('topic style', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--font-style&viewMode=story');
    cy.matchImageSnapshot('topic-style');
  });

  it('topic color', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--background-color&viewMode=story');
    cy.matchImageSnapshot('topic-color');
  });
  it('topic note feature', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--note-feature&viewMode=story');
    cy.matchImageSnapshot('topic-note');
  });
  it('topic link feature', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--link-feature&viewMode=story');
    cy.matchImageSnapshot('topic-link-feature');
  });
  it('topic icon feature', () => {
    // Intercept network requests to check for 404 errors on icon files
    const failedRequests = [];

    cy.intercept('GET', '**/*.svg', (req) => {
      req.continue((res) => {
        if (res.statusCode === 404) {
          failedRequests.push(req.url);
        }
      });
    }).as('svgRequests');

    cy.visit('/iframe.html?args=&id=mindplot-topic--icon-feature&viewMode=story');

    // Wait for the story to fully load and icons to be rendered (replaces cy.wait(2000))
    cy.get('svg', { timeout: 10000 }).should('be.visible');
    // Wait for any image elements (icons) to be present if they exist, or for SVG to be stable
    cy.get('body').should('contain.html', '<svg');

    // Check that no SVG requests failed with 404
    cy.then(() => {
      expect(failedRequests, 'SVG icons should not return 404 errors').to.have.length(0);
    });

    // Check that image elements have valid sources (data URLs or proper paths) if they exist
    cy.get('body').then(($body) => {
      if ($body.find('image').length > 0) {
        cy.get('image').then(($images) => {
          $images.each((index, img) => {
            const href = img.getAttribute('href') || img.getAttribute('xlink:href');

            // Icon should have a valid href (data URL or proper path)
            expect(href, `Icon ${index} should have a valid href`).to.exist;
            expect(href, `Icon ${index} href should not be empty`).to.not.be.empty;

            // If it's not a data URL, it should be a proper path (not relative paths that would cause 404s)
            if (!href.startsWith('data:')) {
              expect(
                href,
                `Icon ${index} should not use relative paths that cause 404s`,
              ).to.not.match(/^\.\.\/\.\.\/assets\/icons\//);
            }
          });
        });
      } else {
        // If no image elements are found, that's also valid - the story might not have icons
        cy.log('No image elements found in the story - this is valid');
      }
    });

    cy.matchImageSnapshot('topic-icon-feature');
  });
  it('topic shape line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-line&viewMode=story');
    cy.matchImageSnapshot('topic-shape-line');
  });
  it('topic ellipse line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-ellipse&viewMode=story');
    cy.matchImageSnapshot('topic-shape-ellipse');
  });
  it('topic none line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-none&viewMode=story');
    cy.matchImageSnapshot('topic-shape-none');
  });
});
