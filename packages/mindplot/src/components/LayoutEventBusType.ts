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

import type NodeModel from './model/NodeModel';
import type PositionType from './PositionType';
import type SizeType from './SizeType';

/** The events of the layout bus and their payloads. Topics send their model, not themselves. */
export type LayoutEvents = {
  topicResize: { node: NodeModel; size: SizeType };
  topicMoved: { node: NodeModel; position: PositionType };
  forceLayout: void;
  childShrinked: NodeModel;
  topicConnected: { parentNode: NodeModel; childNode: NodeModel };
  topicAdded: NodeModel;
  topicRemoved: NodeModel;
  topicDisconect: NodeModel;
  topicSelected: NodeModel;
  topicUnselected: NodeModel;
  canvasPanned: void;
  canvasZoomed: { zoom: number };
};

export type LayoutEventBusType = keyof LayoutEvents;

export default LayoutEventBusType;
