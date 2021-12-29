import Exporter from "./Exporter";
import Mindmap from "../model/Mindmap";


class TextExporter implements Exporter {
    export(mindplot: Mindmap): string {
        return "some value";
    }
}
export default TextExporter;