import actionDispatcher from './ActionDispatcher';
import actionIcon from './ActionIcon';
import centralTopic from './CentralTopic';
import command from './Command';
import connectionLine from './ConnectionLine';
import controlPoint from './ControlPoint';
import designer from './Designer';
import designerActionRunner from './DesignerActionRunner';
import designerKeyboard from './DesignerKeyboard';
import designerModal from './DesignerModel';
import designerUndoManager from './DesignerUndoManager';
import dragConnector from './DragConnector';
import dragManager from './DragManager';
import dragPivot from './DragPivot';
import dragTopic from './DragTopic';
import editorOptions from './EditorOptions';
import editorProperties from './EditorProperties';
import events from './Events';
import footer from './footer';
import header from './header';
import icon from './Icon';
import iconGroup from './IconGroup';
import imageIcon from './ImageIcon';
import keyboard from './Keyboard';
import linkIcon from './LinkIcon';
import localSorageManager from './LocalStorageManager';
import mainTopic from './MainTopic';
import messages from './Messages';
import multilineTextEditor from './MultilineTextEditor';
import nodeGraph from './NodeGraph';
import noteIcon from './NoteIcon';
import options from './Options';
import persistenceManager from './PersistenceManager';
import relationship from './Relationship';
import relationshipPivot from './RelationshipPivot';
import resetPersistenceManager from './RestPersistenceManager';
import screenManager from './ScreenManager';
import shrinkConnector from './ShrinkConnector';
import standaloneActionDispatcher from './StandaloneActionDispatcher';
import textEditor from './TextEditor';
import textEditorFactory from './TextEditorFactory';
import topic from './Topic';
import topicEventDispatcher from './TopicEventDispatcher';
import topicFeature from './TopicFeature';
import topicStyle from './TopicStyle';
import workspace from './Workspace';

export default {
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
  Footer: footer,
  Header: header,
  Icon: icon,
  IconGroup: iconGroup,
  ImageIcon: imageIcon,
  Keyboard: keyboard,
  LinkIcon: linkIcon,
  LocalStorageManager: localSorageManager,
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
