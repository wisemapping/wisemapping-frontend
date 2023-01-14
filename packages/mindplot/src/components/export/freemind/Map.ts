import { createDocument, $assert } from '@wisemapping/core-js';
import Arrowlink from './Arrowlink';
import Cloud from './Cloud';
import Edge from './Edge';
import Font from './Font';
import Icon from './Icon';
import Node, { Choise } from './Node';
import Richcontent from './Richcontent';

export default class Freemap {
  protected node: Node | undefined;

  protected version: string | undefined;

  getNode(): Node | undefined {
    return this.node;
  }

  getVersion(): string | undefined {
    return this.version;
  }

  setNode(value: Node) {
    this.node = value;
  }

  setVesion(value: string) {
    this.version = value;
  }

  toXml(): Document {
    const document = createDocument();

    // Set map attributes
    const mapElem = document.createElement('map');
    mapElem.setAttribute('version', this.version);

    document.appendChild(mapElem);

    // Create main node
    const mainNode: Node = this.node!;
    mainNode.setCentralTopic(true);
    const mainNodeElem = mainNode.toXml(document);
    mapElem.appendChild(mainNodeElem);

    const childNodes: Array<Choise> = mainNode.getArrowlinkOrCloudOrEdge();
    childNodes.forEach((childNode: Choise) => {
      const node = this.nodeToXml(childNode, mainNodeElem, document);
      mainNodeElem.appendChild(node);
    });

    return document;
  }

  loadFromDom(dom: Document): Freemap {
    $assert(dom, 'dom can not be null');

    const rootElem = dom.documentElement;

    // Is a freemap?
    $assert(
      rootElem.tagName === 'map',
      `This seem not to be a map document. Found first tag: ${rootElem.tagName}`,
    );

    // Verify that the version attribute exists
    console.log(rootElem.getAttribute('version'));
    $assert(rootElem.getAttribute('version') !== null, 'Freemind version not found');

    // Start the loading process...
    const version = rootElem.getAttribute('version') || '1.0.1';
    const freemap: Freemap = new Freemap();
    freemap.setVesion(version);

    const mainTopicElement = rootElem.firstElementChild;
    if (mainTopicElement) {
      const mainTopic: Node = new Node().loadFromElement(mainTopicElement);
      freemap.setNode(mainTopic);

      const childNodes = Array.from(mainTopicElement.childNodes);
      const childsNodes = childNodes
        .filter((child: ChildNode) => child.nodeType === 1 && (child as Element).tagName === 'node')
        .map((c) => c as Element);

      childsNodes.forEach((child: Element) => {
        const node = this.domToNode(child);
        if (node) {
          mainTopic.setArrowlinkOrCloudOrEdge(node);
        }
      });
    }
    return freemap;
  }

  private filterNodes(child: ChildNode): Element | null {
    let element: Element | null = null;
    if (child.nodeType === 1) {
      if (
        (child as Element).tagName === 'node' ||
        (child as Element).tagName === 'richcontent' ||
        (child as Element).tagName === 'font' ||
        (child as Element).tagName === 'edge' ||
        (child as Element).tagName === 'arrowlink' ||
        (child as Element).tagName === 'clud' ||
        (child as Element).tagName === 'icon'
      ) {
        element = child as Element;
      }
    }

    return element;
  }

  private domToNode(nodeElem: Element): Choise | null {
    let node: Choise | null = null;

    if (nodeElem.tagName === 'node') {
      node = new Node().loadFromElement(nodeElem);

      if (nodeElem.childNodes.length > 0) {
        const childNodes = Array.from(nodeElem.childNodes);
        const childsNodes = childNodes
          .filter((child: ChildNode) => this.filterNodes(child))
          .map((c) => c as Element);

        childsNodes.forEach((child) => {
          const childNode = this.domToNode(child);
          if (node instanceof Node && childNode) {
            node.setArrowlinkOrCloudOrEdge(childNode);
          }
        });
      }
    }

    if (nodeElem.tagName === 'font') {
      node = new Font();

      const nameAttr = nodeElem.getAttribute('NAME');
      if (nameAttr) {
        node.setName(nameAttr);
      }

      const boldAttr = nodeElem.getAttribute('BOLD');
      if (boldAttr) {
        node.setBold(boldAttr);
      }
      const italicAttr = nodeElem.getAttribute('ITALIC');
      if (italicAttr) {
        node.setItalic(italicAttr);
      }
      const sizeAttr = nodeElem.getAttribute('SIZE');
      if (sizeAttr) {
        node.setSize(sizeAttr);
      }
    }

    if (nodeElem.tagName === 'edge') {
      node = new Edge();
      const colorAttr = nodeElem.getAttribute('COLOR');
      if (colorAttr) {
        node.setColor(colorAttr);
      }
      const styleAttr = nodeElem.getAttribute('STYLE');
      if (styleAttr) {
        node.setStyle(styleAttr);
      }
      const widthAttr = nodeElem.getAttribute('WIDTH');
      if (widthAttr) {
        node.setWidth(widthAttr);
      }
    }

    if (nodeElem.tagName === 'arrowlink') {
      node = new Arrowlink();
      const colorAttr = nodeElem.getAttribute('COLOR');
      if (colorAttr) {
        node.setColor(colorAttr);
      }
      const destAttr = nodeElem.getAttribute('DESTINATION');
      if (destAttr) {
        node.setDestination(destAttr);
      }
      const endAttr = nodeElem.getAttribute('ENDARROW');
      if (endAttr) {
        node.setEndarrow(endAttr);
      }
      const endIncAttr = nodeElem.getAttribute('ENDINCLINATION');
      if (endIncAttr) {
        node.setEndinclination(endIncAttr);
      }
      const idAttr = nodeElem.getAttribute('ID');
      if (idAttr) {
        node.setId(idAttr);
      }
      const starAttr = nodeElem.getAttribute('STARTARROW');
      if (starAttr) {
        node.setStartarrow(starAttr);
      }
      const startIncAttr = nodeElem.getAttribute('STARTINCLINATION');
      if (startIncAttr) {
        node.setStartinclination(startIncAttr);
      }
    }

    if (nodeElem.tagName === 'cloud') {
      node = new Cloud();
      const colorAttr = nodeElem.getAttribute('COLOR');
      if (colorAttr) {
        node.setColor(colorAttr);
      }
    }

    if (nodeElem.tagName === 'icon') {
      node = new Icon();
      const bultInAttr = nodeElem.getAttribute('BUILTIN');
      if (bultInAttr) {
        node.setBuiltin(bultInAttr);
      }
    }

    if (nodeElem.tagName === 'richcontent') {
      node = new Richcontent();

      const typeAttr = nodeElem.getAttribute('TYPE');
      if (typeAttr) {
        node.setType(typeAttr);
      }
      if (nodeElem.firstChild && nodeElem.getElementsByTagName('html')) {
        const content = nodeElem.getElementsByTagName('html');
        const html = content[0] ? content[0].outerHTML : '';
        node.setHtml(html);
      }
    }

    return node;
  }

  private nodeToXml(childNode: Choise, parentNode: HTMLElement, document: Document): HTMLElement {
    if (childNode instanceof Node) {
      childNode.setCentralTopic(false);
      const childNodeXml = childNode.toXml(document);
      parentNode.appendChild(childNodeXml);

      const childrens = childNode.getArrowlinkOrCloudOrEdge();
      if (childrens.length > 0) {
        childrens.forEach((node: Choise) => {
          const nodeXml = this.nodeToXml(node, childNodeXml, document);
          childNodeXml.appendChild(nodeXml);
        });
      }

      return childNodeXml;
    }

    if (childNode instanceof Font) {
      const childNodeXml = childNode.toXml(document);
      parentNode.appendChild(childNodeXml);

      return childNodeXml;
    }

    if (childNode instanceof Edge) {
      const childNodeXml = childNode.toXml(document);
      parentNode.appendChild(childNodeXml);

      return childNodeXml;
    }

    if (childNode instanceof Arrowlink) {
      const childNodeXml = childNode.toXml(document);
      parentNode.appendChild(childNodeXml);

      return childNodeXml;
    }

    if (childNode instanceof Cloud) {
      const childNodeXml = childNode.toXml(document);
      parentNode.appendChild(childNodeXml);

      return childNodeXml;
    }

    if (childNode instanceof Icon) {
      const childNodeXml = childNode.toXml(document);
      parentNode.appendChild(childNodeXml);

      return childNodeXml;
    }

    if (childNode instanceof Richcontent) {
      const childNodeXml = childNode.toXml(document);
      parentNode.appendChild(childNodeXml);

      return childNodeXml;
    }

    return parentNode;
  }
}
