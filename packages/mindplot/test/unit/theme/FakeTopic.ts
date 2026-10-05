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
import { LineType } from '../../../src/components/ConnectionLine';
import Topic from '../../../src/components/Topic';

export type FakeModelProps = {
  borderColor?: string;
  backgroundColor?: string;
  shapeType?: string;
  connectionStyle?: LineType;
  connectionColor?: string;
  fontFamily?: string;
  fontColor?: string;
  fontWeight?: string;
  fontSize?: number;
  fontStyle?: string;
  // The background colour of the map canvas, when the map sets one.
  canvasColor?: string;
};

/**
 * Minimal Topic stand-in for exercising the theme resolution logic, which only
 * reads the model, the parent chain, the topic order and whether it is central.
 */
const fakeTopic = (
  props: FakeModelProps,
  parent?: Topic,
  options: { central?: boolean; order?: number } = {},
): Topic => {
  const model = {
    getBorderColor: () => props.borderColor,
    getBackgroundColor: () => props.backgroundColor,
    getShapeType: () => props.shapeType,
    getConnectionStyle: () => props.connectionStyle,
    getConnectionColor: () => props.connectionColor,
    getFontFamily: () => props.fontFamily,
    getFontColor: () => props.fontColor,
    getFontWeight: () => props.fontWeight,
    getFontSize: () => props.fontSize,
    getFontStyle: () => props.fontStyle,
    getMindmap: () => ({
      getCanvasStyle: () =>
        props.canvasColor ? { backgroundColor: props.canvasColor } : undefined,
    }),
  };
  return {
    getModel: () => model,
    getParent: () => parent,
    getOutgoingConnectedTopic: () => parent,
    isCentralTopic: () => Boolean(options.central),
    getOrder: () => options.order,
  } as unknown as Topic;
};

export default fakeTopic;
