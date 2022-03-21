import Mindmap from '../model/Mindmap';
import XMLSerializerFactory from '../persistence/XMLSerializerFactory';
import Importer from './Importer';

export default class WisemappingImporter extends Importer {
  private wisemappingInput: string;

  private mindmap: Mindmap;

  constructor(map: string) {
    super();
    this.wisemappingInput = map;
  }

  import(nameMap: string, description: string): Promise<string> {
    const parser = new DOMParser();
    const wiseDoc = parser.parseFromString(this.wisemappingInput, 'application/xml');

    const serialize = XMLSerializerFactory.createInstanceFromDocument(wiseDoc);
    this.mindmap = serialize.loadFromDom(wiseDoc, nameMap);

    this.mindmap.setDescription(description);

    const mindmapToXml = serialize.toXML(this.mindmap);

    const xmlStr = new XMLSerializer().serializeToString(mindmapToXml);
    return Promise.resolve(xmlStr);
  }
}
