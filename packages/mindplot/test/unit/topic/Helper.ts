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
import type Canvas from '../../../src/components/Canvas';
import CentralTopic from '../../../src/components/CentralTopic';
import MainTopic from '../../../src/components/MainTopic';
import Mindmap from '../../../src/components/model/Mindmap';
import type { NodeOption } from '../../../src/components/NodeGraph';

/** Text width reported by the stubbed getBBox. It is fractional on purpose. */
export const TEXT_WIDTH = 40.5;

/**
 * jsdom has no layout engine, so SVG text measures as nothing. Give every SVG
 * element a fixed, fractional bounding box so topics get a real size.
 */
export const stubSvgMeasurement = (width: number = TEXT_WIDTH): void => {
  (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () =>
    ({ x: 0, y: 0, width, height: 12 }) as DOMRect;
};

export type TopicFixture = {
  mindmap: Mindmap;
  canvas: Canvas;
  central: CentralTopic;
  child: MainTopic;
};

/**
 * Builds a central topic with one child, both added to a stub canvas and
 * connected the way the Designer does it, without a live Designer.
 */
export const buildTopics = (options: Partial<NodeOption> = {}): TopicFixture => {
  const mindmap = new Mindmap();
  const centralModel = mindmap.createNode('CentralTopic', 1);
  centralModel.setPosition(0, 0);
  mindmap.addBranch(centralModel);

  const childModel = mindmap.createNode('MainTopic', 2);
  childModel.setPosition(200, 0);
  childModel.setText('Child');

  const canvas = { append: jest.fn(), removeChild: jest.fn() } as unknown as Canvas;
  const nodeOptions: NodeOption = { readOnly: true, ...options };
  const central = new CentralTopic(centralModel, nodeOptions, 'light');
  const child = new MainTopic(childModel, nodeOptions, 'light');

  central.addToWorkspace(canvas);
  child.addToWorkspace(canvas);
  child.connectTo(central, canvas);

  return { mindmap, canvas, central, child };
};
