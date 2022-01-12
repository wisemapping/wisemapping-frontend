
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

class SVGExporter implements Exporter {
    private svgElement: Element;
    private prolog: string = '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n';

    constructor(mindmap: Mindmap, svgElement: Element, centerImgage: boolean = false) {
        this.svgElement = svgElement;
    }
    extension(): string {
        return 'svg';
    }

    export(): Promise<string> {
        // Replace all images for in-line images ...
        let svgTxt: string = new XMLSerializer()
            .serializeToString(this.svgElement);
        svgTxt = this.prolog + svgTxt;

        // Are namespace declared ?. Otherwise, force the declaration ...
        if (svgTxt.indexOf('xmlns:xlink=') === -1) {
            svgTxt = svgTxt.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ')
        }

        // Add white background. This is mainly for PNG export ...
        const svgDoc = SVGExporter.parseXMLString(svgTxt, 'application/xml');
        const svgElement = svgDoc.getElementsByTagName('svg')[0];
        svgElement.setAttribute('style', 'background-color:white');

        const svgResult = new XMLSerializer()
            .serializeToString(svgDoc);
        const blob = new Blob([svgResult], { type: 'image/svg+xml' });
        const result = URL.createObjectURL(blob);
        return Promise.resolve(result);
    }

    private static parseXMLString = (xmlStr: string, mimeType: DOMParserSupportedType) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlStr, mimeType);

        // Is there any parsing error ?.
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            const xmmStr = new XMLSerializer().serializeToString(xmlDoc);
            console.log(xmmStr);
            throw new Error(`Unexpected error parsing: ${xmlStr}. Error: ${xmmStr}`);
        }

        return xmlDoc;
    }
}
export default SVGExporter;