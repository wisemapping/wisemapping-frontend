/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

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
  TAB_TO_CREATE_CHILD: string;
  ENTER_TO_CREATE_SIBLING: string;
  PLUS_TOOLTIP_CREATE_CHILD: string;
  PLUS_TOOLTIP_CREATE_SIBLING: string;
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
  TAB_TO_CREATE_CHILD: 'to create child',
  ENTER_TO_CREATE_SIBLING: 'to create sibling',
  PLUS_TOOLTIP_CREATE_CHILD: 'Create child topic',
  PLUS_TOOLTIP_CREATE_SIBLING: 'Create sibling topic',
};

export default EN;
