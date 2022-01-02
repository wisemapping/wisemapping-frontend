/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { Mindmap } from "../..";
import Exporter from "./Exporter";
import SVGExporter from "./SVGExporter";
/**
 * Based on https://mybyways.com/blog/convert-svg-to-png-using-your-browser
 */
class BinaryImageExporter implements Exporter {
    svgElement: Element;
    mindmap: Mindmap;
    width: number;
    height: number;
    imgFormat: string;

    constructor(mindmap: Mindmap, svgElement: Element, width: number, height: number, imgFormat: 'image/png' | 'image/jpeg') {
        this.svgElement = svgElement;
        this.mindmap = mindmap;
        this.imgFormat = imgFormat;

        this.width = width;
        this.height = height;
    }
    extension(): string {
        return this.imgFormat.split['/'][0];
    }

    async export(): Promise<string> {
        const svgExporter = new SVGExporter(this.mindmap, this.svgElement);
        const svgUrl = await svgExporter.export();
        
        // Get the device pixel ratio, falling back to 1. But, I will double the resolution to look nicer.
        const dpr = (window.devicePixelRatio || 1) * 2;
        
        // Create canvas ...
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', (this.width * dpr).toString() );
        canvas.setAttribute('height', (this.height * dpr).toString());

        // Render the image and wait for the response ...
        const img = new Image();
        const result = new Promise<string>((resolve, reject) => {

            img.onload = () => {
                const ctx = canvas.getContext('2d');
                // Scale for retina ...
                ctx.scale(dpr, dpr);
                ctx.drawImage(img, 0, 0);

                const imgDataUri = canvas
                    .toDataURL(this.imgFormat)
                    .replace('image/png', 'octet/stream');

                URL.revokeObjectURL(svgUrl);
                resolve(imgDataUri);
            }
        });
        img.src = svgUrl;
        return result;
    }
}
export default BinaryImageExporter;
