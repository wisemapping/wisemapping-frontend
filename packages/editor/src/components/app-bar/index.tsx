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
import React from 'react';
import MaterialToolbar from '@mui/material/Toolbar';
import MaterialAppBar from '@mui/material/AppBar';
import { ToolbarMenuItem } from '../toolbar';
import ActionConfig from '../../classes/action/action-config';
import Editor from '../../classes/model/editor';
import Capability from '../../classes/action/capability';
import Tooltip from '@mui/material/Tooltip';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import Typography from '@mui/material/Typography';
import { $msg } from '@wisemapping/mindplot';
import UndoAndRedo from '../action-widget/button/undo-and-redo';
import Button from '@mui/material/Button';
import LogoTextBlackSvg from '../../../images/logo-text-black.svg';
import IconButton from '@mui/material/IconButton';
import { ToolbarActionType } from '../toolbar/ToolbarActionType';

interface AppBarProps {
  model: Editor;
  mapTitle: string;
  capability: Capability;
  onAction?: (type: ToolbarActionType) => void;
  accountConfig?;
}

const AppBar = ({ model, mapTitle, capability, onAction, accountConfig }: AppBarProps) => {
  const appBarDivisor = {
    render: () => <Typography component="div" sx={{ flexGrow: 1 }} />,
  };

  const buildConfig = (
    model: Editor,
    mapTitle: string,
    capability: Capability,
    onAction: (type: ToolbarActionType) => void,
    accountConfig,
  ): ActionConfig[] => {
    return [
      {
        icon: <ArrowBackIosNewOutlinedIcon />,
        tooltip: $msg('BACK_TO_MAP_LIST'),
        onClick: () => history.back(),
      },
      {
        render: () => <img src={LogoTextBlackSvg} />,
      },
      {
        render: () => (
          <Tooltip title={mapTitle}>
            <Typography
              className="truncated"
              variant="body1"
              component="div"
              sx={{ marginX: '1.5rem' }}
            >
              {mapTitle}
            </Typography>
          </Tooltip>
        ),
      },
      null,
      {
        render: () => (
          <UndoAndRedo
            configuration={{
              icon: <UndoOutlinedIcon />,
              tooltip: $msg('UNDO') + ' (' + $msg('CTRL') + ' + Z)',
              onClick: () => designer.undo(),
            }}
            disabledCondition={(event) => event.undoSteps > 0}
          ></UndoAndRedo>
        ),
        visible: !capability.isHidden('undo-changes'),
        disabled: () => !model?.isMapLoadded(),
      },
      {
        render: () => (
          <UndoAndRedo
            configuration={{
              icon: <RedoOutlinedIcon />,
              tooltip: $msg('REDO') + ' (' + $msg('CTRL') + ' + Shift + Z)',
              onClick: () => designer.redo(),
            }}
            disabledCondition={(event) => event.redoSteps > 0}
          ></UndoAndRedo>
        ),
        visible: !capability.isHidden('redo-changes'),
        disabled: () => !model?.isMapLoadded(),
      },
      null,
      {
        icon: <SaveOutlinedIcon />,
        tooltip: $msg('SAVE') + ' (' + $msg('CTRL') + ' + S)',
        onClick: () => {
          model.save(true);
        },
        visible: !capability.isHidden('save'),
        disabled: () => !model?.isMapLoadded(),
      },
      {
        icon: <RestoreOutlinedIcon />,
        tooltip: $msg('HISTORY'),
        onClick: () => onAction('history'),
        visible: !capability.isHidden('history'),
      },
      appBarDivisor,
      {
        tooltip: $msg('SAVE') + ' (' + $msg('CTRL') + ' + S)',
        render: () => (
          <IconButton size="small" onClick={() => {}}>
            <StarRateRoundedIcon
              color="action"
              style={{
                color: 'yellow',
              }}
            />
          </IconButton>
        ),
        visible: !capability.isHidden('starred'),
        disabled: () => !model?.isMapLoadded(),
      },
      {
        icon: <FileDownloadOutlinedIcon />,
        tooltip: $msg('EXPORT'),
        onClick: () => onAction('export'),
        visible: !capability.isHidden('export'),
      },
      {
        icon: <PrintOutlinedIcon />,
        tooltip: $msg('PRINT'),
        onClick: () => onAction('print'),
        visible: !capability.isHidden('print'),
      },
      {
        icon: <HelpOutlineOutlinedIcon />,
        onClick: () => onAction('info'),
        tooltip: $msg('MAP_INFO'),
        visible: !capability.isHidden('info'),
      },
      {
        icon: <CloudUploadOutlinedIcon />,
        onClick: () => onAction('publish'),
        tooltip: $msg('PUBLISH'),
        visible: !capability.isHidden('publish'),
      },
      {
        render: () => (
          <Button variant="contained" onClick={() => onAction('share')}>
            {$msg('COLLABORATE')}
          </Button>
        ),
        visible: !capability.isHidden('share'),
      },
      {
        render: () => accountConfig,
        visible: !capability.isHidden('account'),
      },
      {
        render: () => (
          <Button variant="contained" onClick={() => (window.location.href = '/c/registration')}>
            {$msg('SIGN_UP')}
          </Button>
        ),
        visible: !capability.isHidden('sign-up'),
      },
    ];
  };

  const config = buildConfig(model, mapTitle, capability, onAction, accountConfig);
  return (
    <MaterialAppBar
      role="menubar"
      position="absolute"
      color="default"
      className="material-menubar"
      sx={{
        '& MuiButtonBase-root': {
          marginX: '1rem',
        },
      }}
    >
      <MaterialToolbar>
        {config.map((c, i) => {
          return <ToolbarMenuItem key={i} configuration={c} />;
        })}
      </MaterialToolbar>
    </MaterialAppBar>
  );
};

export default AppBar;
