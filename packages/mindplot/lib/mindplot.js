'use strict';
module.exports = mindplot; //eslint-disable-line

function mindplot() {
    // Commands
    const addFeatureToTopicCommand = require('./components/commands/AddFeatureToTopicCommand')
        .default;
    const addRelationshipCommand = require('./components/commands/AddRelationshipCommand').default;
    const addTopicCommand = require('./components/commands/AddTopicCommand').default;
    const changeFeatureToTopicCommand = require('./components/commands/ChangeFeatureToTopicCommand')
        .default;
    const deleteCommand = require('./components/commands/DeleteCommand').default;
    const dragTopicCommand = require('./components/commands/DragTopicCommand').default;
    const genericFunctionCommand = require('./components/commands/GenericFunctionCommand').default;
    const moveControlPointCommand = require('./components/commands/MoveControlPointCommand')
        .default;
    const removeFeatureFromTopicCommand = require('./components/commands/RemoveFeatureFromTopicCommand')
        .default;

    // Layout
    const abstractBasicSorter = require('./components/layout/AbstractBasicSorter').default;
    const balancedSorter = require('./components/layout/BalancedSorter').default;
    const changeEvent = require('./components/layout/ChangeEvent').default;
    const childrenSorterStrategy = require('./components/layout/ChildrenSorterStrategy').default;
    const eventBus = require('./components/layout/EventBus').default;
    const eventBusDispatcher = require('./components/layout/EventBusDispatcher').default;
    const gridSorter = require('./components/layout/GridSorter').default;
    const layoutManager = require('./components/layout/LayoutManager').default;
    const node = require('./components/layout/Node').default;
    const originalLayout = require('./components/layout/OriginalLayout').default;
    const rootedTreeSet = require('./components/layout/RootedTreeSet').default;
    const symmetricSorter = require('./components/layout/SymmetricSorter').default;

    return {
        Commands: {
            AddFeatureToTopicCommand: addFeatureToTopicCommand,
            AddRelationshipCommand: addRelationshipCommand,
            AddTopicCommand: addTopicCommand,
            ChangeFeatureToTopicCommand: changeFeatureToTopicCommand,
            DeleteCommand: deleteCommand,
            DragTopicCommand: dragTopicCommand,
            GenericFunctionCommand: genericFunctionCommand,
            MoveControlPointCommand: moveControlPointCommand,
            RemoveFeatureFromTopicCommand: removeFeatureFromTopicCommand,
        },
        Layout: {
            AbstractBasicSorter: abstractBasicSorter,
            BalancedSorter: balancedSorter,
            ChangeEvent: changeEvent,
            ChildrenSorterStrategy: childrenSorterStrategy,
            EventBus: eventBus,
            EventBusDispatcher: eventBusDispatcher,
            GridSorter: gridSorter,
            LayoutManager: layoutManager,
            Node: node,
            OriginalLayout: originalLayout,
            RootedTreeSet: rootedTreeSet,
            SymmetricSorter: symmetricSorter,
        },
    };
}
