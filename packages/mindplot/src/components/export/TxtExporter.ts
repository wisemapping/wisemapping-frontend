import Exporter from "src/components/export/Exporter";
import Mindmap from "src/components/model/Mindmap";


class TextExporter implements Exporter {
    export(mindplot: Mindmap): string {
        return "some value";
    }
}
export default TextExporter;