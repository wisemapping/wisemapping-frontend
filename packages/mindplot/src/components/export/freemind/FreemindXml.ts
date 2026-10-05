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

import { $assert } from '../../util/assert';
import { createDocument } from '../../util/DOMUtils';
import {
  ARROWLINK_ATTRIBUTES,
  Attributes,
  CLOUD_ATTRIBUTES,
  EDGE_ATTRIBUTES,
  FONT_ATTRIBUTES,
  FreemindElement,
  FreemindMap,
  FreemindNode,
  ICON_ATTRIBUTES,
  NODE_ATTRIBUTES,
  unknownFreemindElement,
} from './FreemindModel';

/*
 * Reads and writes FreeMind maps (.mm). Unknown elements, such as attribute_registry, are skipped.
 */

const HOOK_ATTRIBUTES = ['NAME'] as const;

const RICHCONTENT_ATTRIBUTES = ['TYPE'] as const;

// Freeplane arrowlinks also have a dash pattern.
const ARROWLINK_WRITE_ATTRIBUTES = [...ARROWLINK_ATTRIBUTES, 'DASH'] as const;

// The attributes that are set, and not empty.
const readAttributes = <T extends readonly string[]>(element: Element, names: T): Attributes<T> => {
  const result: Attributes<T> = {};
  names.forEach((name: T[number]) => {
    const value = element.getAttribute(name);
    if (value) {
      result[name] = value;
    }
  });
  return result;
};

// The content is read as HTML, which has no CDATA sections and would drop them: their text is
// kept as (escaped) text.
const cdataToText = (node: ChildNode): void => {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.CDATA_SECTION_NODE) {
      child.replaceWith(child.ownerDocument!.createTextNode(child.textContent || ''));
    } else {
      cdataToText(child);
    }
  });
};

const readHtml = (element: Element): string | undefined => {
  if (!element.firstChild) {
    return undefined;
  }
  const content = element.getElementsByTagName('html')[0];
  if (!content) {
    return '';
  }
  const htmlElem = content.cloneNode(true) as Element;
  cdataToText(htmlElem);
  return htmlElem.outerHTML;
};

const elementFromDom = (element: Element): FreemindElement | null => {
  switch (element.tagName) {
    case 'node': {
      const children = Array.from(element.children)
        .map(elementFromDom)
        .filter((child): child is FreemindElement => child !== null);
      return { kind: 'node', ...readAttributes(element, NODE_ATTRIBUTES), children };
    }
    case 'font':
      return { kind: 'font', ...readAttributes(element, FONT_ATTRIBUTES) };
    case 'edge':
      return { kind: 'edge', ...readAttributes(element, EDGE_ATTRIBUTES) };
    case 'arrowlink':
      return { kind: 'arrowlink', ...readAttributes(element, ARROWLINK_ATTRIBUTES) };
    case 'cloud':
      return { kind: 'cloud', ...readAttributes(element, CLOUD_ATTRIBUTES) };
    case 'icon':
      return { kind: 'icon', ...readAttributes(element, ICON_ATTRIBUTES) };
    case 'hook': {
      const text = Array.from(element.children).find((child) => child.tagName === 'text');
      return {
        kind: 'hook',
        ...readAttributes(element, HOOK_ATTRIBUTES),
        text: text?.textContent || undefined,
      };
    }
    case 'richcontent':
      return {
        kind: 'richcontent',
        ...readAttributes(element, RICHCONTENT_ATTRIBUTES),
        html: readHtml(element),
      };
    default:
      return null;
  }
};

export const loadFreemindMap = (dom: Document): FreemindMap => {
  $assert(dom, 'dom can not be null');

  const rootElem = dom.documentElement;

  // Is a freemap?
  $assert(
    rootElem.tagName === 'map',
    `This seem not to be a map document. Found first tag: ${rootElem.tagName}`,
  );

  // Verify that the version attribute exists
  $assert(rootElem.getAttribute('version') !== null, 'Freemind version not found');

  const freemap: FreemindMap = { version: rootElem.getAttribute('version') || '1.0.1' };

  // Other elements, such as attribute_registry, can precede the root node.
  const mainTopicElement = Array.from(rootElem.children).find((child) => child.tagName === 'node');
  if (mainTopicElement) {
    // The root node keeps its icons, notes, arrowlinks... like any other node.
    freemap.node = elementFromDom(mainTopicElement) as FreemindNode;
  }
  return freemap;
};

const writeAttributes = <T extends readonly string[]>(
  elem: Element,
  values: Attributes<T>,
  names: T,
): Element => {
  names.forEach((name: T[number]) => {
    const value = values[name];
    if (value) {
      elem.setAttribute(name, value);
    }
  });
  return elem;
};

// Appends the element to its parent and returns it, or null for an element of an unknown kind.
const elementToXml = (
  element: FreemindElement,
  parent: Element,
  document: Document,
  isCentralTopic = false,
): Element | null => {
  let elem: Element;
  switch (element.kind) {
    case 'node': {
      const nodeElem = document.createElement('node');
      if (element.ID) nodeElem.setAttribute('ID', element.ID);
      // The central node always has a text, even if empty, and comes right after its id.
      if (isCentralTopic) nodeElem.setAttribute('TEXT', element.TEXT || '');
      writeAttributes(nodeElem, element, NODE_ATTRIBUTES);
      parent.appendChild(nodeElem);
      element.children.forEach((child) => elementToXml(child, nodeElem, document));
      return nodeElem;
    }
    case 'font':
      elem = writeAttributes(
        document.createElement('font'),
        { ...element, SIZE: element.SIZE || '12' },
        FONT_ATTRIBUTES,
      );
      break;
    case 'edge':
      elem = writeAttributes(document.createElement('edge'), element, EDGE_ATTRIBUTES);
      break;
    case 'arrowlink':
      elem = writeAttributes(
        document.createElement('arrowlink'),
        element,
        ARROWLINK_WRITE_ATTRIBUTES,
      );
      break;
    case 'cloud':
      elem = writeAttributes(document.createElement('cloud'), element, CLOUD_ATTRIBUTES);
      break;
    case 'icon':
      elem = writeAttributes(document.createElement('icon'), element, ICON_ATTRIBUTES);
      break;
    case 'hook':
      elem = writeAttributes(document.createElement('hook'), element, HOOK_ATTRIBUTES);
      if (element.text) {
        const textElem = document.createElement('text');
        textElem.textContent = element.text;
        elem.appendChild(textElem);
      }
      break;
    case 'richcontent':
      elem = writeAttributes(
        document.createElement('richcontent'),
        element,
        RICHCONTENT_ATTRIBUTES,
      );
      if (element.html) {
        elem.appendChild(document.createRange().createContextualFragment(element.html));
      }
      break;
    default:
      return unknownFreemindElement(element);
  }
  parent.appendChild(elem);
  return elem;
};

export const freemindMapToXml = (map: FreemindMap): Document => {
  const document = createDocument();

  const mapElem = document.createElement('map');
  if (map.version) {
    mapElem.setAttribute('version', map.version);
  }
  document.appendChild(mapElem);

  elementToXml(map.node!, mapElem, document, true);
  return document;
};
