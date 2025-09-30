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
import React, { ReactElement, useEffect, useState, useRef } from 'react';
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
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import Typography from '@mui/material/Typography';
import UndoAndRedo from '../action-widget/button/undo-and-redo';
import Button from '@mui/material/Button';
import LogoTextBlackSvg from '../../../images/logo-text-black.svg';
import LogoTextOrangeSvg from '../../../images/logo-text-orange.svg';
import IconButton from '@mui/material/IconButton';
import { ToolbarActionType } from '../toolbar/ToolbarActionType';
import MapInfo from '../../classes/model/map-info';
import { useIntl } from 'react-intl';
import ThemeEditor from '../action-widget/pane/theme-editor';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import TextField from '@mui/material/TextField';
import { $notify } from '@wisemapping/mindplot';
import { useTheme } from '../../contexts/ThemeContext';
import { trackAppBarAction } from '../../utils/analytics';

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
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentTitle, setCurrentTitle] = useState<string>(mapInfo.getTitle());
  const inputRef = useRef<HTMLInputElement>(null);
  const intl = useIntl();
  const { mode } = useTheme();

  const handleStarredOnClick = () => {
    const newStatus = !isStarred;
    trackAppBarAction('starred', newStatus ? 'star' : 'unstar');
    mapInfo.updateStarred(newStatus).then(() => setStarred(newStatus));
  };

  const handleTitleClick = () => {
    if (!capability.isHidden('rename')) {
      trackAppBarAction('rename_map');
      setIsEditingTitle(true);
      setEditedTitle(currentTitle);
    }
  };

  const handleTitleSave = async () => {
    if (editedTitle.trim() === '' || editedTitle === currentTitle) {
      setIsEditingTitle(false);
      return;
    }

    setIsSaving(true);
    try {
      await mapInfo.updateTitle(editedTitle.trim());
      setCurrentTitle(editedTitle.trim());
      setIsEditingTitle(false);
      // Update the document title as well
      document.title = `${editedTitle.trim()} | WiseMapping`;
      // Show success notification
      $notify(
        intl.formatMessage({
          id: 'appbar.title-renamed',
          defaultMessage: 'Mind map has been renamed',
        }),
      );
    } catch (error) {
      console.error(
        intl.formatMessage({
          id: 'appbar.error-saving-title',
          defaultMessage: 'Error saving title:',
        }),
        error,
      );
      // Revert to original title on error
      setEditedTitle(currentTitle);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleTitleSave();
    } else if (event.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle(currentTitle);
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      const inputElement = inputRef.current.querySelector('input');
      if (inputElement) {
        inputElement.focus();
        // Position cursor at the end of the text instead of selecting all
        const length = inputElement.value.length;
        inputElement.setSelectionRange(length, length);
      }
    }
  }, [isEditingTitle]);

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
      onClick: () => {
        trackAppBarAction('back_to_maps_list');
        window.location.href = '/c/maps/';
      },
    },
    {
      render: () => (
        <img
          src={mode === 'light' ? LogoTextBlackSvg : LogoTextOrangeSvg}
          aria-label={intl.formatMessage({
            id: 'appbar.logo-aria-label',
            defaultMessage: 'WiseMapping',
          })}
        />
      ),
      visible: !capability.isHidden('appbar-title'),
    },
    {
      render: () => (
        <div
          style={{
            marginLeft: '1.5rem',
            marginRight: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isEditingTitle ? (
            <>
              <Tooltip
                title={intl.formatMessage({
                  id: 'appbar.tooltip-rename',
                  defaultMessage: 'Rename',
                })}
              >
                <TextField
                  ref={inputRef}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleSave}
                  variant="outlined"
                  size="small"
                  data-testid="app-bar-title"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1rem',
                      height: '32px',
                      outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                      borderRadius: '4px',
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '6px 8px',
                    },
                  }}
                  disabled={isSaving}
                />
              </Tooltip>
            </>
          ) : (
            <Tooltip
              title={intl.formatMessage({ id: 'appbar.tooltip-rename', defaultMessage: 'Rename' })}
            >
              <TextField
                value={currentTitle}
                variant="outlined"
                size="small"
                InputProps={{ readOnly: true }}
                onClick={handleTitleClick}
                data-testid="app-bar-title"
                sx={{
                  cursor: !capability.isHidden('rename') ? 'pointer' : 'default',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1rem',
                    height: '32px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '6px 8px',
                    cursor: !capability.isHidden('rename') ? 'pointer' : 'default',
                  },
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
      visible: !capability.isHidden('appbar-title'),
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
            onClick: () => {
              trackAppBarAction('undo');
              model!.getDesigner().undo();
            },
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
            onClick: () => {
              trackAppBarAction('redo');
              model!.getDesigner().redo();
            },
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
        trackAppBarAction('save');
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
      icon: <HelpOutlineOutlinedIcon />,
      onClick: () => {
        trackAppBarAction('info');
        onAction('info');
      },
      tooltip: intl.formatMessage({ id: 'appbar.tooltip-info', defaultMessage: 'Information' }),
      visible: !capability.isHidden('info'),
    },
    {
      icon: <RestoreOutlinedIcon />,
      onClick: () => {
        trackAppBarAction('history');
        onAction('history');
      },
      tooltip: intl.formatMessage({
        id: 'appbar.tooltip-history',
        defaultMessage: 'Changes History',
      }),
      visible: !capability.isHidden('history'),
    },
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
    appBarDivisor,
    {
      icon: <PaletteOutlinedIcon />,
      tooltip: intl.formatMessage({ id: 'appbar.tooltip-theme', defaultMessage: 'Theme' }),
      useClickToClose: true,
      title: intl.formatMessage({ id: 'appbar.theme-title', defaultMessage: 'Theme' }),
      options: [
        {
          render: (closeModal) => {
            if (model) {
              const modelBuilder = new NodePropertyValueModelBuilder(model.getDesigner());
              return (
                <ThemeEditor closeModal={closeModal} themeModel={modelBuilder.getThemeModel()} />
              );
            }
            return <div>Theme Editor not available</div>;
          },
        },
      ],
      visible: !capability.isHidden('theme'),
    },
    {
      icon: <PrintOutlinedIcon />,
      onClick: () => {
        trackAppBarAction('print');
        onAction('print');
      },
      tooltip: intl.formatMessage({ id: 'appbar.tooltip-print', defaultMessage: 'Print' }),
      visible: !capability.isHidden('print'),
    },
    {
      icon: <FileDownloadOutlinedIcon />,
      onClick: () => {
        trackAppBarAction('export');
        onAction('export');
      },
      tooltip: intl.formatMessage({ id: 'appbar.tooltip-export', defaultMessage: 'Export' }),
      visible: !capability.isHidden('export'),
    },
    {
      icon: <CloudUploadOutlinedIcon />,
      onClick: () => {
        trackAppBarAction('publish');
        onAction('publish');
      },
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
          <Button
            variant="contained"
            onClick={() => {
              trackAppBarAction('share');
              onAction('share');
            }}
          >
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
          <Button
            variant="contained"
            onClick={() => {
              trackAppBarAction('sign_up');
              window.location.href = '/c/registration';
            }}
          >
            {intl.formatMessage({ id: 'appbar.button-signup', defaultMessage: 'Sign Up' })}
          </Button>
        </Tooltip>
      ),
      visible: !capability.isHidden('sign-up'),
    },
  ];

  return (
    <>
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
    </>
  );
};

export default AppBar;
