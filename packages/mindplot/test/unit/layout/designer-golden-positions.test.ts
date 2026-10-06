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

/* eslint-disable import/first */
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/*
 * Golden positions through a real Designer: medium maps are loaded and edited, and the position
 * of every topic on the canvas is compared with a snapshot taken before the layout was made
 * incremental.
 */
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';
import { buildDesigner, Harness } from '../commands/designer-harness';

const load = (file: string): Promise<Harness> =>
  buildDesigner(fs.readFileSync(path.resolve(__dirname, '../export/input', file), 'utf8'));

// "id x y", one string per topic, to keep the snapshot readable.
const positions = ({ designer }: Harness): string[] =>
  designer
    .getModel()
    .getTopics()
    .slice()
    .sort((a, b) => a.getId() - b.getId())
    .map((topic) => `${topic.getId()} ${topic.getPosition().x} ${topic.getPosition().y}`);

const scenario = async (file: string) => {
  const harness = await load(file);
  const { designer } = harness;
  const dispatcher = designer.getActionDispatcher();
  const steps: Array<{ step: string; positions: string[] }> = [];
  const record = (step: string) => steps.push({ step, positions: positions(harness) });

  record('loaded');

  const central = designer.getModel().getCentralTopic();
  const mains = central.getChildren();
  const branch = mains.find((topic) => topic.getChildren().length > 0)!;

  dispatcher.shrinkBranch([branch.getId()], true);
  record('a branch is collapsed');
  dispatcher.shrinkBranch([branch.getId()], false);
  record('the branch is expanded');

  const moved = branch.getChildren()[branch.getChildren().length - 1]!;
  dispatcher.dragTopic(moved.getId(), { x: 0, y: 0 }, 0, branch);
  record('the last child of a branch is dragged first');

  const other = mains.find((topic) => topic !== branch)!;
  dispatcher.dragTopic(moved.getId(), { x: 0, y: 0 }, 0, other);
  record('a topic is dragged to another branch');

  dispatcher.deleteEntities([mains[mains.length - 1]!.getId()], []);
  record('a main topic is deleted');

  designer.changeLayout('tree');
  record('switched to the tree layout');
  designer.changeLayout('mindmap');
  record('switched back to the mind map layout');

  return steps;
};

describe('designer golden positions', () => {
  it('complex.wxml', async () => {
    expect(await scenario('complex.wxml')).toMatchSnapshot();
  });

  it('bug3.wxml', async () => {
    expect(await scenario('bug3.wxml')).toMatchSnapshot();
  });
});
