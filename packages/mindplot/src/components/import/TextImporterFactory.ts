import WisemappingImporter from './WisemappingImporter';
import FreemindImporter from './FreemindImporter';
import Importer from './Importer';

export default class TextImporterFactory {
  static create(type: string | undefined, map: string): Importer {
    let result: Importer;
    switch (type) {
      case 'wxml':
        result = new WisemappingImporter(map);
        return result;
      case 'mm':
        result = new FreemindImporter(map);
        return result;
      default:
        throw new Error(`Unsupported type ${type}`);
    }
  }
}
