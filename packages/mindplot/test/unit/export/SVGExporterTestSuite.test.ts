import Mindmap from '../../../src/components/model/Mindmap';
import fs from 'fs';
import path from 'path';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import SVGExporter from '../../../src/components/export/SVGExporter';

test('mindplot generation of simple maps', () => {
  const parser = new DOMParser();

  // Load DOM ...
  const mapStream = fs.readFileSync(path.resolve(__dirname, './samples/welcome.xml'), { encoding: 'utf-8' });
  const mapDocument = parser.parseFromString(mapStream.toString(), 'text/xml')

  // Convert to mindmap ...
  const serializer = XMLSerializerFactory.getSerializerFromDocument(mapDocument);
  const mindmap: Mindmap = serializer.loadFromDom(mapDocument, 'welcome');

  // Load SVG ...
  const svgStream = fs.readFileSync(path.resolve(__dirname, './samples/welcome.svg'), { encoding: 'utf-8' });
  const svgDocument = parser.parseFromString(svgStream.toString(), 'application/xml')
  console.log(svgDocument);

  // Inspect ...
  const exporter = new SVGExporter(mindmap, svgDocument.documentElement);
  console.log(exporter.export());
});
