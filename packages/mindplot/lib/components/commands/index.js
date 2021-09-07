const addFeatureToTopicCommand = require('./AddFeatureToTopicCommand').default;
const addRelationshipCommand = require('./AddRelationshipCommand').default;
const addTopicCommand = require('./AddTopicCommand').default;
const changeFeatureToTopicCommand = require('./ChangeFeatureToTopicCommand').default;
const deleteCommand = require('./DeleteCommand').default;
const dragTopicCommand = require('./DragTopicCommand').default;
const genericFunctionCommand = require('./GenericFunctionCommand').default;
const moveControlPointCommand = require('./MoveControlPointCommand').default;
const removeFeatureFromTopicCommand = require('./RemoveFeatureFromTopicCommand').default;

export const Commands = {
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
