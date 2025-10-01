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
  private svgElement: Element;

  private width: number;

  private height: number;

  private adjustToFit: boolean;

  constructor(
    svgElement: Element,
    width: number,
    height: number,
    imgFormat: 'image/png' | 'image/jpeg',
    adjustToFit = true,
  ) {
    super(imgFormat.split('/')[0], imgFormat);
    this.svgElement = svgElement;
    this.adjustToFit = adjustToFit;
    this.width = width;
    this.height = height;
  }

  export(): Promise<string> {
    throw new Error('Images can not be exported');
  }

  exportAndEncode(): Promise<string> {
    const svgExporter = new SVGExporter(this.svgElement, this.adjustToFit);
    const svgUrl = svgExporter.exportAndEncode();
    return svgUrl.then((value: string) => {
      // Get the device pixel ratio, falling back to 1. But, I will double the resolution to look nicer.
      const dpr = (window.devicePixelRatio || 1) * 2;

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

      console.log(`Export size: ${width}:${height}`);
      canvas.setAttribute('width', width.toFixed(0));
      canvas.setAttribute('height', height.toFixed(0));

      // Render the image and wait for the response ...
      const img = new Image();
      const result = new Promise<string>((resolve) => {
        img.onload = () => {
          const ctx = canvas.getContext('2d')!;
          // Scale for retina ...
          ctx.scale(dpr, dpr);
          ctx.drawImage(img, 0, 0);

          const imgDataUri = canvas
            .toDataURL(this.getContentType())
            .replace('image/png', 'octet/stream');

          URL.revokeObjectURL(value);
          resolve(imgDataUri);
        };
      });
      img.src = value;
      return result;
    });
  }
}
export default BinaryImageExporter;
