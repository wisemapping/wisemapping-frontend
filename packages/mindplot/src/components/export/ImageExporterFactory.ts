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
import BinaryImageExporter from './BinaryImageExporter';
import Exporter from './Exporter';
import SVGExporter from './SVGExporter';
import PDFExporter from './PDFExporter';

type imageType = 'svg' | 'png' | 'jpg' | 'pdf';
class ImageExpoterFactory {
  static create(
    type: imageType,
    svgElement: Element,
    width: number,
    height: number,
    adjustToFit = true,
  ): Exporter {
    let result: Exporter;
    switch (type) {
      case 'svg': {
        result = new SVGExporter(svgElement, adjustToFit);
        break;
      }
      case 'png': {
        result = new BinaryImageExporter(svgElement, width, height, 'image/png', adjustToFit);
        break;
      }
      case 'jpg': {
        result = new BinaryImageExporter(svgElement, width, height, 'image/jpeg', adjustToFit);
        break;
      }
      case 'pdf': {
        result = new PDFExporter(svgElement, adjustToFit);
        break;
      }
      default:
        throw new Error(`Unsupported encoding ${type}`);
    }
    return result;
  }
}
export default ImageExpoterFactory;
