import { createDocument, $assert } from '@wisemapping/core-js';
import Arrowlink from './Arrowlink';
import Cloud from './Cloud';
import Edge from './Edge';
import Font from './Font';
import Icon from './Icon';
import Node, { Choise } from './Node';
import Richcontent from './Richcontent';

export default class Freemap {
  protected node: Node;

  protected version: string;

  getNode(): Node {
    return this.node;
  }

  getVersion(): string {
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
    const mainNode: Node = this.node;
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
    $assert(
      rootElem.getAttribute('version') !== null,
      'Freemind version not found',
    );

    // Start the loading process...
    const version = rootElem.getAttribute('version') || '1.0.1';
    const freemap: Freemap = new Freemap();
    freemap.setVesion(version);

    const mainTopicElement = rootElem.firstElementChild;
    const mainTopic: Node = new Node().loadFromElement(mainTopicElement);
    freemap.setNode(mainTopic);

    const childNodes = Array.from(mainTopicElement.childNodes);
    const childsNodes = childNodes
      .filter(
        (child: ChildNode) => child.nodeType === 1 && (child as Element).tagName === 'node',
      )
      .map((c) => c as Element);

    childsNodes.forEach((child: Element) => {
      const node = this.domToNode(child);
      mainTopic.setArrowlinkOrCloudOrEdge(node);
    });

    return freemap;
  }

  private filterNodes(child: ChildNode): Element {
    let element: Element;
    if (child.nodeType === 1) {
      if (
        (child as Element).tagName === 'node'
        || (child as Element).tagName === 'richcontent'
        || (child as Element).tagName === 'font'
        || (child as Element).tagName === 'edge'
        || (child as Element).tagName === 'arrowlink'
        || (child as Element).tagName === 'clud'
        || (child as Element).tagName === 'icon'
      ) element = child as Element;
    }

    return element;
  }

  private domToNode(nodeElem: Element): Choise {
    let node: Choise;

    if (nodeElem.tagName === 'node') {
      node = new Node().loadFromElement(nodeElem);

      if (nodeElem.childNodes.length > 0) {
        const childNodes = Array.from(nodeElem.childNodes);
        const childsNodes = childNodes
          .filter((child: ChildNode) => this.filterNodes(child))
          .map((c) => c as Element);

        childsNodes.forEach((child) => {
          const childNode = this.domToNode(child);
          if (node instanceof Node) node.setArrowlinkOrCloudOrEdge(childNode);
        });
      }
    }

    if (nodeElem.tagName === 'font') {
      node = new Font();
      if (nodeElem.getAttribute('NAME')) node.setName(nodeElem.getAttribute('NAME'));
      if (nodeElem.getAttribute('BOLD')) node.setBold(nodeElem.getAttribute('BOLD'));
      if (nodeElem.getAttribute('ITALIC')) node.setItalic(nodeElem.getAttribute('ITALIC'));
      if (nodeElem.getAttribute('SIZE')) node.setSize(nodeElem.getAttribute('SIZE'));
    }

    if (nodeElem.tagName === 'edge') {
      node = new Edge();
      if (nodeElem.getAttribute('COLOR')) node.setColor(nodeElem.getAttribute('COLOR'));
      if (nodeElem.getAttribute('STYLE')) node.setStyle(nodeElem.getAttribute('STYLE'));
      if (nodeElem.getAttribute('WIDTH')) node.setWidth(nodeElem.getAttribute('WIDTH'));
    }

    if (nodeElem.tagName === 'arrowlink') {
      node = new Arrowlink();
      if (nodeElem.getAttribute('COLOR')) node.setColor(nodeElem.getAttribute('COLOR'));
      if (nodeElem.getAttribute('DESTINATION')) node.setDestination(nodeElem.getAttribute('DESTINATION'));
      if (nodeElem.getAttribute('ENDARROW')) node.setEndarrow(nodeElem.getAttribute('ENDARROW'));
      if (nodeElem.getAttribute('ENDINCLINATION')) node.setEndinclination(nodeElem.getAttribute('ENDINCLINATION'));
      if (nodeElem.getAttribute('ID')) node.setId(nodeElem.getAttribute('ID'));
      if (nodeElem.getAttribute('STARTARROW')) node.setStartarrow(nodeElem.getAttribute('STARTARROW'));
      if (nodeElem.getAttribute('STARTINCLINATION')) node.setStartinclination(nodeElem.getAttribute('STARTINCLINATION'));
    }

    if (nodeElem.tagName === 'cloud') {
      node = new Cloud();
      if (nodeElem.getAttribute('COLOR')) node.setColor(nodeElem.getAttribute('COLOR'));
    }

    if (nodeElem.tagName === 'icon') {
      node = new Icon();
      if (nodeElem.getAttribute('BUILTIN')) node.setBuiltin(nodeElem.getAttribute('BUILTIN'));
    }

    if (nodeElem.tagName === 'richcontent') {
      node = new Richcontent();

      if (nodeElem.getAttribute('TYPE')) node.setType(nodeElem.getAttribute('TYPE'));
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
