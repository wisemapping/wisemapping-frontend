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
      `This seem not to be a map document. Found tag: ${rootElem.tagName}`,
    );

    // Start the loading process...
    const version = rootElem.getAttribute('version') || '1.0.1';
    const freemap: Freemap = new Freemap();
    freemap.setVesion(version);

    const mainTopicElement = rootElem.firstElementChild;
    const mainTopic: Node = this.domToNode(mainTopicElement) as Node;
    freemap.setNode(mainTopic);

    // Add all the topics nodes...
    const childNodes = Array.from(mainTopicElement.childNodes);
    const topicsNodes = childNodes
      .filter(
        (child: ChildNode) => child.nodeType === 1 && (child as Element).tagName === 'node',
      )
      .map((c) => c as Element);

    topicsNodes.forEach((child) => {
      const childNode = this.domToNode(child);
      mainTopic.setArrowlinkOrCloudOrEdge(childNode);
    });

    return freemap;
  }

  private domToNode(nodeElem: Element): Choise {
    if (nodeElem.tagName === 'node') {
      const node: Node = new Node().loadFromElement(nodeElem);

      if (nodeElem.childNodes.length > 0) {
        const childElement = Array.from(nodeElem.childNodes)
          .filter(
            (child: ChildNode) => child.nodeType === 1 && (child as Element).tagName === 'node',
          )
          .map((c) => c as Element);

        childElement.forEach((child) => {
          const childNode = new Node().loadFromElement(child);
          node.setArrowlinkOrCloudOrEdge(childNode);
        });
      }

      return node;
    }

    if (nodeElem.tagName === 'font') {
      const font: Font = new Font();
      if (nodeElem.getAttribute('NAME')) font.setName(nodeElem.getAttribute('NAME'));
      if (nodeElem.getAttribute('BOLD')) font.setBold(nodeElem.getAttribute('BOLD'));
      if (nodeElem.getAttribute('ITALIC')) font.setItalic(nodeElem.getAttribute('ITALIC'));
      if (nodeElem.getAttribute('SIZE')) font.setSize(nodeElem.getAttribute('SIZE'));

      return font;
    }

    if (nodeElem.tagName === 'edge') {
      const edge = new Edge();
      if (nodeElem.getAttribute('COLOR')) edge.setColor(nodeElem.getAttribute('COLOR'));
      if (nodeElem.getAttribute('STYLE')) edge.setStyle(nodeElem.getAttribute('STYLE'));
      if (nodeElem.getAttribute('WIDTH')) edge.setWidth(nodeElem.getAttribute('WIDTH'));

      return edge;
    }

    if (nodeElem.tagName === 'arrowlink') {
      const arrowlink = new Arrowlink();
      if (nodeElem.getAttribute('COLOR')) arrowlink.setColor(nodeElem.getAttribute('COLOR'));
      if (nodeElem.getAttribute('DESTINATION')) arrowlink.setDestination(nodeElem.getAttribute('DESTINATION'));
      if (nodeElem.getAttribute('ENDARROW')) arrowlink.setEndarrow(nodeElem.getAttribute('ENDARROW'));
      if (nodeElem.getAttribute('ENDINCLINATION')) arrowlink.setEndinclination(nodeElem.getAttribute('ENDINCLINATION'));
      if (nodeElem.getAttribute('ID')) arrowlink.setId(nodeElem.getAttribute('ID'));
      if (nodeElem.getAttribute('STARTARROW')) arrowlink.setStartarrow(nodeElem.getAttribute('STARTARROW'));
      if (nodeElem.getAttribute('STARTINCLINATION')) arrowlink.setStartinclination(nodeElem.getAttribute('STARTINCLINATION'));

      return arrowlink;
    }

    if (nodeElem.tagName === 'cloud') {
      const cloud = new Cloud();
      if (nodeElem.getAttribute('COLOR')) cloud.setColor(nodeElem.getAttribute('COLOR'));
    }

    if (nodeElem.tagName === 'icon') {
      const icon = new Icon();
      if (nodeElem.getAttribute('BUILTIN')) icon.setBuiltin(nodeElem.getAttribute('BUILTIN'));
    }

    if (nodeElem.tagName === 'richcontent') {
      const richcontent = new Richcontent();

      if (nodeElem.getAttribute('TYPE')) richcontent.setType(nodeElem.getAttribute('TYPE'));
      if (nodeElem.lastElementChild) richcontent.setHtml(String(nodeElem.lastElementChild));
    }

    const nodeDefault = new Node();
    return nodeDefault;
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
