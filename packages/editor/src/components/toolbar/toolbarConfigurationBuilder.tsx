import React from 'react';
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
import ActionConfig from '../../classes/action/action-config';
import { SwitchValueDirection } from './ToolbarValueModelBuilder';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import Typography from '@mui/material/Typography';
import KeyboardOutlined from '@mui/icons-material/KeyboardOutlined';
import Tooltip from '@mui/material/Tooltip';
import ColorPicker from '../action-widget/pane/color-picker';
import KeyboardShorcutsHelp from '../action-widget/pane/keyboard-shortcut-help';
import UndoAndRedo from '../action-widget/button/undo-and-redo';
import TopicLink from '../action-widget/pane/topic-link';
import TopicNote from '../action-widget/pane/topic-note';
import IconPicker from '../action-widget/pane/icon-picker';
import FontFamilySelector from '../action-widget/button/font-family-selector';
import Capability from '../../classes/action/capability';

export type ToolbarActionType = 'export' | 'publish' | 'history' | 'print' | 'share' | 'info';

/**
 *
 * @param designer designer to aply changes
 * @returns configuration for @wisemapping/editor priAppbarmary toolbar
 */
export function buildToolbarConfig(designer: Designer): ActionConfig[] {
  if (!designer) return [];

  /**
   * model builder
   */
  const toolbarValueModelBuilder = new NodePropertyValueModelBuilder(designer);

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
          <FontFamilySelector fontFamilyModel={toolbarValueModelBuilder.getFontFamilyModel()} />
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
          <TopicLink
            closeModal={closeModal}
            urlModel={toolbarValueModelBuilder.getLinkModel()}
          ></TopicLink>
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
          <TopicNote
            closeModal={closeModal}
            noteModel={toolbarValueModelBuilder.getNoteModel()}
          ></TopicNote>
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
          <IconPicker
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

export function buildZoomToolbarConfiguration(
  capability: Capability,
  designer: Designer,
): ActionConfig[] {
  if (!designer) return [];

  return [
    {
      icon: <CenterFocusStrongOutlinedIcon />,
      tooltip: $msg('CENTER_POSITION'),
      onClick: () => {
        designer.zoomToFit();
      },
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
      onClick: () => {
        designer.zoomIn();
      },
    },
    {
      icon: <ZoomOutOutlinedIcon />,
      tooltip: $msg('ZOOM_OUT'),
      onClick: () => {
        designer.zoomOut();
      },
    },
    {
      icon: <KeyboardOutlined />,
      tooltip: $msg('KEYBOARD_SHOTCUTS'),
      visible: !capability.isHidden('keyboard-shortcuts'),
      options: [
        {
          render: () => <KeyboardShorcutsHelp />,
        },
      ],
    },
  ];
}

export function buildEditorAppBarConfiguration(
  designer: Designer,
  mapTitle: string,
  capability: Capability,
  onAction: (type: ToolbarActionType) => void,
  accountConfiguration,
  save: () => void,
): ActionConfig[] {
  if (!designer) {
    return [];
  }

  let commonConfiguration: ActionConfig[] = [
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
  ];

  const appBarDivisor = {
    render: () => <Typography component="div" sx={{ flexGrow: 1 }} />,
  };

  return [
    ...commonConfiguration,
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
    },
    null,
    {
      icon: <SaveOutlinedIcon />,
      tooltip: $msg('SAVE') + ' (' + $msg('CTRL') + ' + S)',
      onClick: save,
      visible: !capability.isHidden('save'),
    },
    {
      icon: <RestoreOutlinedIcon />,
      tooltip: $msg('HISTORY'),
      onClick: () => onAction('history'),
      visible: !capability.isHidden('history'),
    },
    appBarDivisor,
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
      render: () => accountConfiguration,
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
}
