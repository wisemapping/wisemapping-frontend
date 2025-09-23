/// <reference types="cypress" />

describe('Import Functionality', () => {
  beforeEach(() => {
    cy.visit('/c/maps');
    cy.waitForPageLoaded();
  });

  it('should import Freeplane .mm file successfully', () => {
    // Create a sample Freeplane .mm file content
    const freeplaneContent = `<?xml version="1.0" encoding="UTF-8"?>
<map version="freeplane 1.9.13">
  <node TEXT="Freeplane Root" ID="ID_1" CREATED="1640995200000" MODIFIED="1640995200000">
    <node TEXT="Child 1" ID="ID_2" CREATED="1640995200000" MODIFIED="1640995200000" POSITION="right"/>
    <node TEXT="Child 2" ID="ID_3" CREATED="1640995200000" MODIFIED="1640995200000" POSITION="right"/>
  </node>
</map>`;

    // Create a blob from the content
    const blob = new Blob([freeplaneContent], { type: 'application/xml' });
    const file = new File([blob], 'test-freeplane.mm', { type: 'application/xml' });

    // Intercept the import API call
    cy.intercept('POST', '**/maps/import', {
      statusCode: 200,
      body: {
        id: 'test-map-id',
        title: 'test-freeplane',
        description: '',
        public: false,
      },
    }).as('importMap');

    // Click the import button
    cy.get('[data-testid="import-button"]').click();

    // Wait for the import dialog to appear
    cy.get('[data-testid="import-dialog"]').should('be.visible');

    // Upload the file
    cy.get('input[type="file"]').selectFile(
      {
        contents: file,
        fileName: 'test-freeplane.mm',
        mimeType: 'application/xml',
      },
      { force: true },
    );

    // Click the import button in the dialog
    cy.get('[data-testid="import-submit"]').click();

    // Wait for the import API call
    cy.wait('@importMap');

    // Verify success message or redirect
    cy.url().should('include', '/c/maps');

    // Verify the map appears in the list
    cy.get('[data-testid="map-card"]').should('contain', 'test-freeplane');
  });

  it('should import Freeplane .mmx file successfully', () => {
    // Create a sample Freeplane .mmx file content
    const freeplaneContent = `<?xml version="1.0" encoding="UTF-8"?>
<map version="freeplane 1.9.13">
  <node TEXT="Freeplane MMX Root" ID="ID_1" CREATED="1640995200000" MODIFIED="1640995200000">
    <node TEXT="MMX Child 1" ID="ID_2" CREATED="1640995200000" MODIFIED="1640995200000" POSITION="right"/>
    <node TEXT="MMX Child 2" ID="ID_3" CREATED="1640995200000" MODIFIED="1640995200000" POSITION="right"/>
  </node>
</map>`;

    // Create a blob from the content
    const blob = new Blob([freeplaneContent], { type: 'application/xml' });
    const file = new File([blob], 'test-freeplane.mmx', { type: 'application/xml' });

    // Intercept the import API call
    cy.intercept('POST', '**/maps/import', {
      statusCode: 200,
      body: {
        id: 'test-map-id-2',
        title: 'test-freeplane-mmx',
        description: '',
        public: false,
      },
    }).as('importMapMMX');

    // Click the import button
    cy.get('[data-testid="import-button"]').click();

    // Wait for the import dialog to appear
    cy.get('[data-testid="import-dialog"]').should('be.visible');

    // Upload the file
    cy.get('input[type="file"]').selectFile(
      {
        contents: file,
        fileName: 'test-freeplane.mmx',
        mimeType: 'application/xml',
      },
      { force: true },
    );

    // Click the import button in the dialog
    cy.get('[data-testid="import-submit"]').click();

    // Wait for the import API call
    cy.wait('@importMapMMX');

    // Verify success message or redirect
    cy.url().should('include', '/c/maps');

    // Verify the map appears in the list
    cy.get('[data-testid="map-card"]').should('contain', 'test-freeplane-mmx');
  });

  it('should show error for invalid Freeplane file', () => {
    // Create invalid content
    const invalidContent = 'This is not a valid Freeplane file';

    // Create a blob from the content
    const blob = new Blob([invalidContent], { type: 'text/plain' });
    const file = new File([blob], 'invalid.mm', { type: 'text/plain' });

    // Intercept the import API call to return an error
    cy.intercept('POST', '**/maps/import', {
      statusCode: 400,
      body: {
        error: 'Invalid file format',
      },
    }).as('importError');

    // Click the import button
    cy.get('[data-testid="import-button"]').click();

    // Wait for the import dialog to appear
    cy.get('[data-testid="import-dialog"]').should('be.visible');

    // Upload the file
    cy.get('input[type="file"]').selectFile(
      {
        contents: file,
        fileName: 'invalid.mm',
        mimeType: 'text/plain',
      },
      { force: true },
    );

    // Click the import button in the dialog
    cy.get('[data-testid="import-submit"]').click();

    // Wait for the import API call
    cy.wait('@importError');

    // Verify error message is shown
    cy.get('[data-testid="import-error"]').should('be.visible');
    cy.get('[data-testid="import-error"]').should('contain', 'Invalid file format');
  });

  it('should accept multiple Freeplane file formats', () => {
    // Click the import button
    cy.get('[data-testid="import-button"]').click();

    // Wait for the import dialog to appear
    cy.get('[data-testid="import-dialog"]').should('be.visible');

    // Check that the file input accepts .mm and .mmx files
    cy.get('input[type="file"]').should('have.attr', 'accept').and('include', '.mm');
    cy.get('input[type="file"]').should('have.attr', 'accept').and('include', '.mmx');
  });
});
