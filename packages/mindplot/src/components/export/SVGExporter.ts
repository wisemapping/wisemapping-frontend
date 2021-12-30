
import { Mindmap } from "../..";
import ImageIcon from "../ImageIcon";
import Exporter from "./Exporter";

class SVGExporter implements Exporter {
    svgElement: Element;
    constructor(mindmap: Mindmap, svgElement: Element) {
        this.svgElement = svgElement;
    }

    export(): string {
        // Replace all images for in-line images ...
        const imagesElements: HTMLCollection = this.svgElement.getElementsByTagName('image');
        console.log(imagesElements.length);

        const image = ImageIcon.getImageUrl('face_smile');
        Array.from(imagesElements).forEach((image) => {
            const imgValue = image.attributes['xlink:href'].value;
            console.log(image.attributes);
        });
        return "";

    }
}
export default SVGExporter;