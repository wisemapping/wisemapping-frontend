
import { Mindmap } from "../..";
import Exporter from "./Exporter";

class SVGExporter implements Exporter {
    svgElement: Element;
    constructor(mindmap: Mindmap, svgElement: Element) {
        this.svgElement = svgElement;
    }

    export(): Promise<string> {
        // Replace all images for in-line images ...
        const imagesElements: HTMLCollection = this.svgElement.getElementsByTagName('image');
        let svgTxt:string = new XMLSerializer().serializeToString(this.svgElement);

        // Are namespace declared ?. Otherwise, force the declaration ...
        if(svgTxt.indexOf('xmlns:xlink=')!==-1){
            svgTxt.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ')
        }

        const blob = new Blob([svgTxt], { type: 'image/svg+xml' });
        const result = URL.createObjectURL(blob);
        return Promise.resolve(result);

    }
}
export default SVGExporter;