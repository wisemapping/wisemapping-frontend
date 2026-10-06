/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import Exporter from './Exporter';
import SVGExporter from './SVGExporter';
/**
 * Based on https://mybyways.com/blog/convert-svg-to-png-using-your-browser
 */
class BinaryImageExporter extends Exporter {
  // Largest canvas area (in pixels) that all supported browsers can render ...
  private static MAX_CANVAS_AREA = 16e6;

  private svgElement: Element;

  private width: number;

  private height: number;

  private adjustToFit: boolean;

  private backgroundColor: string;

  constructor(
    svgElement: Element,
    width: number,
    height: number,
    imgFormat: 'image/png' | 'image/jpeg',
    adjustToFit = true,
    backgroundColor = 'white',
  ) {
    super(imgFormat.split('/')[0], imgFormat);
    this.svgElement = svgElement;
    this.adjustToFit = adjustToFit;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
  }

  export(): Promise<string> {
    throw new Error('Images can not be exported');
  }

  override exportAndEncode(): Promise<string> {
    const svgExporter = new SVGExporter(this.svgElement, this.adjustToFit, this.backgroundColor);
    const svgUrl = svgExporter.exportAndEncode();
    return svgUrl.then((value: string) => {
      // Get the device pixel ratio, falling back to 1. But, I will double the resolution to look nicer.
      let dpr = (window.devicePixelRatio || 1) * 2;

      // Create canvas size ...
      const canvas = document.createElement('canvas');
      let width: number;
      let height: number;
      if (this.adjustToFit) {
        // Size must match with SVG image size ...
        const size = svgExporter.getImgSize();
        width = size.width * dpr;
        height = size.height * dpr;
      } else {
        // Use screensize as size ..
        width = this.width * dpr;
        height = this.height * dpr;
      }

      // Browsers render bigger canvases as a blank image (Safari's limit is about 16.7 MP),
      // so reduce the resolution keeping the aspect ratio ...
      const area = width * height;
      if (area > BinaryImageExporter.MAX_CANVAS_AREA) {
        const reduction = Math.sqrt(BinaryImageExporter.MAX_CANVAS_AREA / area);
        width *= reduction;
        height *= reduction;
        dpr *= reduction;
      }

      console.log(`Export size: ${width}:${height}`);
      canvas.setAttribute('width', Math.floor(width).toFixed(0));
      canvas.setAttribute('height', Math.floor(height).toFixed(0));

      // Render the image and wait for the response ...
      const img = new Image();
      const result = new Promise<string>((resolve, reject) => {
        img.onload = () => {
          try {
            const ctx = canvas.getContext('2d')!;
            // Fill background first so JPEG/PNG have a solid fill ...
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Scale for retina ...
            ctx.scale(dpr, dpr);
            ctx.drawImage(img, 0, 0);

            const imgDataUri = canvas
              .toDataURL(this.getContentType())
              .replace('image/png', 'octet/stream');
            resolve(imgDataUri);
          } catch (error) {
            reject(error);
          } finally {
            URL.revokeObjectURL(value);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(value);
          reject(new Error('The map image could not be rendered for export.'));
        };
      });
      img.src = value;
      return result;
    });
  }
}
export default BinaryImageExporter;
