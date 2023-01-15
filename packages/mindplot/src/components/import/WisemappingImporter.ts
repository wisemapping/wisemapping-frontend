import XMLSerializerFactory from '../persistence/XMLSerializerFactory';
import Importer from './Importer';

export default class WisemappingImporter extends Importer {
  private wisemappingInput: string;

  constructor(map: string) {
    super();
    this.wisemappingInput = map;
  }

  import(nameMap: string, description: string): Promise<string> {
    const parser = new DOMParser();
    const wiseDoc = parser.parseFromString(this.wisemappingInput, 'application/xml');

    const serialize = XMLSerializerFactory.createFromDocument(wiseDoc);
    const mindmap = serialize.loadFromDom(wiseDoc, nameMap);

    mindmap.setDescription(description);

    const mindmapToXml = serialize.toXML(mindmap);

    const xmlStr = new XMLSerializer().serializeToString(mindmapToXml);
    return Promise.resolve(xmlStr);
  }
}
