import React, { useEffect, useState } from 'react';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import FontDownloadOutlinedIcon from '@mui/icons-material/FontDownloadOutlined';
import TextIncreaseOutlinedIcon from '@mui/icons-material/TextIncreaseOutlined';
import TextDecreaseOutlinedIcon from '@mui/icons-material/TextDecreaseOutlined';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import SquareOutlinedIcon from '@mui/icons-material/SquareOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import LogoTextBlackSvg from '../../../images/logo-text-black.svg';
import Palette from '@mui/icons-material/Square';
import SquareOutlined from '@mui/icons-material/SquareOutlined';
import { $msg, Designer } from '@wisemapping/mindplot';
import ActionConfig from '../../classes/actions-config';
import { SwitchValueDirection, NodePropertyValueModelBuilder } from './ToolbarValueModelBuilder';
import {
  ColorPicker,
  FontFamilySelect,
  KeyboardShorcutsHelp,
  NoteForm,
  ToolbarEmojiPcker,
  UndoAndRedoButton,
  UrlForm,
} from './toolbarCustomComponents';
import Typography from '@mui/material/Typography';
import { ToolbarActionType } from '.';
import KeyboardOutlined from '@mui/icons-material/KeyboardOutlined';
import Tooltip from '@mui/material/Tooltip';

/**
 *
 * @param designer designer to aply changes
 * @returns configuration for @wisemapping/editor primary toolbar
 */
export function buildToolbarCongiruation(designer: Designer): ActionConfig[] {
  if (!designer) return [];

  /**
   * model builder
   */
  const toolbarValueModelBuilder = new NodePropertyValueModelBuilder(designer);

  // <div id="rectagle" model="rectagle"><img src="${RectangleImage}" alt="Rectangle"></div>
  // <div id="rounded_rectagle" model="rounded rectagle" ><img src="${RectangleRoundImage}" alt="Rounded Rectangle"></div>
  // <div id="line" model="line"><img src="${LineImage}" alt="Line"></div>
  // <div id="elipse" model="elipse"><img src="${CircleImage}"></div>`;
  /**
   * submenu to manipulate node color and shape
   */
  const colorAndShapeToolbarConfiguration: ActionConfig = {
    icon: <BrushOutlinedIcon />,

    tooltip: $msg('TOPIC_SHAPE'),
    options: [
      {
        icon: <SquareOutlinedIcon />,
        tooltip: $msg('TOPIC_SHAPE_RECTANGLE'),
        onClick: () => toolbarValueModelBuilder.getTopicShapeModel().setValue('rectagle'),
        selected: () => toolbarValueModelBuilder.getTopicShapeModel().getValue() === 'rectagle',
      },
      {
        icon: <CheckBoxOutlineBlankOutlinedIcon />,
        tooltip: $msg('TOPIC_SHAPE_ROUNDED'),
        onClick: () => toolbarValueModelBuilder.getTopicShapeModel().setValue('rounded rectagle'),
        selected: () =>
          toolbarValueModelBuilder.getTopicShapeModel().getValue() === 'rounded rectagle',
      },
      {
        icon: <HorizontalRuleOutlinedIcon />,
        tooltip: $msg('TOPIC_SHAPE_LINE'),
        onClick: () => toolbarValueModelBuilder.getTopicShapeModel().setValue('line'),
        selected: () => toolbarValueModelBuilder.getTopicShapeModel().getValue() === 'line',
      },
      {
        icon: <CircleOutlinedIcon />,
        tooltip: $msg('TOPIC_SHAPE_ELLIPSE'),
        onClick: () => toolbarValueModelBuilder.getTopicShapeModel().setValue('elipse'),
        selected: () => toolbarValueModelBuilder.getTopicShapeModel().getValue() === 'elipse',
      },
      null,
      {
        icon: () => (
          <Palette
            htmlColor={toolbarValueModelBuilder.getSelectedTopicColorModel().getValue()}
          ></Palette>
        ),
        tooltip: $msg('TOPIC_COLOR'),
        options: [
          {
            render: (closeModal) => {
              return (
                <ColorPicker
                  closeModal={closeModal}
                  colorModel={toolbarValueModelBuilder.getSelectedTopicColorModel()}
                ></ColorPicker>
              );
            },
          },
        ],
      },
      {
        icon: () => (
          <SquareOutlined
            htmlColor={toolbarValueModelBuilder.getColorBorderModel().getValue()}
          ></SquareOutlined>
        ),
        tooltip: $msg('TOPIC_BORDER_COLOR'),
        options: [
          {
            render: (closeModal) => {
              return (
                <ColorPicker
                  closeModal={closeModal}
                  colorModel={toolbarValueModelBuilder.getColorBorderModel()}
                ></ColorPicker>
              );
            },
          },
        ],
      },
    ],
    disabled: () => designer.getModel().filterSelectedTopics().length === 0,
  };

  /**
   * submenu to manipulate node font
   */
  const fontFormatToolbarConfiguration: ActionConfig = {
    icon: <FontDownloadOutlinedIcon></FontDownloadOutlinedIcon>,
    tooltip: $msg('FONT_FORMAT'),
    options: [
      {
        render: () => (
          <FontFamilySelect fontFamilyModel={toolbarValueModelBuilder.getFontFamilyModel()} />
        ),
      },
      null,
      {
        icon: <TextIncreaseOutlinedIcon></TextIncreaseOutlinedIcon>,
        tooltip: $msg('FONT_INCREASE'),
        onClick: () =>
          toolbarValueModelBuilder.getFontSizeModel().switchValue(SwitchValueDirection.up),
      },
      {
        icon: <TextDecreaseOutlinedIcon></TextDecreaseOutlinedIcon>,
        tooltip: $msg('FONT_DECREASE'),
        onClick: () =>
          toolbarValueModelBuilder.getFontSizeModel().switchValue(SwitchValueDirection.down),
      },
      null,
      {
        icon: <FormatBoldOutlinedIcon></FormatBoldOutlinedIcon>,
        tooltip: $msg('FONT_BOLD') + ' (' + $msg('CTRL') + ' + B)',
        onClick: toolbarValueModelBuilder.fontWeigthModel().switchValue,
        selected: () => toolbarValueModelBuilder.fontWeigthModel().getValue() === 'bold',
      },
      {
        icon: <FormatItalicIcon />,
        tooltip: $msg('FONT_ITALIC') + ' (' + $msg('CTRL') + ' + I)',
        onClick: toolbarValueModelBuilder.getFontStyleModel().switchValue,
        selected: () => toolbarValueModelBuilder.getFontStyleModel().getValue() === 'italic',
      },
      {
        icon: () => (
          <Palette htmlColor={toolbarValueModelBuilder.getFontColorModel().getValue()}></Palette>
        ),
        tooltip: $msg('FONT_COLOR'),
        options: [
          {
            render: (closeModal) => {
              return (
                <ColorPicker
                  closeModal={closeModal}
                  colorModel={toolbarValueModelBuilder.getFontColorModel()}
                ></ColorPicker>
              );
            },
          },
        ],
      },
    ],
    disabled: () => designer.getModel().filterSelectedTopics().length === 0,
  };

  /**
   * button to show relation pivot
   */
  const addRelationConfiguration: ActionConfig = {
    icon: <SettingsEthernetIcon></SettingsEthernetIcon>,
    tooltip: $msg('TOPIC_RELATIONSHIP'),
    onClick: (e) => {
      designer.showRelPivot(e);
    },
    disabled: () => designer.getModel().filterSelectedTopics().length === 0,
  };

  /**
   * tool for node link edition
   */
  const editLinkUrlConfiguration: ActionConfig = {
    icon: <LinkOutlinedIcon />,
    tooltip: $msg('TOPIC_LINK'),
    useClickToClose: true,
    options: [
      {
        render: (closeModal) => (
          <UrlForm
            closeModal={closeModal}
            urlModel={toolbarValueModelBuilder.getLinkModel()}
          ></UrlForm>
        ),
      },
    ],
    disabled: () => designer.getModel().filterSelectedTopics().length === 0,
  };

  /**
   * tool for node note edition
   */
  const editNoteConfiguration: ActionConfig = {
    icon: <NoteOutlinedIcon />,
    tooltip: $msg('TOPIC_NOTE'),
    useClickToClose: true,
    options: [
      {
        tooltip: 'Node note',
        render: (closeModal) => (
          <NoteForm
            closeModal={closeModal}
            noteModel={toolbarValueModelBuilder.getNoteModel()}
          ></NoteForm>
        ),
      },
    ],
    disabled: () => designer.getModel().filterSelectedTopics().length === 0,
  };

  /**
   * tool for emoji selection
   */
  const editIconConfiguration: ActionConfig = {
    icon: <SentimentSatisfiedAltIcon />,
    tooltip: $msg('TOPIC_ICON'),
    options: [
      {
        tooltip: 'Node icon',
        render: (closeModal) => (
          <ToolbarEmojiPcker
            closeModal={closeModal}
            iconModel={toolbarValueModelBuilder.getTopicIconModel()}
          />
        ),
      },
    ],
    disabled: () => designer.getModel().filterSelectedTopics().length === 0,
  };

  const addNodeToolbarConfiguration = {
    icon: <AddCircleOutlineOutlinedIcon />,
    tooltip: $msg('TOPIC_ADD'),
    onClick: () => designer.createSiblingForSelectedNode(),
    disabled: () => designer.getModel().filterSelectedTopics().length === 0,
  };
  const deleteNodeToolbarConfiguration = {
    icon: <RemoveCircleOutlineIcon />,
    tooltip: $msg('TOPIC_DELETE'),
    onClick: () => designer.deleteSelectedEntities(),
    disabled: () => designer.getModel().filterSelectedTopics().length === 0,
  };
  return [
    addNodeToolbarConfiguration,
    deleteNodeToolbarConfiguration,
    colorAndShapeToolbarConfiguration,
    fontFormatToolbarConfiguration,
    editIconConfiguration,
    editNoteConfiguration,
    editLinkUrlConfiguration,
    addRelationConfiguration,
  ];
}

export function buildZoomToolbarConfiguration(isMobile: boolean, designer: Designer) {
  if (!designer) return [];

  return [
    {
      icon: <KeyboardOutlined />,
      tooltip: $msg('KEYBOARD_SHOTCUTS'),
      visible: !isMobile,
      options: [
        {
          render: () => <KeyboardShorcutsHelp />,
        },
      ],
    },
    {
      // zoom value candidate, neds to fixit
      render: () => (
        <Box sx={{ p: 0.5 }}>
          <Typography variant="overline" color="gray">
            %{Math.floor((1 / designer.getWorkSpace()?.getZoom()) * 100)}
          </Typography>
        </Box>
      ),
    },
    {
      icon: <ZoomInOutlinedIcon />,
      tooltip: $msg('ZOOM_IN'),
      onClick: (e) => {
        designer.zoomIn();
      },
    },
    {
      icon: <ZoomOutOutlinedIcon />,
      tooltip: $msg('ZOOM_OUT'),
      onClick: (e) => {
        designer.zoomOut();
      },
    },
    {
      icon: <CenterFocusStrongOutlinedIcon />,
      tooltip: $msg('CENTER_POSITION'),
      onClick: (e) => {
        designer.zoomToFit();
      },
    },
  ];
}

export function buildEditorAppBarConfiguration(
  designer: Designer,
  onAction: (type: ToolbarActionType) => void,
  save: () => void,
  showOnlyCommonActions: boolean,
  showAccessChangeActions: boolean,
  showMapEntityActions: boolean,
  showMindMapNodesActions: boolean,
  showPersistenceActions: boolean,
): ActionConfig[] {
  if (!designer) return [];

  let commonConfiguration = [
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
        <Tooltip title={designer.getMindmap().getDescription()}>
          <Typography
            className="truncated"
            variant="body1"
            component="div"
            sx={{ marginX: '1.5rem' }}
          >
            {designer.getMindmap().getDescription()}
          </Typography>
        </Tooltip>
      ),
    },
  ];

  const exportConfiguration: ActionConfig = {
    icon: <FileDownloadOutlinedIcon />,
    tooltip: $msg('EXPORT'),
    onClick: () => onAction('export'),
  };

  const helpConfiguration: ActionConfig = {
    icon: <HelpOutlineOutlinedIcon />,
    onClick: () => onAction('info'),
    tooltip: $msg('MAP_INFO'),
  };

  const appBarDivisor = {
    render: () => <Typography component="div" sx={{ flexGrow: 1 }} />,
  };

  if (showOnlyCommonActions) {
    return [...commonConfiguration, appBarDivisor, exportConfiguration];
  }

  return [
    ...commonConfiguration,
    null,
    {
      render: () => (
        <UndoAndRedoButton
          configuration={{
            icon: <UndoOutlinedIcon />,
            tooltip: $msg('UNDO') + ' (' + $msg('CTRL') + ' + Z)',
            onClick: () => designer.undo(),
          }}
          disabledCondition={(event) => event.undoSteps > 0}
        ></UndoAndRedoButton>
      ),
      visible: showMindMapNodesActions,
    },
    {
      render: () => (
        <UndoAndRedoButton
          configuration={{
            icon: <RedoOutlinedIcon />,
            tooltip: $msg('REDO') + ' (' + $msg('CTRL') + ' + Shift + Z)',
            onClick: () => designer.redo(),
          }}
          disabledCondition={(event) => event.redoSteps > 0}
        ></UndoAndRedoButton>
      ),
      visible: showMindMapNodesActions,
    },
    null,
    {
      icon: <RestoreOutlinedIcon />,
      tooltip: $msg('HISTORY'),
      onClick: () => onAction('history'),
      visible: showPersistenceActions,
    },
    {
      icon: <SaveOutlinedIcon />,
      tooltip: $msg('SAVE') + ' (' + $msg('CTRL') + ' + S)',
      onClick: save,
      visible: showPersistenceActions,
    },
    appBarDivisor,
    {
      icon: <PrintOutlinedIcon />,
      tooltip: $msg('PRINT'),
      onClick: () => onAction('print'),
      visible: showMapEntityActions,
    },
    exportConfiguration,
    {
      icon: <CloudUploadOutlinedIcon />,
      onClick: () => onAction('publish'),
      tooltip: $msg('PUBLISH'),
      disabled: () => !showAccessChangeActions,
    },
    {
      render: () => (
        <Button
          variant="contained"
          onClick={() => onAction('share')}
          disabled={!showAccessChangeActions}
        >
          {$msg('COLLABORATE')}
        </Button>
      ),
    },
    helpConfiguration,
  ];
}
