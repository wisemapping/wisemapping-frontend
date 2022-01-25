# Running tests with cypress. 

For details on why we picked Cypress, check the following [PR](https://bitbucket.org/wisemapping/wisemapping-frontend/pull-requests/1)

Check the [Cypress docs](https://docs.cypress.io/guides/overview/why-cypress.html) for more information

## How to run it

- To run the test cases headless run: `yarn test`
- To debug the tests you can use cypress interactive UI by running `yarn cypress open` (You will need to have the UI running in a separate terminal `yarn start`)


## How to write a new test case

Any new test cases should be added under the `cypress/integration` folder. Aim to group similar test cases in one file. 

If any stub/mock is needed, those should be added to `cypress/fixtures` folder. Cypress has a [built in way](https://docs.cypress.io/api/commands/fixture.html#Usage) of using those. 

We use `data-testid` as a practice to define selectors in the code and we leverage the [Cypress Testing Library plugin](https://testing-library.com/docs/cypress-testing-library/intro/) to find the elements in the tests. 
- We leverage a `data-testid` or selecting by text (`findAllByText`, `findByText`) to make sure the test cases are decoupled from the implementation. 

We leverage the [Page Object Pattern](https://martinfowler.com/bliki/PageObject.html) to abstract away selectors and actions and simplify changes required to future refactors. Take a look to any example under the `cypress/pageObject` folder to see how that pattern is implemented.

Finally any common functionality such as for example `login` should be abstracted into a command. CY Commands can be added into the `cypress/support` folder. Feel free to group similar commands into files (You only need to make sure those get imported into the `cypress/support/index.ts` file) 

Happy testing!!!
