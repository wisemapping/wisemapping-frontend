# `Mindplot`

The Mindplot is manager all **Wisemapping**. In it is implemented the packages of `core-js` and `web2d`.

## Quick Start

1. Clone repository with the next command:

```
git clone https://[username]@bitbucket.org/wisemapping/wisemapping-frontend.git
```

where the variable _username_ is you username of Bitbucket.

_Note:The project is configured to use the yarn dependency manager_

2. Move to folder mindplot

```
cd packages/mindplot
```

3. Now you need install all dependence, this is done with command `yarn install`

4. To start the development enviroment you have to use command `yarn start`.

## Production

To build up the package mindplot and use in production, you have to use command `yarn build`

## Playground

For the testings of mindplot you need use command `yarn playground` for run this enviroment.
once this is done, it will open the explorer where you can see a menu with the tests carried out.

## Usage

To start using mindplot it has to be required as a module and then intanciarce as a function

```
import mindplot from '@wisemapping/mindplot';
mindplot();
```
