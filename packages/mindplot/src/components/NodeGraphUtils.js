import { $assert } from '@wisemapping/core-js';

import CentralTopic from './CentralTopic';
import MainTopic from './MainTopic';
import INodeModel from './model/INodeModel';

/**
 * creates a new topic from the given node model
 * @memberof mindplot.Nodegraph
 * @param {mindplot.model.NodeModel} nodeModel
 * @param {Object} options
 * @throws will throw an error if nodeModel is null or undefined
 * @throws will throw an error if the nodeModel's type is null or undefined
 * @throws will throw an error if the node type cannot be recognized as either central or main
 * topic type
 * @return {mindplot.CentralTopic|mindplot.MainTopic} the new topic
 */
export const create = (nodeModel, options) => {
  $assert(nodeModel, 'Model can not be null');

  const type = nodeModel.getType();
  $assert(type, 'Node model type can not be null');

  let result;
  if (type === 'CentralTopic') {
    result = new CentralTopic(nodeModel, options);
  } else if (type === 'MainTopic') {
    result = new MainTopic(nodeModel, options);
  } else {
    $assert(false, `unsupported node type:${type}`);
  }

  return result;
};

export default {
  create,
};
