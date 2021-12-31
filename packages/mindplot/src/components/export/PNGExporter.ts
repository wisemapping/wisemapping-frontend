
import { Mindmap } from "../..";
import Exporter from "./Exporter";
import SVGExporter from "./SVGExporter";

class PNGExporter implements Exporter {
    svgElement: Element;
    mindmap: Mindmap;
    width: number;
    height: number;

    constructor(mindmap: Mindmap, svgElement: Element, width: number, height: number) {
        this.svgElement = svgElement;
        this.mindmap = mindmap;
        this.width = width;
        this.height = height;
    }

    async export(): Promise<string> {
        const svgExporter = new SVGExporter(this.mindmap, this.svgElement);
        const svgUrl = await svgExporter.export();

        // Create canvas ...
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.width.toString());
        canvas.setAttribute('height', this.height.toString());

        // Render the image and wait for the response ...
        const img = new Image();
        const result = new Promise<string>((resolve, reject) => {

            img.onload = () => {
                canvas.getContext('2d').drawImage(img, 0, 0);
                const imgDataUri = canvas.toDataURL('image/png').replace('image/png', 'octet/stream');
                URL.revokeObjectURL(imgDataUri);
                resolve(imgDataUri);
            }
        });
        img.src = svgUrl;
        return result;
    }
}
export default PNGExporter;
