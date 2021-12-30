
import { Mindmap } from "../..";
import Exporter from "./Exporter";

class SVGExporter implements Exporter {
    svgElement: Element;
    constructor(mindmap: Mindmap, svgElement: Element) {
        this.svgElement = svgElement;
    }

    export(): string {
        // Replace all images for in-line images ...
        const imagesElements:HTMLCollection = this.svgElement.children
        console.log(imagesElements.length);
        Array.from(imagesElements).forEach((image) => {
            console.log(image);

        });
        return "";

    }
}
export default SVGExporter;