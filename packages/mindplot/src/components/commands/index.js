import addFeatureToTopicCommand from './AddFeatureToTopicCommand';
import addRelationshipCommand from './AddRelationshipCommand';
import addTopicCommand from './AddTopicCommand';
import changeFeatureToTopicCommand from './ChangeFeatureToTopicCommand';
import deleteCommand from './DeleteCommand';
import dragTopicCommand from './DragTopicCommand';
import genericFunctionCommand from './GenericFunctionCommand';
import moveControlPointCommand from './MoveControlPointCommand';
import removeFeatureFromTopicCommand from './RemoveFeatureFromTopicCommand';

export default {
  AddFeatureToTopicCommand: addFeatureToTopicCommand,
  AddRelationshipCommand: addRelationshipCommand,
  AddTopicCommand: addTopicCommand,
  ChangeFeatureToTopicCommand: changeFeatureToTopicCommand,
  DeleteCommand: deleteCommand,
  DragTopicCommand: dragTopicCommand,
  GenericFunctionCommand: genericFunctionCommand,
  MoveControlPointCommand: moveControlPointCommand,
  RemoveFeatureFromTopicCommand: removeFeatureFromTopicCommand,
};
