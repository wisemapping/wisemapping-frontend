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

import { StoryFn, Meta } from '@storybook/html';
import { TopicArgs } from './Topic';
import { Mindmap, Topic, HTMLTopicSelected, Designer } from '../../../src/index';
import NodeModel from '../../../src/components/model/NodeModel';
import CentralTopic from '../../../src/components/CentralTopic';
import MainTopic from '../../../src/components/MainTopic';
import Canvas from '../../../src/components/Canvas';
import ScreenManager from '../../../src/components/ScreenManager';
import TopicEventDispatcher from '../../../src/components/TopicEventDispatcher';
import EventBusDispatcher from '../../../src/components/layout/EventBusDispatcher';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import ChangeEvent from '../../../src/components/layout/ChangeEvent';
import LayoutEventBus from '../../../src/components/layout/LayoutEventBus';
import { $assert } from '../../../src/components/util/assert';
import DesignerOptionsBuilder from '../../../src/components/DesignerOptionsBuilder';
import MockPersistenceManager from '../../../src/components/MockPersistenceManager';
import WidgetBuilder from '../../../src/components/WidgetBuilder';
import PersistenceManager from '../../../src/components/PersistenceManager';

export default {
  title: 'Mindplot/HTMLTopicSelected',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
    borderColor: { control: 'color' },
    fontFamily: {
      options: ['Arial', 'Verdana'],
      control: { type: 'select' },
    },
    fontSize: { control: { type: 'number', min: 0, max: 20, step: 2 } },
    fontColor: { control: 'color' },
    shapeType: {
      options: ['none', 'rectangle', 'rounded rectangle', 'elipse', 'line'],
      control: { type: 'select' },
    },
    text: { control: 'text' },
    noteText: { control: 'text' },
    linkText: { control: 'text' },
    eicon: { control: 'multi-select', options: ['❤️', '🌈', '🖇️'] },
    imageEmojiChar: { control: 'text' },
    theme: { control: 'select', options: ['classic', 'prism', 'robot', 'sunrise', 'ocean'] },
    zoom: {
      control: { type: 'range', min: 0.3, max: 1.9, step: 0.1 },
      description: 'Zoom level (0.3 = zoomed out, 1.9 = zoomed in)',
    },
  },
} as Meta;

const BoundingBoxTemplate: StoryFn<TopicArgs & { zoom?: number }> = (args: TopicArgs & { zoom?: number }) => {
  LayoutEventBus.reset();

  // Build basic container ...
  const divElem = document.createElement('div');
  divElem.style.height = '600px';
  divElem.style.width = '1000px';
  divElem.style.backgroundColor = 'gray';
  divElem.style.position = 'relative';

  // Initialize designer helpers ...
  const screenManager = new ScreenManager(divElem);
  const zoom = args.zoom !== undefined ? args.zoom : 0.7;
  const canvas = new Canvas(screenManager, zoom, true, true);
  const topicEventDispatcher = new TopicEventDispatcher(true);

  // Create mindmap with multiple topics ...
  const mindmap = new Mindmap();
  const topicOptions = { readOnly: true, topicEventDispatcher } as const;

  // Central topic
  const centralModel = new NodeModel('CentralTopic', mindmap);
  centralModel.setText(args.text || 'Central Topic');
  mindmap.addBranch(centralModel);
  const centralTopic = new CentralTopic(centralModel, topicOptions, 'light');

  // Child topic 1
  const child1Model = new NodeModel('MainTopic', mindmap);
  child1Model.setOrder(0);
  child1Model.setText('Child 1');
  child1Model.setPosition(150, 0);
  mindmap.addBranch(child1Model);
  const child1Topic = new MainTopic(child1Model, topicOptions, 'light');

  // Child topic 2
  const child2Model = new NodeModel('MainTopic', mindmap);
  child2Model.setOrder(1);
  child2Model.setText('Child 2');
  child2Model.setPosition(150, -100);
  mindmap.addBranch(child2Model);
  const child2Topic = new MainTopic(child2Model, topicOptions, 'light');

  // Child topic 3
  const child3Model = new NodeModel('MainTopic', mindmap);
  child3Model.setOrder(2);
  child3Model.setText('Child 3');
  child3Model.setPosition(150, 100);
  mindmap.addBranch(child3Model);
  const child3Topic = new MainTopic(child3Model, topicOptions, 'light');

  // Child topic 4
  const child4Model = new NodeModel('MainTopic', mindmap);
  child4Model.setOrder(3);
  child4Model.setText('Child 4');
  child4Model.setPosition(-150, 0);
  mindmap.addBranch(child4Model);
  const child4Topic = new MainTopic(child4Model, topicOptions, 'light');

  const allTopics = [centralTopic, child1Topic, child2Topic, child3Topic, child4Topic];

  // Configure event dispatcher and layout manager
  const dispatcher = new EventBusDispatcher();
  const size = { width: 25, height: 25 };
  const layoutManager = new LayoutManager(mindmap.getCentralTopic().getId(), size);
  dispatcher.setLayoutManager(layoutManager);

  layoutManager.addEvent('change', (event: ChangeEvent) => {
    const id = event.getId();
    const ids = allTopics.filter((t) => t.getModel().getId() === id);
    $assert(ids.length === 1, `Unexpected number of elements ${String(ids)} - ${id}`);
    const topic = ids[0];

    const position = event.getPosition();
    const order = event.getOrder();
    if (position) {
      topic.setPosition(position);
    }
    if (order !== null) {
      topic.setOrder(order);
    }
  });

  // Helper function to get border-radius based on shape type
  const getBorderRadius = (shapeType: string, width: number, height: number): string => {
    const minDimension = Math.min(width, height);
    
    switch (shapeType) {
      case 'rectangle':
        return '0px';
      case 'rounded rectangle':
        // Use 60% of min dimension (matching TopicShapeFactory roundFactor 0.6)
        return `${minDimension * 0.6}px`;
      case 'elipse':
        // Use 50% for circular/elliptical shape (matching TopicShapeFactory roundFactor 0.9 effect)
        return '50%';
      case 'line':
      case 'none':
      case 'image':
      default:
        return '0px';
    }
  };

  // Function to update a single overlay
  const updateOverlay = (topic: Topic, overlay: HTMLDivElement) => {
    const corners = topic.getAbsoluteCornerCoordinates();
    if (!corners) {
      overlay.style.display = 'none';
      return;
    }

    overlay.style.display = 'block';

    // Use ScreenManager's getContainerPosition for consistency (same method used internally)
    const containerPosition = screenManager.getContainerPosition();

    // Calculate position relative to container (both corners and containerPosition are in document coordinates)
    const left = corners.topLeft.x - containerPosition.left;
    const top = corners.topLeft.y - containerPosition.top;
    const width = corners.topRight.x - corners.topLeft.x;
    const height = corners.bottomLeft.y - corners.topLeft.y;

    // Round to avoid sub-pixel rendering issues
    overlay.style.left = `${Math.round(left)}px`;
    overlay.style.top = `${Math.round(top)}px`;
    overlay.style.width = `${Math.round(width)}px`;
    overlay.style.height = `${Math.round(height)}px`;

    // Apply border-radius based on topic shape type
    const shapeType = topic.getShapeType();
    overlay.style.borderRadius = getBorderRadius(shapeType, width, height);
  };

  // Create overlay container - insert it first so it's behind SVG
  const overlayContainer = document.createElement('div');
  overlayContainer.style.position = 'absolute';
  overlayContainer.style.top = '0';
  overlayContainer.style.left = '0';
  overlayContainer.style.width = '100%';
  overlayContainer.style.height = '100%';
  overlayContainer.style.pointerEvents = 'none';
  overlayContainer.style.zIndex = '0';
  overlayContainer.style.overflow = 'visible';
  divElem.insertBefore(overlayContainer, divElem.firstChild);

  // Create overlays for all topics
  const overlayMap = new Map<Topic, HTMLDivElement>();

  // Connect nodes and add to canvas
  canvas.append(centralTopic);

  child1Topic.connectTo(centralTopic, canvas);
  canvas.append(child1Topic);

  child2Topic.connectTo(centralTopic, canvas);
  canvas.append(child2Topic);

  child3Topic.connectTo(centralTopic, canvas);
  canvas.append(child3Topic);

  child4Topic.connectTo(centralTopic, canvas);
  canvas.append(child4Topic);

  // Create overlays after topics are added
  allTopics.forEach((topic) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.border = '2px dotted rgba(255, 0, 0, 1.0)';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'none'; // Hidden by default
    overlayContainer.appendChild(overlay);
    overlayMap.set(topic, overlay);

    // Attach mouse events using topic's addEvent method
    const showOverlay = () => {
      overlay.style.display = 'block';
      updateOverlay(topic, overlay);
    };

    const hideOverlay = () => {
      overlay.style.display = 'none';
    };

    // Use mouseover and mouseout events via topic's addEvent
    topic.addEvent('mouseover', showOverlay);
    topic.addEvent('mouseout', hideOverlay);
  });

  // Hook into LayoutEventBus to update overlays when topics change
  const updateAllOverlays = () => {
    requestAnimationFrame(() => {
      overlayMap.forEach((overlay, topic) => {
        // Only update visible overlays
        if (overlay.style.display === 'block') {
          updateOverlay(topic, overlay);
        }
      });
    });
  };

  // Listen to layout events
  LayoutEventBus.addEvent('forceLayout', updateAllOverlays);
  LayoutEventBus.addEvent('topicResize', updateAllOverlays);
  LayoutEventBus.addEvent('topicMoved', updateAllOverlays);
  LayoutEventBus.addEvent('topicConnected', updateAllOverlays);
  LayoutEventBus.addEvent('topicAdded', updateAllOverlays);

  // Register refresh hook
  const registerRefreshHook = (topics: Topic[]) => {
    if (globalThis.observer) {
      globalThis.observer.disconnect();
    }

    globalThis.observer = new MutationObserver(() => {
      topics.forEach((t) => t.redraw(t.getThemeVariant(), false));
      LayoutEventBus.fireEvent('forceLayout');
      // Update overlays after redraw
      setTimeout(updateAllOverlays, 0);
    });
    const rootElement = document.getElementById('root') || document.body;
    globalThis.observer.observe(rootElement, { childList: true });
  };

  registerRefreshHook(allTopics);

  void canvas.enableQueueRender(false);

  return divElem;
};

const SingleTopicOverlayTemplate: StoryFn<TopicArgs & { zoom?: number }> = (args: TopicArgs & { zoom?: number }) => {
  LayoutEventBus.reset();

  // Build basic container ...
  const divElem = document.createElement('div');
  divElem.style.height = '600px';
  divElem.style.width = '1000px';
  divElem.style.backgroundColor = 'gray';
  divElem.style.position = 'relative';

  // Initialize designer helpers ...
  const screenManager = new ScreenManager(divElem);
  const zoom = args.zoom !== undefined ? args.zoom : 0.7;
  const canvas = new Canvas(screenManager, zoom, true, true);
  const topicEventDispatcher = new TopicEventDispatcher(true);

  // Create a simple mindmap with just one topic
  const mindmap = new Mindmap();
  const topicOptions = { readOnly: true, topicEventDispatcher } as const;

  // Single central topic
  const centralModel = new NodeModel('CentralTopic', mindmap);
  centralModel.setText(args.text || 'Single Topic');
  mindmap.addBranch(centralModel);
  const centralTopic = new CentralTopic(centralModel, topicOptions, 'light');

  // Apply args properties to the topic if needed
  if (args.shapeType) {
    centralModel.setShapeType(args.shapeType);
  }
  if (args.backgroundColor) {
    centralModel.setBackgroundColor(args.backgroundColor);
  }
  if (args.borderColor) {
    centralModel.setBorderColor(args.borderColor);
  }
  if (args.fontColor) {
    centralModel.setFontColor(args.fontColor);
  }
  if (args.fontFamily) {
    centralModel.setFontFamily(args.fontFamily);
  }
  if (args.fontSize !== undefined) {
    centralModel.setFontSize(args.fontSize);
  }

  // Add topic to canvas
  canvas.append(centralTopic);

  // Create HTMLTopicSelected component
  const selectedShadow = new HTMLTopicSelected(centralTopic, divElem, screenManager);

  // Hook into LayoutEventBus to update overlay when topic changes
  const updateAllOverlays = () => {
    requestAnimationFrame(() => {
      selectedShadow.update();
    });
  };

  // Listen to layout events
  LayoutEventBus.addEvent('forceLayout', updateAllOverlays);
  LayoutEventBus.addEvent('topicResize', updateAllOverlays);
  LayoutEventBus.addEvent('topicMoved', updateAllOverlays);

  // Register refresh hook
  const registerRefreshHook = (topic: Topic) => {
    if (globalThis.observer) {
      globalThis.observer.disconnect();
    }

    globalThis.observer = new MutationObserver(() => {
      topic.redraw(topic.getThemeVariant(), false);
      LayoutEventBus.fireEvent('forceLayout');
      // Update overlay after redraw
      setTimeout(updateAllOverlays, 0);
    });
    const rootElement = document.getElementById('root') || document.body;
    globalThis.observer.observe(rootElement, { childList: true });
  };

  registerRefreshHook(centralTopic);

  void canvas.enableQueueRender(false);

  return divElem;
};

// Storybook WidgetBuilder implementation
type WidgetBuilderElement = ReturnType<WidgetBuilder['buildEditorForLink']>;

class StorybookWidgetBuilder extends WidgetBuilder {
  buildEditorForLink(): WidgetBuilderElement {
    return null as WidgetBuilderElement;
  }

  buidEditorForNote(): WidgetBuilderElement {
    return null as WidgetBuilderElement;
  }
}

const SimpleMapWithShadowTemplate: StoryFn<TopicArgs & { zoom?: number }> = (args: TopicArgs & { zoom?: number }) => {
  LayoutEventBus.reset();

  // Build basic container ...
  const divElem = document.createElement('div');
  divElem.style.height = '600px';
  divElem.style.width = '1000px';
  divElem.style.backgroundColor = 'gray';
  divElem.style.position = 'relative';

  // Create simple map XML
  const mapXML = `<?xml version="1.0" encoding="UTF-8"?>
<map name="simple-map" version="tango" theme="prism" layout="mindmap">
  <topic central="true" id="0" text="${args.text || 'Central Topic'}">
    <topic id="1" order="0" position="150,0" text="Child 1"/>
    <topic id="2" order="1" position="150,-100" text="Child 2"/>
    <topic id="3" order="2" position="150,100" text="Child 3"/>
    <topic id="4" order="3" position="-150,0" text="Left Child"/>
  </topic>
</map>`;

  // Create Designer using DesignerOptionsBuilder
  const persistence = new MockPersistenceManager(mapXML);
  const widgetManager = new StorybookWidgetBuilder();
  const zoom = args.zoom !== undefined ? args.zoom : 0.7;

  const designerOptions = DesignerOptionsBuilder.buildOptions({
    divContainer: divElem,
    persistenceManager: persistence,
    widgetManager,
    zoom,
    mode: 'viewonly-public',
    locale: 'en',
    // Selection assistance is enabled by default
  });

  const designer = new Designer(designerOptions);

  // Load the map
  const parser = new DOMParser();
  const mapDom = parser.parseFromString(mapXML, 'text/xml');
  const mindmap = PersistenceManager.loadFromDom('simple-map', mapDom);

  // Load map into designer - HTMLTopicSelected will be automatically created
  // (enabled by default)
  void designer.loadMap(mindmap);

  return divElem;
};

export const NativeCoordinatesOverlay = BoundingBoxTemplate.bind({});
NativeCoordinatesOverlay.args = {
  text: 'Absolute Coords Overlay',
  eicon: ['🌈'],
  shapeType: 'rectangle',
  zoom: 0.7,
};

export const SingleTopicOverlay = SingleTopicOverlayTemplate.bind({});
SingleTopicOverlay.args = {
  text: 'Single Topic with Overlay',
  eicon: ['🌈'],
  shapeType: 'rectangle',
  zoom: 0.7,
};

export const SimpleMapWithShadow = SimpleMapWithShadowTemplate.bind({});
SimpleMapWithShadow.args = {
    text: 'Simple Map with HTMLTopicSelected',
  shapeType: 'rectangle',
  zoom: 0.7,
};

