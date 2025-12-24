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
// Stub for ThemeStyle exports used by editor components
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import { FontStyleType } from '@wisemapping/mindplot/src/components/FontStyleType';
import { FontWeightType } from '@wisemapping/mindplot/src/components/FontWeightType';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';

export type TopicStyleType = {
  borderColor: string | string[];
  borderStyle: string;
  backgroundColor: string | string[];
  connectionColor: string | string[];
  connectionStyle: LineType;
  fontFamily: string;
  fontSize: number;
  fontStyle: FontStyleType;
  fontWeight: FontWeightType;
  fontColor: string;
  msgKey: string;
  shapeType: TopicShapeType;
  outerBackgroundColor: string;
  outerBorderColor: string;
};

export type CanvasStyleType = {
  backgroundColor: string;
  gridColor: string | undefined;
  opacity: number;
  showGrid: boolean;
};

export class ThemeStyle {
  // Mock implementation
}


