import { $assert } from '@wisemapping/core-js';

import CentralTopic from './CentralTopic';
import MainTopic from './MainTopic';
import NodeModel from './model/NodeModel';
import { NodeOption } from './NodeGraph';
import Topic from './Topic';

class TopicFactory {
  static create(nodeModel: NodeModel, options: NodeOption): Topic {
    $assert(nodeModel, 'Model can not be null');

    const type = nodeModel.getType();
    $assert(type, 'Node model type can not be null');

    let result: Topic;
    if (type === 'CentralTopic') {
      result = new CentralTopic(nodeModel, options);
    } else if (type === 'MainTopic') {
      result = new MainTopic(nodeModel, options);
    } else {
      $assert(false, `unsupported node type:${type}`);
    }
    return result!;
  }
}

export default TopicFactory;
