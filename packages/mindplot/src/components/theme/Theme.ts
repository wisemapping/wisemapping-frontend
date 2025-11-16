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

import { LineType } from '../ConnectionLine';
import { FontStyleType } from '../FontStyleType';
import { FontWeightType } from '../FontWeightType';
import { TopicShapeType } from '../model/INodeModel';
import Topic from '../Topic';

export type TopicType = 'CentralTopic' | 'MainTopic' | 'SubTopic' | 'IsolatedTopic';
export type ThemeVariant = 'light' | 'dark';

interface Theme {
  getText(topic: Topic): string;

  getFontFamily(topic: Topic): string;

  getFontSize(topic: Topic): number;

  getFontStyle(topic: Topic): FontStyleType;

  getFontWeight(topic: Topic): FontWeightType;

  getInnerPadding(topic: Topic): number;

  getShapeType(topic: Topic): TopicShapeType;

  getConnectionType(topic: Topic): LineType;

  getEmojiSpacing(topic: Topic): number;

  // Individual canvas style properties for Designer integration
  getCanvasBackgroundColor(): string;
  getCanvasGridColor(): string | undefined;
  getCanvasOpacity(): number;
  getCanvasShowGrid(): boolean;
  getCanvasGridPattern(): 'solid' | 'grid' | 'dots';

  getFontColor(topic: Topic): string;

  getBackgroundColor(topic: Topic): string;

  getBorderColor(topic: Topic): string;

  getOuterBackgroundColor(topic: Topic, onFocus: boolean): string;

  getOuterBorderColor(topic: Topic): string;

  getConnectionColor(topic: Topic): string;
}
export default Theme;
