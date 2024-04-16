# Editor

React Component for the wisemapping editor.

## Usage

This is a work in progress and for now mindplot needs to be instantiated using the initCallback prop. Check `test/playground/map-render` for some usage examples.

```ts
import Editor from `@wisemapping/editor`;

ReactDOM.render(
    <Editor
        mapId={1}
        readOnlyMode={false}
        locale="en"
        onAction={(action) => console.log('action called:', action)}
        initCallback={initialization}
    />,
    document.getElementById('root'),
);
```

## i18n

Messages are translated in the `lang` folder, and then compiled to `src/compiled-lang` using the following command:

```sh
yarn compile lang/de.json --ast --out-file src/compiled-lang/de.json
```
