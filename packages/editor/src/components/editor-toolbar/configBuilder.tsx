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
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import SquareOutlinedIcon from '@mui/icons-material/SquareOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import Palette from '@mui/icons-material/Square';
import SquareOutlined from '@mui/icons-material/SquareOutlined';
import ActionConfig from '../../classes/action/action-config';
import { SwitchValueDirection } from '../toolbar/ToolbarValueModelBuilder';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import ColorPicker from '../action-widget/pane/color-picker';
import TopicLink from '../action-widget/pane/topic-link';
import TopicNote from '../action-widget/pane/topic-note';
import IconPicker from '../action-widget/pane/icon-picker';
import FontFamilySelector from '../action-widget/button/font-family-selector';
import Editor from '../../classes/model/editor';
import { useIntl } from 'react-intl';

const keyTooltip = (msg: string, key: string): string => {
  const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return `${msg} (${isMac ? '⌘' : 'Ctrl'} + ${key})`;
};

export function buildEditorPanelConfig(model: Editor): ActionConfig[] {
  const toolbarValueModelBuilder = new NodePropertyValueModelBuilder(model.getDesigner());
  const intl = useIntl();
  const colorAndShapeToolbarConfiguration: ActionConfig = {
    icon: <BrushOutlinedIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-topic-style',
      defaultMessage: 'Topic Style',
    }),
    options: [
      {
        icon: <SquareOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-share-rectangle',
          defaultMessage: 'Rectangle shape',
        }),
        onClick: () => toolbarValueModelBuilder.getTopicShapeModel().setValue('rectangle'),
        selected: () => toolbarValueModelBuilder.getTopicShapeModel().getValue() === 'rectangle',
      },
      {
        icon: <CheckBoxOutlineBlankOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-share-rounded',
          defaultMessage: 'Rounded shape',
        }),
        onClick: () => toolbarValueModelBuilder.getTopicShapeModel().setValue('rounded rectangle'),
        selected: () =>
          toolbarValueModelBuilder.getTopicShapeModel().getValue() === 'rounded rectangle',
      },
      {
        icon: <HorizontalRuleOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-share-line',
          defaultMessage: 'Line shape',
        }),
        onClick: () => toolbarValueModelBuilder.getTopicShapeModel().setValue('line'),
        selected: () => toolbarValueModelBuilder.getTopicShapeModel().getValue() === 'line',
      },
      {
        icon: <CircleOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-share-ellipse',
          defaultMessage: 'Ellipse shape',
        }),
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
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-fill-color',
          defaultMessage: 'Fill color',
        }),
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
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-border-color',
          defaultMessage: 'Border color',
        }),
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
    disabled: () => model.getDesignerModel().filterSelectedTopics().length === 0,
  };

  /**
   * submenu to manipulate node font
   */
  const fontFormatToolbarConfiguration: ActionConfig = {
    icon: <FontDownloadOutlinedIcon></FontDownloadOutlinedIcon>,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-topic-font-style',
      defaultMessage: 'Font Style',
    }),
    options: [
      {
        render: () => (
          <FontFamilySelector fontFamilyModel={toolbarValueModelBuilder.getFontFamilyModel()} />
        ),
      },
      null,
      {
        icon: <TextIncreaseOutlinedIcon></TextIncreaseOutlinedIcon>,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-font-bigger',
          defaultMessage: 'Bigger',
        }),
        onClick: () =>
          toolbarValueModelBuilder.getFontSizeModel().switchValue(SwitchValueDirection.up),
      },
      {
        icon: <TextDecreaseOutlinedIcon></TextDecreaseOutlinedIcon>,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-font-smaller',
          defaultMessage: 'Smaller',
        }),
        onClick: () =>
          toolbarValueModelBuilder.getFontSizeModel().switchValue(SwitchValueDirection.down),
      },
      null,
      {
        icon: <FormatBoldOutlinedIcon></FormatBoldOutlinedIcon>,
        tooltip: keyTooltip(
          intl.formatMessage({
            id: 'editor-panel.tooltip-topic-font-bold',
            defaultMessage: 'Bold',
          }),
          'B',
        ),
        onClick: toolbarValueModelBuilder.fontWeigthModel().switchValue,
        selected: () => toolbarValueModelBuilder.fontWeigthModel().getValue() === 'bold',
      },
      {
        icon: <FormatItalicIcon />,
        tooltip: keyTooltip(
          intl.formatMessage({
            id: 'editor-panel.tooltip-topic-font-italic',
            defaultMessage: 'Italic',
          }),
          'I',
        ),
        onClick: toolbarValueModelBuilder.getFontStyleModel().switchValue,
        selected: () => toolbarValueModelBuilder.getFontStyleModel().getValue() === 'italic',
      },
      {
        icon: () => (
          <Palette htmlColor={toolbarValueModelBuilder.getFontColorModel().getValue()}></Palette>
        ),
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-font-color',
          defaultMessage: 'Color',
        }),
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
    disabled: () => model.getDesignerModel().filterSelectedTopics().length === 0,
  };

  /**
   * button to show relation pivot
   */
  const addRelationConfiguration: ActionConfig = {
    icon: <SettingsEthernetIcon></SettingsEthernetIcon>,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-add-relationship',
      defaultMessage: 'Add Relationship',
    }),
    onClick: (e) => {
      model.getDesigner().showRelPivot(e);
    },
    disabled: () => model.getDesignerModel().filterSelectedTopics().length === 0,
  };

  /**
   * tool for node link edition
   */
  const editLinkUrlConfiguration: ActionConfig = {
    icon: <LinkOutlinedIcon />,
    tooltip: keyTooltip(
      intl.formatMessage({ id: 'editor-panel.tooltip-add-link', defaultMessage: 'Add Link' }),
      'L',
    ),
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
    disabled: () => model.getDesignerModel().filterSelectedTopics().length === 0,
  };

  /**
   * tool for node note edition
   */
  const editNoteConfiguration: ActionConfig = {
    icon: <NoteOutlinedIcon />,
    tooltip: keyTooltip(
      intl.formatMessage({ id: 'editor-panel.tooltip-add-note', defaultMessage: 'Add Note' }),
      'K',
    ),
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
    disabled: () => model.getDesignerModel().filterSelectedTopics().length === 0,
  };

  /**
   * tool for emoji selection
   */
  const editIconConfiguration: ActionConfig = {
    icon: <SentimentSatisfiedAltIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-add-icon',
      defaultMessage: 'Add Icon',
    }),
    useClickToClose: true,
    options: [
      {
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-add-icon',
          defaultMessage: 'Add Icon',
        }),
        render: (closeModal) => (
          <IconPicker
            triggerClose={closeModal}
            iconModel={toolbarValueModelBuilder.getTopicIconModel()}
          />
        ),
      },
    ],
    disabled: () => model.getDesignerModel().filterSelectedTopics().length === 0,
  };

  const addNodeToolbarConfiguration = {
    icon: <AddCircleOutlineOutlinedIcon />,
    tooltip:
      intl.formatMessage({ id: 'editor-panel.tooltip-add-topic', defaultMessage: 'Add Topic' }) +
      ' (Enter)',
    onClick: () => model.getDesigner().createSiblingForSelectedNode(),
    disabled: () => model.getDesignerModel().filterSelectedTopics().length === 0,
  };

  const deleteNodeToolbarConfiguration = {
    icon: <RemoveCircleOutlineIcon />,
    tooltip:
      intl.formatMessage({
        id: 'editor-panel.tooltip-delete-topic',
        defaultMessage: 'Delete Topic',
      }) + ' (Delete)',
    onClick: () => model.getDesigner().deleteSelectedEntities(),
    disabled: () => model.getDesigner().getModel().filterSelectedTopics().length === 0,
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
