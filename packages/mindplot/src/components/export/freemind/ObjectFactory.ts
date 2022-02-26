import Arrowlink from './Arrowlink';
import Cloud from './Cloud';
import Edge from './Edge';
import Font from './Font';
import Hook from './Hook';
import Icon from './Icon';
import Richcontent from './Richcontent';
import Map from './Map';
import Node from './Node';

export default class ObjectFactory {
  public createParameters(): void {
    console.log('parameters');
  }

  public crateArrowlink(): Arrowlink {
    return new Arrowlink();
  }

  public createCloud(): Cloud {
    return new Cloud();
  }

  public createEdge(): Edge {
    return new Edge();
  }

  public createFont(): Font {
    return new Font();
  }

  public createHook(): Hook {
    return new Hook();
  }

  public createIcon(): Icon {
    return new Icon();
  }

  public createRichcontent(): Richcontent {
    return new Richcontent();
  }

  public createMap(): Map {
    return new Map();
  }

  public createNode(): Node {
    return new Node();
  }
}
