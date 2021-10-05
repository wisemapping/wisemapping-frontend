const featureModel = require('./FeatureModel').default;
const iconModel = require('./IconModel').default;
const iMindmap = require('./IMindmap').default;
const iNodeModel = require('./INodeModel').default;
const linkModel = require('./LinkModel').default;
const noteModel = require('./NoteModel').default;
const mindmap = require('./Mindmap').default;
const nodeModel = require('./NodeModel').default;
const relationshipModel = require('./RelationshipModel').default;

export const Model = {
  FeatureModel: featureModel,
  IconModel: iconModel,
  IMindmap: iMindmap,
  INodeModel: iNodeModel,
  LinkModel: linkModel,
  NoteModel: noteModel,
  Mindmap: mindmap,
  NodeModel: nodeModel,
  RelationshipModel: relationshipModel,
};
