import Mindmap from '../../../src/components/model/Mindmap';
import fs from 'fs';
import path from 'path';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';
import SVGExporter from '../../../src/components/export/SVGExporter';
import BinaryImageExporter from '../../../src/components/export/BinaryImageExporter';

test('mindplot generation of simple maps', async () => {
  // Load mindmap DOM ...
  const mindmapPath = path.resolve(__dirname, './samples/welcome.xml');
  const mapDocument = parseXMLFile(mindmapPath, 'text/xml');

  // Convert to mindmap ...
  const serializer = XMLSerializerFactory.getSerializerFromDocument(mapDocument);
  const mindmap: Mindmap = serializer.loadFromDom(mapDocument, 'welcome');

  // Load SVG ...
  const svgPath = path.resolve(__dirname, './samples/welcome.svg');
  const svgDocument = parseXMLFile(svgPath, 'image/svg+xml');

  // Inspect ...
  const svgExporter = new SVGExporter(mindmap, svgDocument.documentElement);
  console.log('Exported map:' + await svgExporter.export());

  const pngExporter = new BinaryImageExporter(mindmap, svgDocument.documentElement, 400, 400, 'image/png');
  console.log('Exported map:' + await pngExporter.export());

});

function parseXMLFile(filePath: fs.PathOrFileDescriptor, mimeType: DOMParserSupportedType) {
  const parser = new DOMParser();
  const stream = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const xmlDoc = parser.parseFromString(stream.toString(), mimeType);

  // Is there any parsing error ?.
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    console.log(new XMLSerializer().serializeToString(xmlDoc));
    throw new Error(`Unexpected error parsing: ${filePath}. Error: ${new XMLSerializer().serializeToString(xmlDoc)}`);
  }

  return xmlDoc;
}
