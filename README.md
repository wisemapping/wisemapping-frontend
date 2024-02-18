# WiseMapping Frond End

WiseMapping Frond End is part of the [MindMap Open Source Project](http://www.wisemapping.org). The first release of WiseMapping was in 2010 and there was not mayor update on the architecture. In 2021, a major change started with the goal to provide a visual and technology refresh of the project. 

WiseMapping Front extracts all the UI related aspects in this repository. You will find three major modules:

* Web2D: Lighway abstraction over SVG for chart renderding.
* Mindplot: Pure vanilla ES6 classes responsible for providing mindmap rendering and edition capabilities.
* Webapp: REACT application that encompass the whole midnmap edition experience.

## Getting started

Make sure you have NodeJs installed (version compatible with `package.json` engine), and yarn installed (`npm i -g yarn`).

```
nvm use
yarn install
```

Please refer to each package's Readme.md for anything specific to the package.

If you want to contribute, please check out [CONTRIBUTING.md](./CONTRIBUTING.md).

## Useful scripts

Each package might provide the following scripts.  
You can run these for all packages by running it from the root folder. Alternatively you can run it for a specific package by passing the `--scope` option.

### build

> Production builds

`yarn build`

## lint

> run eslint

`yarn lint`

## playground

> start a devServer with some browsable examples

`yarn playground --scope @wisemapping/web2d`
`yarn playground --scope @wisemapping/mindplot`

## test

> run all the tests

`yarn test`

> run only integration tests

`yarn test:integration`

> run only unit tests

`yarn test:unit`

## Image Snapshot Testing

We use [cypress-image-snapshot](https://www.npmjs.com/package/cypress-image-snapshot) for snapshot testing. This is a relatively cheap way of identifying behavior changes based on page screenshots. See [visual testing docs](https://docs.cypress.io/guides/tooling/visual-testing) for more information.

When a test that contains a `matchImageSnapshot` call is run, it compares the snapshot to the corresponding one in the `snapshots` directory. If Any change is detected, the test will fail, and the diff can be found in the `cypress/snapshots/*/__diff_output__` folder. If the change is intentional, we should "accept" those changes by updating the snapshot and include it in the commit.

There is a [caveat](https://github.com/jaredpalmer/cypress-image-snapshot/issues/98) where colors, fonts or ui may differ depending on the host machine running the tests.

A workaround for this is to run the tests using docker. Make sure you have docker and docker-compose installed.

Run snapshot tests: `docker-compose -f docker-compose.snapshots.yml up`  
If anything changed, and the change was intentional, update the snapshots and then commit the new images to source control.  
Update snapshots: `docker-compose -f docker-compose.snapshots.update.yml up` 
