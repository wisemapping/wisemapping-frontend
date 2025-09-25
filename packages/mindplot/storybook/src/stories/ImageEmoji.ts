import $ from 'jquery';

import { Mindmap, Topic } from '../../../src';
import NodeModel from '../../../src/components/model/NodeModel';
import CentralTopic from '../../../src/components/CentralTopic';
import Canvas from '../../../src/components/Canvas';
import ScreenManager from '../../../src/components/ScreenManager';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import TopicEventDispatcher from '../../../src/components/TopicEventDispatcher';
import { TopicShapeType } from '../../../src/components/model/INodeModel';
import ThemeType from '../../../src/components/model/ThemeType';
import ImageEmojiFeature from '../../../src/components/ImageEmojiFeature';

const registerRefreshHook = (topic: Topic) => {
  // Trigger a redraw after the node is added ...
  if (globalThis.observer) {
    globalThis.observer.disconnect();
  }

  globalThis.observer = new MutationObserver(() => {
    topic.redraw();
    console.log('Refresh triggered...');
  });
  const rootElement = document.getElementById('root') || document.body;
  globalThis.observer.observe(rootElement, { childList: true });
};

export type ImageEmojiArgs = {
  backgroundColor?: string;
  fontFamily?: string;
  borderColor?: string;
  fontSize?: number;
  fontColor?: string;
  shapeType?: TopicShapeType;
  text?: string;
  emojiChar?: string;
  theme?: ThemeType;
};

const createImageEmoji = (args: ImageEmojiArgs) => {
  // Create container
  const container = document.createElement('div');
  container.id = 'mindmap-container';
  container.style.width = '600px';
  container.style.height = '400px';
  container.style.border = '1px solid #ccc';
  container.style.margin = '20px auto';
  container.style.position = 'relative';

  // Create SVG container
  const svgContainer = document.createElement('div');
  svgContainer.style.width = '100%';
  svgContainer.style.height = '100%';
  svgContainer.style.position = 'relative';
  svgContainer.style.overflow = 'hidden';
  container.appendChild(svgContainer);

  // Initialize Raphael
  const paper = Raphael(svgContainer, 600, 400);

  try {
    // Create mindmap
    const mindmap = new Mindmap();

    // Create central topic
    const centralTopicModel = new NodeModel();
    centralTopicModel.setText('Central Topic');
    centralTopicModel.setType('CentralTopic');
    centralTopicModel.setPosition({ x: 300, y: 200 });
    centralTopicModel.setSize({ width: 120, height: 40 });
    centralTopicModel.setBackgroundColor(args.backgroundColor || '#ffffff');
    centralTopicModel.setBorderColor(args.borderColor || '#000000');
    centralTopicModel.setFontColor(args.fontColor || '#000000');
    centralTopicModel.setFontSize(args.fontSize || 14);
    centralTopicModel.setFontFamily(args.fontFamily || 'Arial');
    centralTopicModel.setShapeType(args.shapeType || 'rounded rectangle');

    const centralTopic = new CentralTopic(centralTopicModel, mindmap);
    mindmap.addBranch(centralTopic);

    // Create child topic with emoji
    const childTopicModel = new NodeModel();
    childTopicModel.setText(args.text || 'Happy Topic');
    childTopicModel.setType('Topic');
    childTopicModel.setPosition({ x: 500, y: 200 });
    childTopicModel.setSize({ width: 120, height: 40 });
    childTopicModel.setBackgroundColor(args.backgroundColor || '#ffffff');
    childTopicModel.setBorderColor(args.borderColor || '#000000');
    childTopicModel.setFontColor(args.fontColor || '#000000');
    childTopicModel.setFontSize(args.fontSize || 14);
    childTopicModel.setFontFamily(args.fontFamily || 'Arial');
    childTopicModel.setShapeType(args.shapeType || 'rounded rectangle');

    const childTopic = new Topic(childTopicModel, mindmap);
    mindmap.addBranch(childTopic);

    // Add emoji if provided
    if (args.emojiChar) {
      const emojiIconModel = new EmojiIconModel();
      emojiIconModel.setEmojiChar(args.emojiChar);
      emojiIconModel.setPosition({ x: 10, y: 10 });
      emojiIconModel.setSize({ width: 20, height: 20 });

      const imageEmojiFeature = new ImageEmojiFeature(childTopic);
      imageEmojiFeature.addEmoji(emojiIconModel);
    }

    // Create canvas
    const canvas = new Canvas(paper, mindmap);
    canvas.setTheme(args.theme || 'classic');

    // Create screen manager
    const screenManager = new ScreenManager(paper, mindmap);

    // Create topic event dispatcher
    const topicEventDispatcher = new TopicEventDispatcher(mindmap, canvas, screenManager);

    // Add topics to canvas
    mindmap.getBranches().forEach((branch) => {
      canvas.addBranch(branch);
    });

    // Register refresh hook
    registerRefreshHook(childTopic);

    // Render
    canvas.redraw();

    // Add some styling
    const style = document.createElement('style');
    style.textContent = `
      #mindmap-container {
        font-family: ${args.fontFamily || 'Arial'};
      }
      .topic-emoji {
        font-size: ${(args.fontSize || 14) + 4}px;
        line-height: 1;
      }
    `;
    document.head.appendChild(style);
  } catch (error) {
    console.error('Error creating ImageEmoji story:', error);
    container.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }

  return container;
};

export default createImageEmoji;
