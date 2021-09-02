import LocalStorageManager from './LocalStorageManager';

const actionDispatcher = require('./ActionDispatcher').default;
const actionIcon = require('./ActionIcon').default;
const centralTopic = require('./CentralTopic').default;
const command = require('./Command').default;
const connectionLine = require('./ConnectionLine').default;
const controlPoint = require('./ControlPoint').default;
const designer = require('./Designer').default;
const designerActionRunner = require('./DesignerActionRunner').default;
const designerKeyboard = require('./DesignerKeyboard').default;
const designerModal = require('./DesignerModel').default;
const designerUndoManager = require('./DesignerUndoManager').default;
const dragConnector = require('./DragConnector').default;
const dragManager = require('./DragManager').default;
const dragPivot = require('./DragPivot').default;
const dragTopic = require('./DragTopic').default;
const editorOptions = require('./EditorOptions').default;
const editorProperties = require('./EditorProperties').default;
const events = require('./Events').default;
const footer = require('./footer');
const header = require('./header');
const icon = require('./Icon').default;
const iconGroup = require('./IconGroup').default;
const imageIcon = require('./ImageIcon').default;
const keyboard = require('./Keyboard').default;
const linkIcon = require('./LinkIcon').default;
const localSorageManager = require('./LocalStorageManager').default;
const mainTopic = require('./MainTopic').default;
const messages = require('./Messages').default;
const multilineTextEditor = require('./MultilineTextEditor').default;
const nodeGraph = require('./NodeGraph').default;
const noteIcon = require('./NoteIcon').default;
const options = require('./Options').default;
const persistenceManager = require('./PersistenceManager').default;
const relationship = require('./Relationship').default;
const relationshipPivot = require('./RelationshipPivot').default;
const resetPersistenceManager = require('./RestPersistenceManager').default;
const screenManager = require('./ScreenManager').default;
const shrinkConnector = require('./ShrinkConnector').default;
const standaloneActionDispatcher = require('./StandaloneActionDispatcher').default;
const textEditor = require('./TextEditor').default;
const textEditorFactory = require('./TextEditorFactory').default;
const topic = require('./Topic').default;
const topicEventDispatcher = require('./TopicEventDispatcher').default;
const topicFeature = require('./TopicFeature').default;
const topicStyle = require('./TopicStyle').default;
const workspace = require('./Workspace').default;

export const Components = {
    ActionDispatcher: actionDispatcher,
    ActionIcon: actionIcon,
    CentralTopic: centralTopic,
    Command: command,
    ConnectionLine: connectionLine,
    ControlPoint: controlPoint,
    Designer: designer,
    DesignerActionRunner: designerActionRunner,
    DesignerKeyboard: designerKeyboard,
    DesignerModel: designerModal,
    DesignerUndoManager: designerUndoManager,
    DragConnector: dragConnector,
    DragManager: dragManager,
    DragPivot: dragPivot,
    DragTopic: dragTopic,
    EditorOptions: editorOptions,
    EditorProperties: editorProperties,
    Events: events,
    footer: footer,
    header: header,
    Icon: icon,
    IconGroup: iconGroup,
    ImageIcon: imageIcon,
    Keyboard: keyboard,
    LinkIcon: linkIcon,

    localSorageManager: localSorageManager,
    MainTopic: mainTopic,
    Messages: messages,
    MultilineTextEditor: multilineTextEditor,
    NodeGraph: nodeGraph,
    NoteIcon: noteIcon,
    Options: options,
    PersistenceManager: persistenceManager,
    Relationship: relationship,
    RelationshipPivot: relationshipPivot,
    RestPersistenceManager: resetPersistenceManager,
    ScreenManager: screenManager,
    ShrinkConnector: shrinkConnector,
    StandaloneActionDispatcher: standaloneActionDispatcher,
    TextEditor: textEditor,
    TextEditorFactory: textEditorFactory,
    Topic: topic,
    TopicEventDispatcher: topicEventDispatcher,
    TopicFeature: topicFeature,
    TopicStyle: topicStyle,
    Workspace: workspace,
};
