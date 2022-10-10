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
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import SquareOutlinedIcon from '@mui/icons-material/SquareOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Box from '@mui/material/Box';

import Palette from '@mui/icons-material/Square';
import SquareOutlined from '@mui/icons-material/SquareOutlined';
import { $msg } from '@wisemapping/mindplot';
import ActionConfig from '../../classes/action/action-config';
import { SwitchValueDirection } from './ToolbarValueModelBuilder';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import Typography from '@mui/material/Typography';
import KeyboardOutlined from '@mui/icons-material/KeyboardOutlined';
import ColorPicker from '../action-widget/pane/color-picker';
import KeyboardShorcutsHelp from '../action-widget/pane/keyboard-shortcut-help';
import TopicLink from '../action-widget/pane/topic-link';
import TopicNote from '../action-widget/pane/topic-note';
import IconPicker from '../action-widget/pane/icon-picker';
import FontFamilySelector from '../action-widget/button/font-family-selector';
import Capability from '../../classes/action/capability';
import Editor from '../../classes/model/editor';

export type ToolbarActionType = 'export' | 'publish' | 'history' | 'print' | 'share' | 'info';

/**
 *
 * @param designer designer to aply changes
 * @returns configuration for @wisemapping/editor priAppbarmary toolbar
 */
export function buildEditorPanelConfig(model: Editor): ActionConfig[] {
  const toolbarValueModelBuilder = new NodePropertyValueModelBuilder(model.getDesigner());

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

export function buildZoomToolbarConfig(model: Editor, capability: Capability): ActionConfig[] {
  return [
    {
      icon: <CenterFocusStrongOutlinedIcon />,
      tooltip: $msg('CENTER_POSITION'),
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
              : Math.floor((1 / designer.getWorkSpace()?.getZoom()) * 100)}
          </Typography>
        </Box>
      ),
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <ZoomInOutlinedIcon />,
      tooltip: $msg('ZOOM_IN'),
      onClick: () => {
        model.getDesigner().zoomIn();
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <ZoomOutOutlinedIcon />,
      tooltip: $msg('ZOOM_OUT'),
      onClick: () => {
        model.getDesigner().zoomOut();
      },
      disabled: () => !model?.isMapLoadded(),
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
