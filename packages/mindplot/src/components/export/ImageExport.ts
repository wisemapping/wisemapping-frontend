
import Exporter from "./Exporter";

class TextExporter implements Exporter {
    svgElement: Element;
    constructor(svgElement: Element) {
        this.svgElement = svgElement;
    }

    export(): string {
        return "TBI";

    }
}
export default TextExporter;