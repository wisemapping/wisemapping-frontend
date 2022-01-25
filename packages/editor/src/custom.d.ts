declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "@wisemapping/mindplot" {
  const mindplot: {
    Mindmap: any,
    PersistenceManager: any,
    Designer: any,
    LocalStorageManager: any,
    Menu: any,
    DesignerBuilder: any,
    RESTPersistenceManager: any,
    DesignerOptionsBuilder: any,
    buildDesigner: any,
    $notify: any
  };
  export var Mindmap: any;
  export var PersistenceManager: any;
  export var Designer: any;
  export var LocalStorageManager: any;
  export var Menu: any;
  export var DesignerBuilder: any;
  export var RESTPersistenceManager: any;
  export var DesignerOptionsBuilder: any;
  export var buildDesigner: any;
  export var $notify: any;
  export default mindplot;
}