import FreemindImporter from './FreemindImporter';
import FreemindMap from '../export/freemind/Map';
import Importer from './Importer';

type textType = 'mm';
type mapType = FreemindMap

export default class TextImporterFactory {
  static create(type: textType, map: mapType): Importer {
    let result: Importer;
    switch (type) {
      case 'mm':
        result = new FreemindImporter(map);
        return result;
      default:
        throw new Error(`Unsupported type ${type}`);
    }
  }
}
