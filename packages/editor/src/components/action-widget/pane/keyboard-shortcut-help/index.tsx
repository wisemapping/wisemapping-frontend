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
import React, { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { ShortcutsContainer } from './styled';

const KeyboardShorcutsHelp = (): ReactElement => {
  return (
    <ShortcutsContainer>
      <table>
        <colgroup>
          <col width="40%" />
          <col width="30%" />
          <col width="30%" />
        </colgroup>
        <thead>
          <tr>
            <th>
              <FormattedMessage id="shortcut-help-pane.action" defaultMessage="Action" />
            </th>
            <th>Windows - Linux</th>
            <th>Mac OS X</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.save-changes"
                defaultMessage="Save changes"
              />
            </td>
            <td>Ctrl + S</td>
            <td>⌘ + S</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.add-sibling"
                defaultMessage="Add sibling topic"
              />
            </td>
            <td>Enter</td>
            <td>Enter</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.add-child"
                defaultMessage="Add child topic"
              />
            </td>
            <td>Insert / Tab</td>
            <td>⌘ + Enter / Tab</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.delete-topic"
                defaultMessage="Delete topic"
              />
            </td>
            <td>Delete</td>
            <td>Delete</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.edit-topic"
                defaultMessage="Edit topic text"
              />
            </td>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.edit-topic-key"
                defaultMessage="F2 or Double Click"
              />
            </td>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.edit-topic-key"
                defaultMessage="F2 or Double Click"
              />
            </td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.overwrite-edit-topic"
                defaultMessage="Overwrite topic text"
              />
            </td>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.overwrite-edit-topic-key"
                defaultMessage="Type on a selected topic"
              />
            </td>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.overwrite-edit-topic-key"
                defaultMessage="Type on a selected topic"
              />
            </td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.edit-multiline"
                defaultMessage="Add multi-line topic text"
              />
            </td>
            <td>Ctrl + Enter</td>
            <td>⌘ + Enter</td>
          </tr>

          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.copy-and-text"
                defaultMessage="Copy and paste topics/Copy mindmap image to clipboard."
              />
            </td>
            <td>Ctrl + C / Ctrl + V</td>
            <td>⌘ + C / ⌘ + V</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.drag-disconnect"
                defaultMessage="Disconnect topic"
              />
            </td>
            <td>Ctrl + drag topic</td>
            <td>⌘ + drag topic</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.collapse-children"
                defaultMessage="Collpase children"
              />
            </td>
            <td>Spacebar</td>
            <td>Spacebar</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage id="shortcut-help-pane.navigation" defaultMessage="Navigation" />
            </td>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.navigation-keys"
                defaultMessage="Arrow keys"
              />
            </td>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.navigation-keys"
                defaultMessage="Arrow keys"
              />
            </td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.select-topics"
                defaultMessage="Select multiple topics"
              />
            </td>
            <td>
              Ctrl +{' '}
              <FormattedMessage
                id="shortcut-help-pane.select-topics-keys"
                defaultMessage="Mouse click"
              />
            </td>
            <td>
              Ctrl +{' '}
              <FormattedMessage
                id="shortcut-help-pane.select-topics-keys"
                defaultMessage="Mouse click"
              />
            </td>
          </tr>
          <tr>
            <td>
              <FormattedMessage id="shortcut-help-pane.undo" defaultMessage="Undo edition" />
            </td>
            <td>Ctrl + Z</td>
            <td>⌘ + Z</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage id="shortcut-help-pane.redo" defaultMessage="Redo edition" />
            </td>
            <td>Ctrl + Shift + Z</td>
            <td>⌘ + Shift + Z</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.select-all-topics"
                defaultMessage="Select all topics"
              />
            </td>
            <td>Ctrl + A</td>
            <td>⌘ + A</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.deselect-all-topics"
                defaultMessage="Deselect all topics"
              />
            </td>
            <td>Ctrl + Shift + A</td>
            <td>⌘ + Shift + A</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.cancel-text-changes"
                defaultMessage="Cancel text changes"
              />
            </td>
            <td>Esc</td>
            <td>Esc</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.change-font-italic"
                defaultMessage="Change text to italic"
              />
            </td>
            <td>Ctrl + I</td>
            <td>⌘ + I</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage
                id="shortcut-help-pane.change-font-bold"
                defaultMessage="Change text to bold"
              />
            </td>
            <td>Ctrl + B</td>
            <td>⌘ + B</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage id="shortcut-help-pane.add-note" defaultMessage="Add note" />
            </td>
            <td>Ctrl + K</td>
            <td>⌘ + K</td>
          </tr>
          <tr>
            <td>
              <FormattedMessage id="shortcut-help-pane.add-link" defaultMessage="Add link" />
            </td>
            <td>Ctrl + L</td>
            <td>⌘ + L</td>
          </tr>
        </tbody>
      </table>
    </ShortcutsContainer>
  );
};
export default KeyboardShorcutsHelp;
