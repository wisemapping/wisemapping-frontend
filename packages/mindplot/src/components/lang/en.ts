interface LanguageStrings {
  [key: string]: string;
  LOADING: string;
  SAVING: string;
  SAVE_COMPLETE: string;
  ZOOM_IN_ERROR: string;
  ZOOM_ERROR: string;
  ONLY_ONE_TOPIC_MUST_BE_SELECTED: string;
  ONE_TOPIC_MUST_BE_SELECTED: string;
  ONLY_ONE_TOPIC_MUST_BE_SELECTED_COLLAPSE: string;
  SAVE_COULD_NOT_BE_COMPLETED: string;
  MAIN_TOPIC: string;
  SUB_TOPIC: string;
  ISOLATED_TOPIC: string;
  CENTRAL_TOPIC: string;
  ENTITIES_COULD_NOT_BE_DELETED: string;
  CLIPBOARD_IS_EMPTY: string;
  CENTRAL_TOPIC_CAN_NOT_BE_DELETED: string;
  RELATIONSHIP_COULD_NOT_BE_CREATED: string;
  SESSION_EXPIRED: string;
  CENTRAL_TOPIC_CONNECTION_STYLE_CAN_NOT_BE_CHANGED: string;
  CENTRAL_TOPIC_STYLE_CAN_NOT_BE_CHANGED: string;
}

const EN: LanguageStrings = {
  LOADING: 'Loading ..',
  SAVING: 'Saving ...',
  SAVE_COMPLETE: 'Save completed',
  ZOOM_IN_ERROR: 'Zoom too high.',
  ZOOM_ERROR: 'No more zoom can be applied.',
  ONLY_ONE_TOPIC_MUST_BE_SELECTED: 'Could not create a topic. Only one topic must be selected.',
  ONE_TOPIC_MUST_BE_SELECTED: 'Could not create a topic. One topic must be selected.',
  ONLY_ONE_TOPIC_MUST_BE_SELECTED_COLLAPSE: 'Children can not be collapsed. One topic must be selected.',
  SAVE_COULD_NOT_BE_COMPLETED: 'Save could not be completed, please try again latter.',
  MAIN_TOPIC: 'Main Topic',
  SUB_TOPIC: 'Sub Topic',
  ISOLATED_TOPIC: 'Isolated Topic',
  CENTRAL_TOPIC: 'Central Topic',
  ENTITIES_COULD_NOT_BE_DELETED: 'Could not delete topic or relation. At least one map entity must be selected.',
  CLIPBOARD_IS_EMPTY: 'Nothing to copy. Clipboard is empty.',
  CENTRAL_TOPIC_CAN_NOT_BE_DELETED: 'Central topic can not be deleted.',
  RELATIONSHIP_COULD_NOT_BE_CREATED: 'Relationship could not be created. A parent relationship topic must be selected first.',
  SESSION_EXPIRED: 'Your session has expired, please log-in again.',
  CENTRAL_TOPIC_CONNECTION_STYLE_CAN_NOT_BE_CHANGED: 'Connection style can not be changed for central topic.',
  CENTRAL_TOPIC_STYLE_CAN_NOT_BE_CHANGED: 'Central topic can not be changed to line style.',
};

export default EN;
