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
import React, { ReactElement, useEffect, useState } from 'react';
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
import UndoAndRedo from '../action-widget/button/undo-and-redo';
import Button from '@mui/material/Button';
import LogoTextBlackSvg from '../../../images/logo-text-black.svg';
import IconButton from '@mui/material/IconButton';
import { ToolbarActionType } from '../toolbar/ToolbarActionType';
import MapInfo from '../../classes/model/map-info';
import { useIntl } from 'react-intl';

interface AppBarProps {
  model: Editor | undefined;
  mapInfo: MapInfo;
  capability: Capability;
  onAction: (type: ToolbarActionType) => void;
  accountConfig?;
}

const appBarDivisor = {
  render: () => <Typography component="div" sx={{ flexGrow: 1 }} />,
};

const keyTooltip = (msg: string, key: string): string => {
  const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return `${msg} (${isMac ? '⌘' : 'Ctrl'} + ${key})`;
};

const StarredOnStyle = {
  color: '#FDDA0D',
};

const StarredOffStyle = {
  color: 'gray',
};

const AppBar = ({
  model,
  mapInfo,
  capability,
  onAction,
  accountConfig,
}: AppBarProps): ReactElement => {
  const [isStarred, setStarred] = useState<undefined | boolean>(undefined);
  const intl = useIntl();

  const handleStarredOnClick = () => {
    const newStatus = !isStarred;
    mapInfo.updateStarred(newStatus).then(() => setStarred(newStatus));
  };

  useEffect(() => {
    if (!capability.isHidden('starred')) {
      mapInfo
        .isStarred()
        .then((value) => setStarred(value))
        .catch((e) => {
          console.error(`Unexpected error loading starred status-> ${e}`);
        });
    }
  }, []);

  const config: (ActionConfig | undefined)[] = [
    {
      icon: <ArrowBackIosNewOutlinedIcon />,
      tooltip: intl.formatMessage({
        id: 'appbar.back-to-map-list',
        defaultMessage: 'Back to maps list',
      }),
      onClick: () => (window.location.href = '/c/maps/'),
    },
    {
      render: () => <img src={LogoTextBlackSvg} aria-label="WiseMappping" />,
      visible: !capability.isHidden('appbar-title'),
    },
    {
      render: () => (
        <Tooltip title={mapInfo.getTitle()}>
          <Typography
            className="truncated"
            variant="body1"
            component="div"
            sx={{ marginX: '1.5rem' }}
          >
            {mapInfo.getTitle()}
          </Typography>
        </Tooltip>
      ),
    },
    undefined,
    {
      render: () => (
        <UndoAndRedo
          configuration={{
            icon: <UndoOutlinedIcon />,
            tooltip: keyTooltip(
              intl.formatMessage({ id: 'appbar.tooltip-undo', defaultMessage: 'Undo' }),
              'Z',
            ),
            onClick: () => model!.getDesigner().undo(),
          }}
          disabledCondition={(event) => event.undoSteps > 0}
          model={model}
        />
      ),
      visible: !capability.isHidden('undo-changes'),
      disabled: () => !model?.isMapLoadded(),
    },
    {
      render: () => (
        <UndoAndRedo
          configuration={{
            icon: <RedoOutlinedIcon />,
            tooltip: keyTooltip(
              intl.formatMessage({ id: 'appbar.tooltip-redo', defaultMessage: 'Redo' }),
              'Shift + Z',
            ),
            onClick: () => model!.getDesigner().redo(),
          }}
          disabledCondition={(event) => event.redoSteps > 0}
          model={model}
        />
      ),
      visible: !capability.isHidden('redo-changes'),
      disabled: () => !model?.isMapLoadded(),
    },
    undefined,
    {
      icon: <SaveOutlinedIcon />,
      onClick: () => {
        model!.save(true);
      },
      tooltip: keyTooltip(
        intl.formatMessage({ id: 'appbar.tooltip-save', defaultMessage: 'Save' }),
        'S',
      ),
      visible: !capability.isHidden('save'),
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <RestoreOutlinedIcon />,
      onClick: () => onAction('history'),
      tooltip: intl.formatMessage({
        id: 'appbar.tooltip-history',
        defaultMessage: 'Changes History',
      }),
      visible: !capability.isHidden('history'),
    },
    appBarDivisor,
    {
      render: () => (
        <Tooltip
          title={intl.formatMessage({ id: 'appbar.tooltip-starred', defaultMessage: 'Starred' })}
        >
          <IconButton size="small" onClick={handleStarredOnClick}>
            <StarRateRoundedIcon
              color="action"
              style={isStarred ? StarredOnStyle : StarredOffStyle}
            />
          </IconButton>
        </Tooltip>
      ),
      visible: !capability.isHidden('starred'),
      disabled: () => isStarred !== undefined,
    },
    {
      icon: <FileDownloadOutlinedIcon />,
      onClick: () => onAction('export'),
      tooltip: intl.formatMessage({ id: 'appbar.tooltip-export', defaultMessage: 'Export' }),
      visible: !capability.isHidden('export'),
    },
    {
      icon: <PrintOutlinedIcon />,
      onClick: () => onAction('print'),
      tooltip: intl.formatMessage({ id: 'appbar.tooltip-print', defaultMessage: 'Print' }),
      visible: !capability.isHidden('print'),
    },
    {
      icon: <HelpOutlineOutlinedIcon />,
      onClick: () => onAction('info'),
      tooltip: intl.formatMessage({ id: 'appbar.tooltip-info', defaultMessage: 'Information' }),
      visible: !capability.isHidden('info'),
    },
    {
      icon: <CloudUploadOutlinedIcon />,
      onClick: () => onAction('publish'),
      tooltip: intl.formatMessage({ id: 'appbar.tooltip-publish', defaultMessage: 'Publish' }),
      visible: !capability.isHidden('publish'),
    },
    {
      render: () => (
        <Tooltip
          title={intl.formatMessage({
            id: 'appbar.tooltip-shared',
            defaultMessage: 'Share for Collaboration',
          })}
        >
          <Button variant="contained" onClick={() => onAction('share')}>
            {intl.formatMessage({ id: 'appbar.shared-button', defaultMessage: 'Share' })}
          </Button>
        </Tooltip>
      ),
      visible: !capability.isHidden('share'),
    },
    {
      render: () => accountConfig,
      visible: !capability.isHidden('account'),
    },
    {
      render: () => (
        <Tooltip
          title={intl.formatMessage({ id: 'appbar.tooltip-signup', defaultMessage: 'Sign Up' })}
        >
          <Button variant="contained" onClick={() => (window.location.href = '/c/registration')}>
            {intl.formatMessage({ id: 'appbar.button-signup', defaultMessage: 'Sign Up' })}
          </Button>
        </Tooltip>
      ),
      visible: !capability.isHidden('sign-up'),
    },
  ];

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
