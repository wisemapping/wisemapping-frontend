import MapsPage from '../pageObject/MapsPage'

context('Maps Page', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/c/maps')
    })

    it('should load the maps page', () => {
        MapsPage.isLoaded()
    })

    it('should open the create dialog', () => {
        MapsPage.create()
        MapsPage.isCreateDialogVisible()
    })
})
