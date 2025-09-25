import { Mindmap, Topic } from '../../../src';
import NodeModel from '../../../src/components/model/NodeModel';
import CentralTopic from '../../../src/components/CentralTopic';
import Canvas from '../../../src/components/Canvas';
import ScreenManager from '../../../src/components/ScreenManager';
import TopicEventDispatcher from '../../../src/components/TopicEventDispatcher';
import ThemeType from '../../../src/components/model/ThemeType';
import Designer from '../../../src/components/Designer';

const registerRefreshHook = (designer: Designer) => {
  // Trigger a redraw after changes
  if (globalThis.observer) {
    globalThis.observer.disconnect();
  }

  globalThis.observer = new MutationObserver(() => {
    designer.redraw();
    console.log('Background refresh triggered...');
  });
  const rootElement = document.getElementById('root') || document.body;
  globalThis.observer.observe(rootElement, { childList: true });
};

export type BackgroundArgs = {
  backgroundColor?: string;
  backgroundPattern?: 'solid' | 'grid' | 'dots' | 'none';
  gridSize?: number;
  gridColor?: string;
  theme?: ThemeType;
};

const createBackground = (args: BackgroundArgs) => {
  // Create container
  const container = document.createElement('div');
  container.id = 'mindmap-container';
  container.style.width = '800px';
  container.style.height = '600px';
  container.style.border = '1px solid #ccc';
  container.style.margin = '20px auto';
  container.style.position = 'relative';
  container.style.backgroundColor = args.backgroundColor || '#f2f2f2';

  // Create SVG container
  const svgContainer = document.createElement('div');
  svgContainer.style.width = '100%';
  svgContainer.style.height = '100%';
  svgContainer.style.position = 'relative';
  svgContainer.style.overflow = 'hidden';
  container.appendChild(svgContainer);

  // Initialize Raphael
  const paper = Raphael(svgContainer, 800, 600);

  try {
    // Create mindmap
    const mindmap = new Mindmap();

    // Set canvas style if provided
    if (args.backgroundColor || args.backgroundPattern || args.gridSize || args.gridColor) {
      const canvasStyle = {
        backgroundColor: args.backgroundColor || '#f2f2f2',
        backgroundPattern: args.backgroundPattern || 'solid',
        gridSize: args.gridSize || 50,
        gridColor: args.gridColor || '#ebe9e7',
      };
      mindmap.setCanvasStyle(canvasStyle);
    }

    // Create central topic
    const centralTopicModel = new NodeModel();
    centralTopicModel.setText('Central Topic');
    centralTopicModel.setType('CentralTopic');
    centralTopicModel.setPosition({ x: 400, y: 300 });
    centralTopicModel.setSize({ width: 120, height: 40 });

    const centralTopic = new CentralTopic(centralTopicModel, mindmap);
    mindmap.addBranch(centralTopic);

    // Create child topics to demonstrate the background
    const topics = [
      { text: 'Topic 1', x: 200, y: 200 },
      { text: 'Topic 2', x: 600, y: 200 },
      { text: 'Topic 3', x: 200, y: 400 },
      { text: 'Topic 4', x: 600, y: 400 },
    ];

    topics.forEach(({ text, x, y }) => {
      const topicModel = new NodeModel();
      topicModel.setText(text);
      topicModel.setType('Topic');
      topicModel.setPosition({ x, y });
      topicModel.setSize({ width: 100, height: 30 });

      const topic = new Topic(topicModel, mindmap);
      mindmap.addBranch(topic);
    });

    // Create canvas
    const canvas = new Canvas(paper, mindmap);
    canvas.setTheme(args.theme || 'classic');

    // Apply custom background style
    if (args.backgroundColor || args.backgroundPattern || args.gridSize || args.gridColor) {
      const canvasStyle = {
        backgroundColor: args.backgroundColor || '#f2f2f2',
        backgroundPattern: args.backgroundPattern || 'solid',
        gridSize: args.gridSize || 50,
        gridColor: args.gridColor || '#ebe9e7',
      };

      // Generate CSS style based on the background configuration
      let cssStyle = `position: relative;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
        overflow: hidden;
        opacity: 1;
        background-color: ${canvasStyle.backgroundColor};
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;`;

      switch (canvasStyle.backgroundPattern) {
        case 'grid':
          cssStyle += `
            background-image: linear-gradient(${canvasStyle.gridColor} 1px, transparent 1px),
              linear-gradient(to right, ${canvasStyle.gridColor} 1px, ${canvasStyle.backgroundColor} 1px);
            background-size: ${canvasStyle.gridSize}px ${canvasStyle.gridSize}px;`;
          break;
        case 'dots':
          cssStyle += `
            background-image: radial-gradient(circle, ${canvasStyle.gridColor} 1px, transparent 1px);
            background-size: ${canvasStyle.gridSize}px ${canvasStyle.gridSize}px;`;
          break;
        case 'solid':
        case 'none':
        default:
          // Just solid background color, no additional styling needed
          break;
      }

      canvas.setBackgroundStyle(cssStyle);
    }

    // Create screen manager
    const screenManager = new ScreenManager(paper, mindmap);

    // Create topic event dispatcher
    new TopicEventDispatcher(mindmap, canvas, screenManager);

    // Create designer to manage the overall view
    const designer = new Designer();
    designer.setCanvas(canvas);
    designer.setMindmap(mindmap);

    // Add topics to canvas
    mindmap.getBranches().forEach((branch) => {
      canvas.addBranch(branch);
    });

    // Register refresh hook
    registerRefreshHook(designer);

    // Render
    canvas.redraw();

    // Add some styling
    const style = document.createElement('style');
    style.textContent = `
      #mindmap-container {
        font-family: Arial, sans-serif;
      }
      .background-demo-info {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(255, 255, 255, 0.9);
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 200px;
      }
    `;
    document.head.appendChild(style);

    // Add info overlay
    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'background-demo-info';
    infoOverlay.innerHTML = `
      <strong>Background Demo</strong><br>
      Pattern: ${args.backgroundPattern || 'solid'}<br>
      Color: ${args.backgroundColor || '#f2f2f2'}<br>
      ${
        args.backgroundPattern === 'grid' || args.backgroundPattern === 'dots'
          ? `Grid Size: ${args.gridSize || 50}px<br>Grid Color: ${args.gridColor || '#ebe9e7'}`
          : ''
      }
    `;
    container.appendChild(infoOverlay);
  } catch (error) {
    console.error('Error creating Background story:', error);
    container.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }

  return container;
};

export default createBackground;
