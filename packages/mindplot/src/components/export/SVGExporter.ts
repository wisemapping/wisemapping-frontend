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
import SizeType from '../SizeType';
import Exporter from './Exporter';

class SVGExporter extends Exporter {
  private svgElement: Element;

  private static prolog = '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n';

  private static regexpTranslate = /translate\((-?[0-9]+.[0-9]+),(-?[0-9]+.[0-9]+)\)/;

  private static padding = 100;

  private adjustToFit: boolean;

  constructor(svgElement: Element, adjustToFit = true) {
    super('svg', 'image/svg+xml');
    this.svgElement = svgElement;
    this.adjustToFit = adjustToFit;
  }

  export(): Promise<string> {
    // Replace all images for in-line images ...
    let svgTxt: string = new XMLSerializer()
      .serializeToString(this.svgElement);
    svgTxt = SVGExporter.prolog + svgTxt;

    // Are namespace declared ?. Otherwise, force the declaration ...
    if (svgTxt.indexOf('xmlns:xlink=') === -1) {
      svgTxt = svgTxt.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
    }

    // Add white background. This is mainly for PNG export ...
    let svgDoc = SVGExporter.parseXMLString(svgTxt, 'application/xml');
    const svgElement = svgDoc.getElementsByTagName('svg')[0];
    svgElement.setAttribute('style', 'background-color:white');
    svgElement.setAttribute('focusable', 'false');

    // Does need to be adjust ?.
    if (this.adjustToFit) {
      svgDoc = this.normalizeToFit(svgDoc);
    }

    const result = new XMLSerializer()
      .serializeToString(svgDoc);

    return Promise.resolve(result);
  }

  private normalizeToFit(document: Document): Document {
    // Collect all group elements ...
    const rectElems = Array.from(document.querySelectorAll('g>rect'));

    const translates: SizeType[] = rectElems
      .map((rect: Element) => {
        const g = rect.parentElement;
        const transformStr = g.getAttribute('transform');

        // Looking to parse translate(220.00000,279.00000) scale(1.00000,1.00000)
        const match = transformStr.match(SVGExporter.regexpTranslate);
        let result: SizeType = { width: 0, height: 0 };
        if (match !== null) {
          result = { width: Number.parseFloat(match[1]), height: Number.parseFloat(match[2]) };

          // Add rect size ...
          if (result.width > 0) {
            const rectWidth = Number.parseFloat(rect.getAttribute('width'));
            result.width += rectWidth;
          }

          if (result.height > 0) {
            const rectHeight = Number.parseFloat(rect.getAttribute('height'));
            result.height += rectHeight;
          }
        }
        return result;
      });

    // Find max and mins ...
    const widths = translates.map((t) => t.width).sort((a, b) => a - b);
    const heights = translates.map((t) => t.height).sort((a, b) => a - b);

    const svgElem = document.firstChild as Element;
    const minX = widths[0] - SVGExporter.padding;
    const minY = heights[0] - SVGExporter.padding;

    const maxX = widths[widths.length - 1] + SVGExporter.padding;
    const maxY = heights[heights.length - 1] + SVGExporter.padding;

    svgElem.setAttribute('viewBox', `${minX} ${minY} ${maxX + Math.abs(minX)}  ${maxY + Math.abs(minY)}`);
    svgElem.setAttribute('preserveAspectRatio', 'xMidYMid');

    return document;
  }

  private static parseXMLString = (xmlStr: string, mimeType: DOMParserSupportedType) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, mimeType);

    // Is there any parsing error ?.
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      const xmmStr = new XMLSerializer().serializeToString(xmlDoc);
      console.log(xmmStr);
      throw new Error(`Unexpected error parsing: ${xmlStr}.Error: ${xmmStr}`);
    }

    return xmlDoc;
  };
}
export default SVGExporter;
