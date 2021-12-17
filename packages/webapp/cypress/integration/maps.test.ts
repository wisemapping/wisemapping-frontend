import MapsPage from '../pageObject/MapsPage';

context('Maps Page', () => {
    beforeEach(() => {
        cy.visit('/c/maps');
    });

    it('should load the maps page', () => {
        MapsPage.isLoaded();
    });

    it('should open the create dialog', () => {
        MapsPage.create();
        MapsPage.isCreateDialogVisible();
        cy.matchImageSnapshot('maps-create');
    });

    it('should match the snapshot', () => {
        cy.matchImageSnapshot('maps');
    });
});
