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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Exporter from './Exporter';

class PDFExporter extends Exporter {
  private svgElement: Element;

  private adjustToFit: boolean;

  constructor(svgElement: Element, adjustToFit = true) {
    super('pdf', 'application/pdf');
    this.svgElement = svgElement;
    this.adjustToFit = adjustToFit;
  }

  async export(): Promise<string> {
    try {
      // Create a temporary container for the SVG
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '100%';
      tempContainer.style.height = '100%';
      tempContainer.appendChild(this.svgElement.cloneNode(true));
      document.body.appendChild(tempContainer);

      // Convert SVG to canvas using html2canvas
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate scaling to fit the page
      let scale = 1;
      let x = 0;
      let y = 0;

      if (this.adjustToFit) {
        const scaleX = pdfWidth / canvasWidth;
        const scaleY = pdfHeight / canvasHeight;
        scale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave some margin

        // Calculate centered position
        x = (pdfWidth - canvasWidth * scale) / 2;
        y = (pdfHeight - canvasHeight * scale) / 2;
      } else {
        // Use original size, but ensure it fits on the page
        const maxScale = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
        scale = Math.min(1, maxScale);
        x = (pdfWidth - canvasWidth * scale) / 2;
        y = (pdfHeight - canvasHeight * scale) / 2;
      }

      // Add the image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, canvasWidth * scale, canvasHeight * scale);

      // Return the PDF as base64 string
      return pdf.output('datauristring');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  async exportAndEncode(): Promise<string> {
    return this.export();
  }
}

export default PDFExporter;
