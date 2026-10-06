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

/*
 * Builds a real Designer on a jsdom container so commands can be exercised
 * end to end: through the action dispatcher, the undo manager and the layout.
 *
 * Test files using it must mock PDFExporter themselves (jest.mock is hoisted
 * per file), as the other designer tests do.
 */
import Designer from '../../../src/components/Designer';
import LinkIcon from '../../../src/components/LinkIcon';
import NoteIcon from '../../../src/components/NoteIcon';
import Topic from '../../../src/components/Topic';
import WidgetBuilder from '../../../src/components/WidgetBuilder';
import LinkModel from '../../../src/components/model/LinkModel';
import NoteModel from '../../../src/components/model/NoteModel';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';

// jsdom does not lay out SVG text, so give every element a fixed box.
type SVGElementPrototype = {
  getBBox: () => { x: number; y: number; width: number; height: number };
  getComputedTextLength: () => number;
};
const svgPrototype = (window as unknown as { SVGElement: { prototype: SVGElementPrototype } })
  .SVGElement.prototype;
svgPrototype.getBBox = () => ({ x: 0, y: 0, width: 60, height: 14 });
svgPrototype.getComputedTextLength = () => 60;

/**
 * A widget manager with no UI: note and link icons register their tooltips on
 * it when a topic is rendered, and there is no web component to show them in.
 */
export class StubWidgetManager extends WidgetBuilder {
  override createTooltipForLink(_topic: Topic, _linkModel: LinkModel, _linkIcon: LinkIcon): void {
    // No tooltips in tests.
  }

  override configureTooltipForNode(
    _topic: Topic,
    _noteModel: NoteModel,
    _noteIcon: NoteIcon,
  ): void {
    // No tooltips in tests.
  }

  buildEditorForLink(): React.ReactElement {
    throw new Error('The link editor is not available in tests');
  }

  buidEditorForNote(): React.ReactElement {
    throw new Error('The note editor is not available in tests');
  }
}

/**
 * Central (0)
 * ├── A (1)
 * │   └── A1 (2)
 * └── B (3)
 *     └── B1 (4)
 * Floating (5), not connected to anything.
 * A relationship (id 10) links B to Floating.
 */
export const SAMPLE_MAP = [
  '<map name="sample" version="tango">',
  '  <topic id="0" central="true" text="Central">',
  '    <topic id="1" text="A" position="200,-50" order="0">',
  '      <topic id="2" text="A1" position="350,-50" order="0"/>',
  '    </topic>',
  '    <topic id="3" text="B" position="-200,50" order="1">',
  '      <topic id="4" text="B1" position="-350,50" order="0"/>',
  '    </topic>',
  '  </topic>',
  '  <topic id="5" text="Floating" position="400,400"/>',
  '  <relationship id="10" srcTopicId="3" destTopicId="5" lineType="3" endArrow="true" startArrow="false"/>',
  '</map>',
].join('\n');

const sortTopicsById = (element: Element): void => {
  const topics = Array.from(element.children).filter((child) => child.tagName === 'topic');
  if (topics.length === 0) {
    return;
  }
  topics.forEach((child) => sortTopicsById(child));

  // Re-insert the topics, sorted, where they were: before anything that followed them.
  const anchor = topics[topics.length - 1].nextSibling;
  topics
    .sort((a, b) => Number(a.getAttribute('id')) - Number(b.getAttribute('id')))
    .forEach((child) => element.insertBefore(child, anchor));
};

export type Harness = {
  designer: Designer;
  /**
   * Serializes the current mindmap, as it would be saved. Sibling topics are
   * sorted by id: their position in the model's children array is not
   * meaningful (the layout uses the order attribute), and an undo may append
   * a restored topic after its siblings.
   */
  save: () => string;
  topic: (id: number) => Topic;
};

/**
 * Builds a designer on `container`, or on a new div appended to the body.
 */
export const buildDesigner = async (
  xml: string = SAMPLE_MAP,
  container: HTMLDivElement = document.body.appendChild(document.createElement('div')),
): Promise<Harness> => {
  const designer = new Designer({
    zoom: 1,
    mode: 'edition-owner',
    divContainer: container,
    widgetManager: new StubWidgetManager(),
  });

  const document_ = new DOMParser().parseFromString(xml, 'text/xml');
  const serializer = XMLSerializerFactory.createFromDocument(document_);
  const mindmap = serializer.loadFromDom(document_, 'sample');
  await designer.loadMap(mindmap);

  const save = () => {
    const saved = serializer.toXML(designer.getMindmap());
    sortTopicsById(saved.documentElement);
    return new XMLSerializer().serializeToString(saved);
  };

  const topic = (id: number): Topic => {
    const result = designer.getModel().findTopicById(id);
    if (!result) {
      throw new Error(`Topic ${id} is not on the canvas`);
    }
    return result;
  };

  return { designer, save, topic };
};
