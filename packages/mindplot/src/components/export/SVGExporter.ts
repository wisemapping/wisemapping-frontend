
import { Mindmap } from "../..";
import Exporter from "./Exporter";

class SVGExporter implements Exporter {
    svgElement: Element;
    constructor(mindmap: Mindmap, svgElement: Element) {
        this.svgElement = svgElement;
    }

    export(): string {
        // Replace all images for in-line images ...
        const imagesElements: HTMLCollection = this.svgElement.getElementsByTagName('image');
        let result:string = new XMLSerializer().serializeToString(this.svgElement);

        // Are namespace declared ?. Otherwise, force the declaration ...
        if(result.indexOf('xmlns:xlink=')!=-1){
            result.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ')
        }
        return result;

    }
}
export default SVGExporter;