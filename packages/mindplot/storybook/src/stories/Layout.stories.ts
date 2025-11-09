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

/* eslint-disable no-new */
import { StoryFn, Meta } from '@storybook/html';
import BalancedTestSuite from './layout/BalancedTestSuite';
import SymmetricTestSuite from './layout/SymmetricTestSuite';
import TestSuite from './layout/TestSuite';
import {
  MindplotWebComponent,
  MockPersistenceManager,
  PersistenceManager,
  WidgetBuilder,
} from '../../../src/index';
import type Designer from '../../../src/components/Designer';
// Raphael is preloaded in preview.js

export default {
  title: 'Mindplot/Layout',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {},
} as Meta;

const fullSuite = () => {
  const divElem = document.createElement('div');

  divElem.innerHTML = `  
  <div id="basicTest" style="display: none">
  <h1>Basic Tests</h1>

  <h3>testAligned:</h3>
  <div id="testAligned"></div>

  <h3>testBaselineAligned:</h3>
  <div id="testBaselineAligned1"></div>
  <div id="testBaselineAligned2"></div>

  <h3>testEvents:</h3>
  <div id="testEvents1" class="col"></div>
  <div id="testEvents2" class="col last"></div>

  <h3>testEventsComplex:</h3>
  <div id="testEventsComplex1" class="col"></div>
  <div id="testEventsComplex2" class="col last"></div>

  <h3>testDisconnect:</h3>
  <div id="testDisconnect1" class="col"></div>
  <div id="testDisconnect2" class="col"></div>
  <div id="testDisconnect3" class="col last"></div>

  <h3>testReconnect:</h3>
  <div id="testReconnect1" class="col"></div>
  <div id="testReconnect2" class="col last"></div>

  <h3>testRemoveNode:</h3>
  <div id="testRemoveNode1" class="col"></div>
  <div id="testRemoveNode2" class="col last"></div>
  <div id="testRemoveNode3" class="col last"></div>
  <div id="testRemoveNode4" class="col last"></div>

  <h3>testSize:</h3>
  <div id="testSize1" class="col"></div>
  <div id="testSize2" class="col last"></div>
  <div id="testSize3" class="col last"></div>
  <div id="testSize4" class="col last"></div>
  <div id="testSize5" class="col last"></div>
  <div id="testSize6" class="col last"></div>

  <h3>testReconnectSingleNode:</h3>
  <div id="testReconnectSingleNode1" class="col"></div>
  <div id="testReconnectSingleNode2" class="col"></div>
</div>

<div id="balancedTest" style="display: none">
  <h1>Balanced Sorter Tests</h1>

  <h3>testBalanced:</h3>
  <div id="testBalanced1" class="col"></div>
  <div id="testBalanced2" class="col"></div>
  <div id="testBalanced3" class="col last"></div>
  <div id="testBalanced4" class="col"></div>
  <div id="testBalanced5" class="col"></div>
  <div id="testBalanced6" class="col last"></div>
  <div id="testBalanced7" class="col"></div>
  <div id="testBalanced8" class="col last"></div>
  <div id="testBalanced9" class="col last"></div>
  <div id="testBalanced10" class="col last"></div>
  <div id="testBalanced11" class="col last"></div>
  <div id="testBalanced12" class="col last"></div>
  <div id="testBalanced13" class="col last"></div>

  <h3>testBalancedPredict:</h3>
  <div id="testBalancedPredict1"></div>
  <div id="testBalancedPredict2"></div>
  <div id="testBalancedPredict3"></div>
  <div id="testBalancedPredict4"></div>
  <div id="testBalancedPredict5"></div>

  <h3>testBalancedNodeDragPredict</h3>
  <div id="testBalancedNodeDragPredict1"></div>
  <div id="testBalancedNodeDragPredict2"></div>
  <div id="testBalancedNodeDragPredict3"></div>
</div>

<div id="symmetricTest" style="display: none">
  <h1>Symmetric Sorter Tests</h1>
  <h3>testSymmetry:</h3>
  <div id="testSymmetry"></div>

  <h3>testSymmetricPredict:</h3>
  <div id="testSymmetricPredict1"></div>
  <div id="testSymmetricPredict2"></div>
  <div id="testSymmetricPredict3"></div>
  <div id="testSymmetricPredict4"></div>
  <div id="testSymmetricPredict5"></div>

  <h3>testSymmetricDragPredict:</h3>
  <div id="testSymmetricDragPredict1"></div>
</div>

<div id="freeTest" style="display: none">
  <h1>Free Positioning Tests</h1>

  <h3>testFreePosition:</h3>
  <div id="testFreePosition1" class="col"></div>
  <div id="testFreePosition2" class="col last"></div>
  <div id="testFreePosition3" class="col last"></div>
  <div id="testFreePosition4" class="col last"></div>
  <div id="testFreePosition5" class="col last"></div>
  <div id="testFreePosition6" class="col last"></div>
  <div id="testFreePosition7" class="col last"></div>
  <div id="testFreePosition8" class="col last"></div>
  <div id="testFreePosition9" class="col last"></div>

  <h3>testFreePredict:</h3>
  <div id="testFreePredict1" class="col"></div>

  <h3>testReconnectFreeNode:</h3>
  <div id="testReconnectFreeNode1" class="col"></div>
  <div id="testReconnectFreeNode2" class="col"></div>
  <div id="testReconnectFreeNode3" class="col"></div>
  <div id="testReconnectFreeNode4" class="col"></div>
  <div id="testReconnectFreeNode5" class="col"></div>
  <div id="testReconnectFreeNode6" class="col"></div>
  <div id="testReconnectFreeNode7" class="col"></div>

  <h3>testSiblingOverlapping:</h3>
  <div id="testSiblingOverlapping1" class="col"></div>
  <div id="testSiblingOverlapping2" class="col"></div>
  <div id="testSiblingOverlapping3" class="col"></div>

  <h3>testRootNodeChildrenPositioning:</h3>
  <div id="testRootNodeChildrenPositioning1" class="col"></div>
  <div id="testRootNodeChildrenPositioning2" class="col"></div>
  <div id="testRootNodeChildrenPositioning3" class="col"></div>
  <div id="testRootNodeChildrenPositioning4" class="col"></div>
  <div id="testRootNodeChildrenPositioning5" class="col"></div>

  <h3>testBalancedFreePredict:</h3>
  <div id="testBalancedFreePredict1" class="col"></div>

  <h3>testFreeReorder:</h3>
  <div id="testFreeReorder1" class="col"></div>

  <h3>testFreeOverlap:</h3>
  <div id="testFreeOverlap1" class="col"></div>
  <div id="testFreeOverlap2" class="col"></div>
</div>`;
  window.addEventListener('DOMContentLoaded', () => {
    new TestSuite();
    new BalancedTestSuite();
    new SymmetricTestSuite();
  });

  return divElem;
};

const Template: StoryFn = () => fullSuite();
export const BasicSuite = Template.bind({});

const SAMPLE_MAP_XML = `
<map name="storybook-sample" version="tango" layout="mindmap">
  <topic central="true" id="0" text="Root Topic">
    <topic id="1" order="0" position="-220,-40" text="Left Branch">
      <topic id="4" order="0" position="-360,-120" text="Left Child"/>
      <topic id="5" order="1" position="-360,40" text="Left Sibling"/>
    </topic>
    <topic id="2" order="1" position="220,-60" text="Right Branch">
      <topic id="6" order="0" position="360,-140" text="Right Child"/>
    </topic>
    <topic id="3" order="2" position="0,180" text="Bottom Branch">
      <topic id="7" order="0" position="-60,280" text="Bottom Left Child"/>
      <topic id="8" order="1" position="60,280" text="Bottom Right Child"/>
    </topic>
  </topic>
</map>
`.trim();

type WidgetBuilderElement = ReturnType<WidgetBuilder['buildEditorForLink']>;

class StorybookWidgetBuilder extends WidgetBuilder {
  buildEditorForLink(): WidgetBuilderElement {
    return null as WidgetBuilderElement;
  }

  buidEditorForNote(): WidgetBuilderElement {
    return null as WidgetBuilderElement;
  }
}

declare global {
  interface Window {
    __mindplotStoryContainer?: HTMLDivElement;
    __mindplotStoryDesigner?: Designer;
  }
}

const ensureMindmapStory = (): HTMLDivElement => {
  if (!window.__mindplotStoryContainer) {
    const container = document.createElement('div');
    container.id = 'mindplot-story-root';
    container.style.width = '960px';
    container.style.height = '600px';
    container.style.margin = '0 auto';
    container.style.backgroundColor = '#f5f5f5';
    container.setAttribute('data-testid', 'mindmap-story-container');
    container.setAttribute('data-loaded', 'initial');

    const mindplotElement = document.createElement(
      'mindplot-component',
    ) as MindplotWebComponent;
    mindplotElement.id = 'mindmap-comp';
    mindplotElement.setAttribute('mode', 'viewonly');
    mindplotElement.style.width = '100%';
    mindplotElement.style.height = '100%';
    container.appendChild(mindplotElement);

    const persistence = new MockPersistenceManager(SAMPLE_MAP_XML);
    const widgetManager = new StorybookWidgetBuilder();

    const designer = mindplotElement.buildDesigner(persistence, widgetManager);
    window.__mindplotStoryDesigner = designer;
    container.setAttribute('data-loaded', 'building');

    designer.addEvent('loadSuccess', () => {
      container.setAttribute('data-loaded', 'ready');
    });

    try {
      const parser = new DOMParser();
      const document = parser.parseFromString(SAMPLE_MAP_XML, 'text/xml');
      const mindmap = PersistenceManager.loadFromDom('storybook-sample-map', document);
      void designer.loadMap(mindmap).catch((error) => {
        console.error('Mindmap story failed to load', error);
        container.setAttribute('data-loaded', 'error');
      });
    } catch (error) {
      console.error('Mindmap story failed to parse map XML', error);
      container.setAttribute('data-loaded', 'error');
    }

    window.__mindplotStoryContainer = container;
  }

  return window.__mindplotStoryContainer!;
};

const RenderedMindmapTemplate: StoryFn = () => ensureMindmapStory();

export const RenderedMindmap = RenderedMindmapTemplate.bind({});
