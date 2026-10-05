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
import MindplotWebComponent from '../../src/components/MindplotWebComponent';
import Designer from '../../src/components/Designer';
import PersistenceManager from '../../src/components/PersistenceManager';
import Topic from '../../src/components/Topic';
import XMLSerializerFactory from '../../src/components/persistence/XMLSerializerFactory';
import { SAMPLE_MAP, StubWidgetManager } from './commands/designer-harness';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

if (!customElements.get('mindplot-component')) {
  customElements.define('mindplot-component', MindplotWebComponent);
}

type Map = { component: MindplotWebComponent; wrapper: HTMLElement; designer: Designer };

/** A <mindplot-component> on the page, in a wrapper of its own, with SAMPLE_MAP loaded. */
const buildMap = async (): Promise<Map> => {
  const wrapper = document.body.appendChild(document.createElement('div'));
  const component = document.createElement('mindplot-component') as MindplotWebComponent;
  component.setAttribute('mode', 'edition-owner');
  wrapper.appendChild(component);

  const persistence = { save: jest.fn(), unlockMap: jest.fn() } as unknown as PersistenceManager;
  const designer = component.buildDesigner(persistence, new StubWidgetManager());
  const xml = new DOMParser().parseFromString(SAMPLE_MAP, 'text/xml');
  await designer.loadMap(XMLSerializerFactory.createFromDocument(xml).loadFromDom(xml, 'sample'));
  return { component, wrapper, designer };
};

const topicOf = (map: Map, id: number): Topic => map.designer.getModel().findTopicById(id)!;

const hover = (map: Map): void => {
  map.designer.getContainer().dispatchEvent(new MouseEvent('mouseenter'));
};

const mouse = (target: EventTarget, type: string, x: number, y: number): void => {
  target.dispatchEvent(
    new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true }),
  );
};

/**
 * T3 (BL5-179..184): two maps on one page, each in its own web component. The keys, the text
 * editor and a drag each go to the map they are used on.
 */
describe('two <mindplot-component> maps on one page', () => {
  let first: Map;
  let second: Map;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    first = await buildMap();
    second = await buildMap();
  });

  afterEach(async () => {
    document.body.innerHTML = '';
    // The components dispose their designers once they leave the page ...
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    jest.restoreAllMocks();
  });

  it('builds a designer for each', () => {
    expect(first.designer).not.toBe(second.designer);
    expect(first.component.getDesigner()).toBe(first.designer);
    expect(second.component.getDesigner()).toBe(second.designer);
  });

  it('sends a shortcut to the map the pointer is over', () => {
    first.designer.goToNode(topicOf(first, 2));
    second.designer.goToNode(topicOf(second, 2));

    hover(first);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

    expect(first.designer.getModel().findTopicById(2)).toBeUndefined();
    expect(second.designer.getModel().findTopicById(2)).toBeDefined();
  });

  it('saves the map the pointer is over on ctrl+s', () => {
    const firstSave = jest.spyOn(first.component, 'save').mockResolvedValue(undefined);
    const secondSave = jest.spyOn(second.component, 'save').mockResolvedValue(undefined);

    hover(second);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));

    expect(secondSave).toHaveBeenCalledTimes(1);
    expect(firstSave).not.toHaveBeenCalled();
  });

  it('opens the text editor next to the map of the topic typed into', () => {
    second.designer.goToNode(topicOf(second, 1));
    first.designer.goToNode(topicOf(first, 1));

    hover(second);
    document.dispatchEvent(new KeyboardEvent('keypress', { key: 'x', code: 'KeyX' }));

    expect(second.designer.getTextEditor().getActiveTopic()).toBe(topicOf(second, 1));
    expect(first.designer.getTextEditor().isActive()).toBe(false);
    expect(second.wrapper.querySelector(':scope > #textContainer')).not.toBeNull();
    expect(first.wrapper.querySelector('#textContainer')).toBeNull();
  });

  it('moves the dragged topic on its own map only', () => {
    const before = { ...topicOf(second, 5).getPosition() };
    const node = topicOf(first, 5).get2DElement().getNode();

    hover(first);
    mouse(node, 'mousedown', 10, 10);
    mouse(document, 'mousemove', 60, 90);
    mouse(document, 'mousemove', 110, 170);
    mouse(document, 'mouseup', 110, 170);

    expect(topicOf(first, 5).getPosition()).not.toEqual(before);
    expect(topicOf(second, 5).getPosition()).toEqual(before);
    expect(first.designer.getMindmap().findNodeById(5)!.getPosition()).not.toEqual(before);
    expect(second.designer.getMindmap().findNodeById(5)!.getPosition()).toEqual(before);
  });

  it('keeps one map working when the other leaves the page', async () => {
    second.wrapper.remove();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    expect(second.designer.isDisposed()).toBe(true);

    first.designer.goToNode(topicOf(first, 2));
    hover(first);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

    expect(first.designer.getModel().findTopicById(2)).toBeUndefined();
  });
});
