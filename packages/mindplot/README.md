# WiseMapping Mindplot

WiseMapping Mindplot module is the core mind map rendering of WiseMapping. This lightweight library allows either editing or visualization of saved mindmaps.

## Usage

A WebComponent implementation for mindplot designer is available.
Importing `@wisemapping/mindplot` registers it as `mindplot-component` in the customElements API (see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define).
Put a `<mindplot-component id="mindmap-comp">` tag in your DOM, call its `buildDesigner(persistence, widgetBuilder)` method to create a Designer on it, then load a map with `loadMap(id)`.

`buildDesigner` takes:

- `persistence`: a `PersistenceManager` (`LocalStorageManager`, `RESTPersistenceManager`, `MockPersistenceManager` or your own). It may be `undefined`: a `LocalStorageManager` is then created that loads `map.xml` (relative to the page) for any map id and keeps the changes in the browser local storage.
- `widgetBuilder`: required. `WidgetBuilder` is abstract (there is no default): extend it to build the link and note editors.

The `mode` attribute is an `EditorRenderMode` and defaults to `viewonly-private`.

#### Code example

The package is published as an ES module whose dependencies (React, lodash, `@wisemapping/web2d`, ...) are not bundled, so load it through your bundler:

```html
<!doctype html>
<html>
  <body>
    <mindplot-component id="mindmap-comp" mode="viewonly-private"></mindplot-component>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js
// main.js
import { LocalStorageManager, WidgetBuilder } from '@wisemapping/mindplot';

// Builds the link and note editors: return your own components.
class MyWidgetBuilder extends WidgetBuilder {
  buildEditorForLink(topic) {
    return null;
  }

  buidEditorForNote(topic) {
    return null;
  }
}

// Loads /maps/<id>.wxml ({id} is replaced by the map id); pass undefined to load map.xml instead.
const persistence = new LocalStorageManager('/maps/{id}.wxml', false, undefined, false);

const webComponent = document.getElementById('mindmap-comp');
webComponent.buildDesigner(persistence, new MyWidgetBuilder());
webComponent.loadMap('1');
```

## Usage with React framework

To use the web component in your JSX code, first you need to register it in React's JSX.IntrinsicElements interface using provided MindplotWebComponentInterface

#### TypeScript example

```tsx
import { useEffect, useRef } from 'react';
import {
  LocalStorageManager,
  MindplotWebComponent,
  MindplotWebComponentInterface,
  WidgetBuilder,
} from '@wisemapping/mindplot';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ['mindplot-component']: MindplotWebComponentInterface;
    }
  }
}

// Your WidgetBuilder subclass, which builds the link and note editors.
declare const widgetBuilder: WidgetBuilder;

const App = () => {
  const mindplotComponent = useRef<MindplotWebComponent>(null);

  useEffect(() => {
    const component = mindplotComponent.current!;
    // Loads the map from /maps/<id>.wxml; {id} is replaced by the map id.
    const persistence = new LocalStorageManager('/maps/{id}.wxml', false, undefined, false);
    component.buildDesigner(persistence, widgetBuilder);
    component.loadMap('map_id');
  }, []);

  // mode is an EditorRenderMode: 'edition-owner', 'edition-editor', 'edition-viewer',
  // 'viewonly-public', 'viewonly-private' (the default), 'showcase' or 'desktop'.
  return (
    <div>
      <mindplot-component ref={mindplotComponent} id="mindmap-comp" mode="edition-owner" />
    </div>
  );
};
```

Check out the editor package examples located in `packages/editor/test/playground/map-render/js` for some hints on high level usage. You can browse them by running `yarn playground --scope @wisemapping/editor`.
