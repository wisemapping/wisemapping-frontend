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
import KeyboardOutlined from '@mui/icons-material/KeyboardOutlined';
import Typography from '@mui/material/Typography';
import React, { ReactElement } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import ActionConfig from '../../classes/action/action-config';
import Capability from '../../classes/action/capability';
import Editor from '../../classes/model/editor';
import Model from '../../classes/model/editor';
import KeyboardShorcutsHelp from '../action-widget/pane/keyboard-shortcut-help';
import OutlineViewDialog from '../action-widget/pane/outline-view-dialog';
import Toolbar from '../toolbar';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import Box from '@mui/material/Box';
import ThemeSwitcher from '../common/theme-switcher';
import { trackEditorInteraction } from '../../utils/analytics';

// Helper function to check if any nodes are currently collapsed
const areNodesCollapsed = (model: Editor): boolean => {
  if (!model?.isMapLoadded()) return false;
  const allTopics = model.getDesigner().getModel().getTopics();
  return allTopics.some(
    (topic) => topic.getType() !== 'CentralTopic' && topic.areChildrenShrunken(),
  );
};

export function buildZoomToolbarConfig(
  model: Editor,
  capability: Capability,
  intl: IntlShape,
): ActionConfig[] {
  return [
    {
      icon: <FormatListBulletedOutlinedIcon />,
      tooltip: intl.formatMessage({
        id: 'zoom-panel.tooltip-outline-view',
        defaultMessage: 'Outline View',
      }),
      onClick: () => trackEditorInteraction('outline_view'),
      options: [
        {
          render: (closeModal) => (
            <OutlineViewDialog
              open={true}
              onClose={closeModal}
              mindmap={model.getDesigner()?.getMindmap()}
            />
          ),
        },
      ],
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <CenterFocusStrongOutlinedIcon />,
      tooltip: intl.formatMessage({
        id: 'zoom-panel.tooltip-zoom-to-fit',
        defaultMessage: 'Zoom to Fit',
      }),
      onClick: () => {
        trackEditorInteraction('zoom_to_fit');
        model.getDesigner().zoomToFit();
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      // zoom value candidate, neds to fixit
      render: () => (
        <Box sx={{ p: 0.5 }}>
          <Typography variant="overline" color="gray">
            {!model?.isMapLoadded()
              ? 100
              : Math.floor((1 / model.getDesigner().getWorkSpace()?.getZoom()) * 100)}
            %
          </Typography>
        </Box>
      ),
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <ZoomInOutlinedIcon />,
      tooltip: intl.formatMessage({ id: 'zoom-panel.tooltip-zoom-in', defaultMessage: 'Zoom In' }),
      onClick: () => {
        trackEditorInteraction('zoom_in');
        model.getDesigner().zoomIn();
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <ZoomOutOutlinedIcon />,
      tooltip: intl.formatMessage({
        id: 'zoom-panel.tooltip-zoom-out',
        defaultMessage: 'Zoom Out',
      }),
      onClick: () => {
        trackEditorInteraction('zoom_out');
        model.getDesigner().zoomOut();
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: areNodesCollapsed(model) ? <UnfoldMoreIcon /> : <UnfoldLessIcon />,
      tooltip: areNodesCollapsed(model)
        ? intl.formatMessage({
            id: 'zoom-panel.tooltip-expand-all',
            defaultMessage: 'Expand All Nodes',
          })
        : intl.formatMessage({
            id: 'zoom-panel.tooltip-collapse-all',
            defaultMessage: 'Collapse All Nodes',
          }),
      onClick: () => {
        if (areNodesCollapsed(model)) {
          trackEditorInteraction('expand_all_nodes');
          model.getDesigner().expandAllNodes();
        } else {
          trackEditorInteraction('collapse_all_nodes');
          model.getDesigner().collapseAllNodes();
        }
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <KeyboardOutlined />,
      tooltip: intl.formatMessage({
        id: 'zoom-panel.tooltip-keyboard',
        defaultMessage: 'Keyboard Shortcuts',
      }),
      visible: !capability.isHidden('keyboard-shortcuts'),
      onClick: () => trackEditorInteraction('keyboard_shortcuts'),
      options: [
        {
          render: (closeModal) => <KeyboardShorcutsHelp closeModal={closeModal} />,
        },
      ],
    },
    {
      render: () => <ThemeSwitcher />,
      visible: true,
    },
  ];
}

type ZoomPanelProps = {
  model: Model;
  capability: Capability;
};

const ZoomPanel = ({ model, capability }: ZoomPanelProps): ReactElement => {
  const intl = useIntl();
  const config = buildZoomToolbarConfig(model, capability, intl);
  return (
    <Toolbar
      configurations={config}
      position={{
        position: {
          right: '7px',
          top: 'calc(100% - 50px)',
        },
        vertical: false,
      }}
    />
  );
};
export default ZoomPanel;
