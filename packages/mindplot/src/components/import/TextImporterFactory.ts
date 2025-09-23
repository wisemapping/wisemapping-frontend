import WisemappingImporter from './WisemappingImporter';
import FreemindImporter from './FreemindImporter';
import FreeplaneImporter from './FreeplaneImporter';
import XMindImporter from './XMindImporter';
import MindManagerImporter from './MindManagerImporter';
import OPMLImporter from './OPMLImporter';
import Importer from './Importer';

export default class TextImporterFactory {
  static create(type: string | undefined, map: string): Importer {
    let result: Importer;
    switch (type) {
      case 'wxml':
        result = new WisemappingImporter(map);
        return result;
      case 'mm':
        // Check if it's Freeplane or FreeMind
        if (map.includes('freeplane') || map.includes('version="freeplane')) {
          result = new FreeplaneImporter(map);
        } else {
          result = new FreemindImporter(map);
        }
        return result;
      case 'mmx':
        result = new FreeplaneImporter(map);
        return result;
      case 'xmind':
        result = new XMindImporter(map);
        return result;
      case 'mmap':
        result = new MindManagerImporter(map);
        return result;
      case 'opml':
        result = new OPMLImporter(map);
        return result;
      default:
        throw new Error(`Unsupported type ${type}`);
    }
  }
}
