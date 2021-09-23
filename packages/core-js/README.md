# `core-js`

Core-JS defines custom functions for the **Wisemapping** ecosystem.

## Quick Start

1. Clone repository with the next command:

```
git clone https://[username]@bitbucket.org/wisemapping/wisemapping-frontend.git
```

where the variable _username_ is you username of Bitbucket.

_Note:The project is configured to use the yarn dependency manager_

2. Move to folder core-js

```
cd packages/core-js
```

3. Now you need install all dependence, this is done with command `yarn install`

4. To start the development enviroment you have to use command `yarn start`.

## Production

To build up the package core-js and use in production, you have to use command `yarn build`

## Usage

To start using core-js it has to be required as a module and then intanciarce as a function

```
const coreJs = require('core-js');
coreJs();
```
