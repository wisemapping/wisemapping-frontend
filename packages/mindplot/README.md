# WiseMapping Mindplot

WiseMapping Mindplot module is the core mind map rendering of WiseMapping. This lightweight library allows either editing or visualization of saved mindmaps.

## Usage

A WebComponent implementation for mindplot designer is available.
This component is registered as mindplot-component in customElements API. (see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)
To use it you need to import mindplot.js and put in your DOM a <mindplot-component id="mindplot-comp"/> tag. In order to create a Designer on it you need to call its buildDesigner method. Maps can be loaded through loadMap method.

#### Code example

```html
<!doctype html>
<html>
  <head>
    <script src="mindplot.js"></script>
  </head>
  <body>
    <mindplot-component id="mindmap-comp" mode="viewonly-private"></mindplot-component>
    <script>
      var webComponent = document.getElementById('mindmap-comp');
      webComponent.buildDesigner(persistence, widget);
      webComponent.loadMap('1');
    </script>
  </body>
</html>
```

Optionally you can use your own persistence manager and widget manager.
If you don't have special requirements you can use the defaults.

```ts
var persistence = new LocalStorageManager('map.xml', false, undefined, false);
var widget = new MyAwesomeWidgetManager();
// then build the designer with these params
webComponent.buildDesigner(persistence, widget);
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

Check out the examples located in `test/playground/map-render/js` for some hints on high level usage. You can browse them by running `yarn playground`.
