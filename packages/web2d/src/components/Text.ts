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

import WorkspaceElement from './WorkspaceElement';
import { FontWeightType } from './FontWeightType';
import TextPeer from './peer/svg/TextPeer';
import TransformUtil from './peer/utils/TransformUtils';
import StyleAttributes from './StyleAttributes';
import PositionType from './PositionType';
import SizeType from './SizeType';
import FontPeer, { FontStyle } from './peer/svg/FontPeer';

class Text extends WorkspaceElement<TextPeer> {
  constructor(attributes?: StyleAttributes) {
    super(new TextPeer(new FontPeer('Arial')), attributes ?? {});
  }

  getType(): string {
    return 'Text';
  }

  setText(text: string): void {
    this.peer.setText(text);
  }

  getText(): string {
    return this.peer.getText();
  }

  setFont(font: string, size: number, style: string, weight: string): void {
    this.peer.setFont(font, size, style, weight);
  }

  setFontName(fontName: string): void {
    this.peer.setFontName(fontName);
  }

  setColor(color: string): void {
    this.peer.setColor(color);
  }

  getColor(): string | null {
    return this.peer.getColor();
  }

  setStyle(style: string): void {
    this.peer.setStyle(style);
  }

  setWeight(weight: FontWeightType): void {
    this.peer.setWeight(weight);
  }

  setFontSize(size: number): void {
    this.peer.setFontSize(size);
  }

  getFontStyle(): FontStyle {
    return this.peer.getFontStyle();
  }

  getHtmlFontSize(): string {
    const scale = TransformUtil.workoutScale(this.peer);
    return this.peer.getHtmlFontSize(scale);
  }

  /**
   * The text bounding box size, measured once: a redraw that needs both the width and the height
   * should call this rather than getShapeWidth and getShapeHeight. The result is a copy.
   */
  measure(): SizeType {
    return this.peer.measure();
  }

  getShapeWidth(): number {
    return this.peer.getShapeWidth();
  }

  getShapeHeight(): number {
    return this.peer.getShapeHeight();
  }

  /** The height of one line. An empty text has no lines and measures 0, not NaN. */
  getFontHeight(): number {
    return this.measure().height / Math.max(1, this.peer.getTextLines().length);
  }

  getPosition(): PositionType {
    return this.peer.getPosition();
  }

  setPosition(x: number, y: number) {
    this.peer.setPosition(x, y);
  }

  getNativePosition() {
    return this.peer.getNativePosition();
  }
}

export default Text;
