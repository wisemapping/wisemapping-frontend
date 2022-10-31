/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import KeyboardOutlined from '@mui/icons-material/KeyboardOutlined';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useIntl } from 'react-intl';
import ActionConfig from '../../classes/action/action-config';
import Capability from '../../classes/action/capability';
import Editor from '../../classes/model/editor';
import Model from '../../classes/model/editor';
import KeyboardShorcutsHelp from '../action-widget/pane/keyboard-shortcut-help';
import Toolbar from '../toolbar';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import Box from '@mui/material/Box';

export function buildZoomToolbarConfig(model: Editor, capability: Capability): ActionConfig[] {
  const intl = useIntl();

  return [
    {
      icon: <CenterFocusStrongOutlinedIcon />,
      tooltip: intl.formatMessage({
        id: 'zoom-panel.tooltip-zoom-to-fit',
        defaultMessage: 'Zoom to Fit',
      }),
      onClick: () => {
        model.getDesigner().zoomToFit();
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      // zoom value candidate, neds to fixit
      render: () => (
        <Box sx={{ p: 0.5 }}>
          <Typography variant="overline" color="gray">
            %
            {!model?.isMapLoadded()
              ? 100
              : Math.floor((1 / model.getDesigner().getWorkSpace()?.getZoom()) * 100)}
          </Typography>
        </Box>
      ),
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <ZoomInOutlinedIcon />,
      tooltip: intl.formatMessage({ id: 'zoom-panel.tooltip-zoom-in', defaultMessage: 'Zoom In' }),
      onClick: () => {
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
        model.getDesigner().zoomOut();
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
      options: [
        {
          render: () => <KeyboardShorcutsHelp />,
        },
      ],
    },
  ];
}

type ZoomPanelProps = {
  model: Model | undefined;
  capability: Capability;
};

const ZoomPanel = ({ model, capability }: ZoomPanelProps) => {
  const config = buildZoomToolbarConfig(model, capability);
  return (
    <Toolbar
      configurations={config}
      position={{
        position: {
          right: '7px',
          top: '93%',
        },
        vertical: false,
      }}
    />
  );
};
export default ZoomPanel;
