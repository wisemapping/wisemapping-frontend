import { createDocument } from '@wisemapping/core-js';
import Arrowlink from './Arrowlink';
import Cloud from './Cloud';
import Edge from './Edge';
import Font from './Font';
import Icon from './Icon';
import Node, { Choise } from './Node';
import Richcontent from './Richcontent';

export default class Map {
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
