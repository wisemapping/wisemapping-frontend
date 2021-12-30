import PlainTextExporter from '../../../src/components/export/PlainTextExporter';
import Mindmap from '../../../src/components/model/Mindmap';
import XMLSerializerTango from '../../../src/components/persistence/XMLSerializerTango';
import fs from  'fs';
import path from 'path';

test('mindplot generation of simple maps', () => {

  // Load DOM ...
  const mapStream =fs.readFileSync(path.resolve(__dirname, '../samples/welcome.xml'),{encoding: 'utf-8'});
  const parser = new DOMParser();
  const document = parser.parseFromString(mapStream.toString(), 'text/xml')
  
  // Convert to mindmap ...
  const serializer = new XMLSerializerTango();
  const mindmap:Mindmap = serializer.loadFromDom(document,'welcome');

  // Inspect ...
  console.log(mindmap);
 
  const exporter = new PlainTextExporter(mindmap);
  console.log(exporter.export());
});
