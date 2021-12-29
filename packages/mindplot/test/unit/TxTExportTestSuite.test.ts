import TxtExporter from '../../src/components/export/TxtExporter';
import Mindmap from '../../src/components/model/Mindmap';

test('adds 1 + 2 to equal 3', () => {
  const m = new Mindmap("some map");
 
  const exporter = new TxtExporter();
  console.log(exporter.export(m));
});
