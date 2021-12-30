import Exporter from "./Exporter";
import Mindmap from "../model/Mindmap";

class FreemindExporter implements Exporter {
    mindplot: Mindmap;
    constructor(mindplot: Mindmap) {
        this.mindplot = mindplot;
    }

    export(): string {
        return "TBI";
    }
}
export default FreemindExporter;