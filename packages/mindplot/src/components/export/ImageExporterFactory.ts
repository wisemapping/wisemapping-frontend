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
import BinaryImageExporter from "./BinaryImageExporter";
import Exporter from "./Exporter";
import SVGExporter from "./SVGExporter";

type type = 'svg' | 'png' | 'jpg';
class ImageExpoterFactory {
    static create(type: type, mindmap: Mindmap, svgElement: Element, width: number, height: number, isCenter: boolean = false): Exporter {
        let result;
        switch (type) {
            case 'svg': {
                result = new SVGExporter(mindmap, svgElement);
                break;
            }
            case 'png': {
                result = new BinaryImageExporter(mindmap, svgElement, width, height, 'image/png');
                break;
            }
            case 'jpg': {
                result = new BinaryImageExporter(mindmap, svgElement, width, height, 'image/jpeg');
                break;
            }
            default:
                throw new Error(`Unsupported encoding ${type}`);
        }
        return result;
    }
}
export default ImageExpoterFactory
