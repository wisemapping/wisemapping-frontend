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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Exporter from './Exporter';

class PDFExporter extends Exporter {
  private static RENDER_SCALE = 2;

  // CSS pixels are 1/96 inch ...
  private static MM_PER_PX = 25.4 / 96;

  private svgElement: Element;

  private adjustToFit: boolean;

  private backgroundColor: string;

  constructor(svgElement: Element, adjustToFit = true, backgroundColor = 'white') {
    super('pdf', 'application/pdf');
    this.svgElement = svgElement;
    this.adjustToFit = adjustToFit;
    this.backgroundColor = backgroundColor;
  }

  async export(): Promise<string> {
    // Create a temporary container for the SVG
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '100%';
    tempContainer.style.height = '100%';
    tempContainer.appendChild(this.svgElement.cloneNode(true));
    document.body.appendChild(tempContainer);

    try {
      // Convert SVG to canvas using html2canvas. The canvas is read back with toDataURL,
      // so it must not be tainted: cross-origin images without CORS are skipped instead.
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: this.backgroundColor,
        scale: PDFExporter.RENDER_SCALE, // Higher resolution
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      // Create PDF
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions. The page is in mm, the canvas in pixels at RENDER_SCALE.
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = (canvas.width / PDFExporter.RENDER_SCALE) * PDFExporter.MM_PER_PX;
      const imgHeight = (canvas.height / PDFExporter.RENDER_SCALE) * PDFExporter.MM_PER_PX;

      // Calculate scaling to fit the page
      const maxScale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scale = this.adjustToFit
        ? maxScale * 0.95 // 95% to leave some margin
        : Math.min(1, maxScale); // Use original size, but ensure it fits on the page

      // Calculate centered position
      const x = (pdfWidth - imgWidth * scale) / 2;
      const y = (pdfHeight - imgHeight * scale) / 2;

      // Add the image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, imgWidth * scale, imgHeight * scale);

      // Return the PDF as base64 string
      return pdf.output('datauristring');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF', { cause: error });
    } finally {
      // Clean up temporary container
      tempContainer.remove();
    }
  }

  async exportAndEncode(): Promise<string> {
    return this.export();
  }
}

export default PDFExporter;
