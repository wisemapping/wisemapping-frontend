const acitonDispatcher = require('./ActionDispatcher').default;
const actionIcon = require('./ActionIcon').default;
const centralTopic = require('./CentralTopic').default;
const command = require('./Command').default;
const connectionLine = require('./ConnectionLine').default;
const controlPoint = require('./ControlPoint').default;
const designer = require('./Designer').default;
const designerAcitonRun = require('./DesignerActionRunner').default;
const designerKeyboard = require('./DesignerKeyboard').default;
const desginerModel = require('./DesignerModel').default;
const desginerUndoManager = require('./DesignerUndoManager').default;
const dragConnector = require('./DragConnector').default;
const dragManager = require('./DragManager').default;
const dragPivot = require('./DragPivot').default;
const dragTopic = require('./DragTopic').default;
const editorOptions = require('./EditorOptions').default;
const editorProperties = require('./EditorProperties').default;
const events = require('./Events').default;
const footer = require('./footer');
//const header =require('./header');
const icon = require('./Icon').default;
const iconGroup = require('./IconGroup').default;
const imageIcon = require('./ImageIcon').default;
const keyboard = require('./Keyboard').default;
const linkIcon = require('./LinkIcon').default;
const localStorageManager = require('./LocalStorageManager').default;
const mainTopic = require('./MainTopic').default;
const messages = require('./Messages').default;
const messageBundle_ca = require('./MessageBundle_ca').default;
const messageBundle_de = require('./MessageBundle_de').default;
const messageBundle_en = require('./MessageBundle_en').default;
const messageBundle_es = require('./MessageBundle_es').default;
const messageBundle_fr = require('./MessageBundle_fr').default;
const messageBundle_pt_BR = require('./MessageBundle_pt_BR').default;
const messageBundle_zh_CN = require('./MessageBundle_zh_CN').default;
const messageBundle_zh_TW = require('./MessageBundle_zh_TW').default;
const multilineTextEditor = require('./MultilineTextEditor').default;
const nodeGraph = require('./NodeGraph').default;
const noteIcon = require('./NoteIcon').default;
const options = require('./Options').default;
const persistenceManger = require('./PersistenceManager').default;
const relationship = require('./Relationship').default;
const relationshipPivot = require('./RelationshipPivot').default;
const restPersistenceManager = require('./RestPersistenceManager').default;
const screenManager = require('./ScreenManager').default;
const shrinkConnector = require('./ShrinkConnector').default;
const standaloneActionDispatcher = require('./StandaloneActionDispatcher').default;
const textEditor = require('./TextEditor').default;
//const textEditorFacotry = require('./TextEditorFactory').default;
const topic = require('./Topic').default;
const topicEventDispatcher = require('./TopicEventDispatcher').default;
const topicFeature = require('./TopicFeature').default;
const topicStyle = require('./TopicStyle').default;
const workspace = require('./Workspace').default;

export const Components = {
    ActionDispatcher: acitonDispatcher,
    ActionIcon: actionIcon,
    CentralTopic: centralTopic,
    Command: command,
    ConnectionLine: connectionLine,
    ControlPoint: controlPoint,
    Designer: designer,
    DesignerActionRunner: designerAcitonRun,
    DesignerKeyboard: designerKeyboard,
    DesignerModel: desginerModel,
    DesignerUndoManager: desginerUndoManager,
    DragConnector: dragConnector,
    DragManager: dragManager,
    DragPivot: dragPivot,
    DragTopic: dragTopic,
    EditorOptions: editorOptions,
    EditorProperties: editorProperties,
    Events: events,
    Icon: icon,
    IconGroup: iconGroup,
    ImageIcon: imageIcon,
    Keyboard: keyboard,
    LinkIcon: linkIcon,
    LocalStorageManager: localStorageManager,
    MainTopic: mainTopic,
    MessageBundle_ca: messageBundle_ca,
    MessageBundle_de: messageBundle_de,
    MessageBundle_en: messageBundle_en,
    MessageBundle_es: messageBundle_es,
    MesasgeBundle_fr: messageBundle_fr,
    MessageBundle_pt_BR: messageBundle_pt_BR,
    MessageBundle_zh_CN: messageBundle_zh_CN,
    MessageBundle_zh_TW: messageBundle_zh_TW,
    Messages: messages,
    MultilineTextEditor: multilineTextEditor,
    NodeGraph: nodeGraph,
    NoteIcon: noteIcon,
    Options: options,
    PersistenceManager: persistenceManger,
    Relationship: relationship,
    RelationshipPivot: relationshipPivot,
    RestPersistenceManager: restPersistenceManager,
    ScreenManager: screenManager,
    StandaloneActionDispatcher: standaloneActionDispatcher,
    TextEditor: textEditor,
    //TextEditorFactory: textEditorFacotry,
    Topic: topic,
    TopicEventDispatcher: topicEventDispatcher,
    TopicFeature: topicFeature,
    TopicStyle: topicStyle,
    Workspace: workspace,
};
