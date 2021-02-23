export default class MapsPage {
    static isLoaded() {
        return cy.findByTestId('create');
    }

    static create() {
        return cy.findByTestId('create').click();
    }

    static isCreateDialogVisible() {
        //TODO move to findByText when the double create dialog issue is solved
        return cy.findAllByText('Create a new mindmap');
    }
}
