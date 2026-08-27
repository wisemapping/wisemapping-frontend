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
import React from 'react';
import { $msg, $notify, type Designer } from '@wisemapping/mindplot';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import LinkIcon from '@mui/icons-material/Link';
import type { IntlShape } from 'react-intl';
import type Capability from '../../classes/action/capability';
import type ActionConfig from '../../classes/action/action-config';
import type ActionType from '../../classes/action/action-type';

export interface InspectorTopicActionConfig extends ActionConfig {
  id: ActionType | string;
  'aria-label'?: string;
}

export type BuildInspectorTopicActionsOpts = {
  designer: Designer;
  intl: IntlShape;
  getDeepLink?: (nodeId: number) => string;
  capability: Capability;
};

const useSelected =
  (designer: Designer): (() => number | undefined) =>
  () =>
    designer.getModel().selectedTopic()?.getId();

export const buildInspectorTopicActions = ({
  designer,
  intl,
  getDeepLink,
  capability,
}: BuildInspectorTopicActionsOpts): InspectorTopicActionConfig[] => {
  const getSelected = useSelected(designer);
  const isHidden = (id: ActionType): boolean => capability?.isHidden?.(id) ?? false;

  return [
    {
      id: 'paste-as-child',
      'data-testid': 'inspector-paste-as-child',
      icon: <ContentPasteIcon fontSize="small" />,
      tooltip: intl.formatMessage({
        id: 'inspector.paste-as-child',
        defaultMessage: 'Paste as child',
      }),
      ariaLabel: intl.formatMessage({
        id: 'inspector.paste-as-child',
        defaultMessage: 'Paste as child',
      }),
      'aria-label': intl.formatMessage({
        id: 'inspector.paste-as-child',
        defaultMessage: 'Paste as child',
      }),
      visible: !isHidden('paste-as-child'),
      disabled: () => getSelected() === undefined,
      onClick: () => {
        const id = getSelected();
        if (id !== undefined) {
          void designer.pasteClipboardAsChild(id);
        }
      },
    },
    {
      id: 'copy-link-to-node',
      'data-testid': 'inspector-copy-link-to-node',
      icon: <LinkIcon fontSize="small" />,
      tooltip: intl.formatMessage({
        id: 'inspector.copy-link-to-node',
        defaultMessage: 'Copy link to node',
      }),
      ariaLabel: intl.formatMessage({
        id: 'inspector.copy-link-to-node',
        defaultMessage: 'Copy link to node',
      }),
      'aria-label': intl.formatMessage({
        id: 'inspector.copy-link-to-node',
        defaultMessage: 'Copy link to node',
      }),
      visible: !isHidden('copy-link-to-node'),
      disabled: () => getSelected() === undefined || getDeepLink === undefined,
      onClick: () => {
        const id = getSelected();
        if (id === undefined || !getDeepLink) return;
        const url = getDeepLink(id);
        void navigator.clipboard.writeText(url).then(() => {
          $notify($msg('DEEPLINK_COPIED'));
        });
      },
    },
  ];
};
