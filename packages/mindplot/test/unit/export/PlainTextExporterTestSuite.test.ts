import PlainTextExporter from '../../../src/components/export/PlainTextExporter';
import Mindmap from '../../../src/components/model/Mindmap';
import fs from  'fs';
import path from 'path';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';

test('mindplot generation of simple maps', () => {
  const parser = new DOMParser();
  
  // Load DOM ...
  const mapStream =fs.readFileSync(path.resolve(__dirname, './samples/welcome.xml'),{encoding: 'utf-8'});
  const document = parser.parseFromString(mapStream.toString(), 'text/xml')
  
  // Convert to mindmap ...
  const serializer = XMLSerializerFactory.getSerializerFromDocument(document);
  const mindmap:Mindmap = serializer.loadFromDom(document,'welcome');

  const exporter = new PlainTextExporter(mindmap);
  console.log(exporter.export());
});
