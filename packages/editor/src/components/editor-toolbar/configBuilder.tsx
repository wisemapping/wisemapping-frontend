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
import FormatPaintIconOutlineIcon from '@mui/icons-material/FormatPaintOutlined';
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
import PolylineOutlined from '@mui/icons-material/PolylineOutlined';
import GestureOutlined from '@mui/icons-material/GestureOutlined';
import TimelineOutined from '@mui/icons-material/TimelineOutlined';
import ShareOutlined from '@mui/icons-material/ShareOutlined';
import SwapCallsOutlined from '@mui/icons-material/SwapCallsOutlined';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import ShortcutIconOutlined from '@mui/icons-material/ShortcutOutlined';
import ColorLensOutlined from '@mui/icons-material/ColorLensOutlined';

import Palette from '@mui/icons-material/Square';
import SquareOutlined from '@mui/icons-material/SquareOutlined';
import ActionConfig from '../../classes/action/action-config';
import { SwitchValueDirection } from '../toolbar/ToolbarValueModelBuilder';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import ColorPicker from '../action-widget/pane/color-picker';
import TopicLinkEditor from '../action-widget/pane/topic-link-editor';
import RichTextNoteEditor from '../action-widget/pane/rich-text-note-editor';
import IconPicker from '../action-widget/pane/icon-picker';
import FontFamilySelector from '../action-widget/button/font-family-selector';
import Editor from '../../classes/model/editor';
import { IntlShape } from 'react-intl';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import ThemeEditor from '../action-widget/pane/theme-editor';

const keyTooltip = (msg: string, key: string): string => {
  const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return `${msg} (${isMac ? '⌘' : 'Ctrl'} + ${key})`;
};

export function buildEditorPanelConfig(model: Editor, intl: IntlShape): ActionConfig[] {
  const modelBuilder = new NodePropertyValueModelBuilder(model.getDesigner());

  const colorAndShapeToolbarConfiguration: ActionConfig = {
    icon: <FormatPaintIconOutlineIcon />,
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
        onClick: () => {
          const setValue = modelBuilder.getTopicShapeModel().setValue;
          if (setValue) {
            setValue('rectangle');
          }
        },
        selected: () => modelBuilder.getTopicShapeModel().getValue() === 'rectangle',
      },
      {
        icon: <CheckBoxOutlineBlankOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-share-rounded',
          defaultMessage: 'Rounded shape',
        }),
        onClick: () => {
          const setValue = modelBuilder.getTopicShapeModel().setValue;
          if (setValue) {
            setValue('rounded rectangle');
          }
        },
        selected: () => modelBuilder.getTopicShapeModel().getValue() === 'rounded rectangle',
      },
      {
        icon: <HorizontalRuleOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-share-line',
          defaultMessage: 'Line shape',
        }),
        onClick: () => {
          const setValue = modelBuilder.getTopicShapeModel().setValue;
          if (setValue) {
            setValue('line');
          }
        },
        selected: () => modelBuilder.getTopicShapeModel().getValue() === 'line',
      },
      {
        icon: <CircleOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-share-ellipse',
          defaultMessage: 'Ellipse shape',
        }),
        onClick: () => {
          const setValue = modelBuilder.getTopicShapeModel().setValue;
          if (setValue) {
            setValue('elipse');
          }
        },
        selected: () => modelBuilder.getTopicShapeModel().getValue() === 'elipse',
      },
      {
        icon: <NotInterestedOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-share-none',
          defaultMessage: 'None shape',
        }),
        onClick: () => {
          const setValue = modelBuilder.getTopicShapeModel().setValue;
          if (setValue) {
            setValue('none');
          }
        },
        selected: () => modelBuilder.getTopicShapeModel().getValue() === 'none',
      },
      null,
      {
        icon: () => <SquareOutlined htmlColor={modelBuilder.getColorBorderModel().getValue()} />,
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
                  colorModel={modelBuilder.getColorBorderModel()}
                />
              );
            },
          },
        ],
      },
      {
        icon: <NotInterestedOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-border-color-default',
          defaultMessage: 'Default border color',
        }),
        onClick: () => {
          const setValue = modelBuilder.getColorBorderModel().setValue;
          if (setValue) {
            setValue(undefined);
          }
        },
        selected: () => modelBuilder.getColorBorderModel().getValue() === undefined,
      },
      null,
      {
        icon: () => <Palette htmlColor={modelBuilder.getSelectedTopicColorModel().getValue()} />,
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
                  colorModel={modelBuilder.getSelectedTopicColorModel()}
                />
              );
            },
          },
        ],
      },
      {
        icon: <NotInterestedOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-fill-color-default',
          defaultMessage: 'Default fill color',
        }),
        onClick: () => {
          const setValue = modelBuilder.getSelectedTopicColorModel().setValue;
          if (setValue) {
            setValue(undefined);
          }
        },
        selected: () => modelBuilder.getSelectedTopicColorModel().getValue() === undefined,
      },
    ],
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
  };

  const connectionStyleConfiguration: ActionConfig = {
    icon: <ShareOutlined />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-connection-style',
      defaultMessage: 'Connection Style',
    }),
    options: [
      {
        icon: <GestureOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-connection-style-curved-thick',
          defaultMessage: 'Thick Curved',
        }),
        onClick: () => {
          const setValue = modelBuilder.getConnectionStyleModel().setValue;
          if (setValue) {
            setValue(LineType.THICK_CURVED);
          }
        },
        selected: () => modelBuilder.getConnectionStyleModel().getValue() === LineType.THICK_CURVED,
      },
      {
        icon: <ShortcutIconOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-connection-style-arc',
          defaultMessage: 'Arc',
        }),
        onClick: () => {
          const setValue = modelBuilder.getConnectionStyleModel().setValue;
          if (setValue) {
            setValue(LineType.ARC);
          }
        },
        selected: () => modelBuilder.getConnectionStyleModel().getValue() === LineType.ARC,
      },
      {
        icon: <SwapCallsOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-connection-style-curved-thin',
          defaultMessage: 'Thin Curved',
        }),
        onClick: () => {
          const setValue = modelBuilder.getConnectionStyleModel().setValue;
          if (setValue) {
            setValue(LineType.THIN_CURVED);
          }
        },
        selected: () => modelBuilder.getConnectionStyleModel().getValue() === LineType.THIN_CURVED,
      },
      {
        icon: <PolylineOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-connection-style-polyline',
          defaultMessage: 'Simple Polyline',
        }),
        onClick: () => {
          const setValue = modelBuilder.getConnectionStyleModel().setValue;
          if (setValue) {
            setValue(LineType.POLYLINE_MIDDLE);
          }
        },
        selected: () =>
          modelBuilder.getConnectionStyleModel().getValue() === LineType.POLYLINE_MIDDLE,
      },
      {
        icon: <TimelineOutined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-connection-style-polyline-curved',
          defaultMessage: 'Curved Polyline',
        }),
        onClick: () => {
          const setValue = modelBuilder.getConnectionStyleModel().setValue;
          if (setValue) {
            setValue(LineType.POLYLINE_CURVED);
          }
        },
        selected: () =>
          modelBuilder.getConnectionStyleModel().getValue() === LineType.POLYLINE_CURVED,
      },
      null,
      {
        icon: () => <Palette htmlColor={modelBuilder.getConnectionColorModel().getValue()} />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-connection-color',
          defaultMessage: 'Color',
        }),
        options: [
          {
            render: (closeModal) => {
              return (
                <ColorPicker
                  closeModal={closeModal}
                  colorModel={modelBuilder.getConnectionColorModel()}
                />
              );
            },
          },
        ],
      },
      {
        icon: <NotInterestedOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-connection-color-default',
          defaultMessage: 'Default color',
        }),
        onClick: () => {
          const serValue = modelBuilder.getConnectionColorModel().setValue;
          if (serValue) {
            serValue(undefined);
          }
        },
        selected: () => modelBuilder.getConnectionColorModel().getValue() === undefined,
      },
    ],
    disabled: () => {
      const selected = model.getDesignerModel()!.filterSelectedTopics();
      return selected.length === 0;
    },
  };

  /**
   * submenu to manipulate node font
   */
  const fontFormatToolbarConfiguration: ActionConfig = {
    icon: <FontDownloadOutlinedIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-topic-font-style',
      defaultMessage: 'Font Style',
    }),
    options: [
      {
        render: () => <FontFamilySelector fontFamilyModel={modelBuilder.getFontFamilyModel()} />,
      },
      null,
      {
        icon: <TextIncreaseOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-font-bigger',
          defaultMessage: 'Bigger',
        }),
        onClick: () => {
          const switchValue = modelBuilder.getFontSizeModel().switchValue;
          if (switchValue) {
            switchValue(SwitchValueDirection.up);
          }
        },
      },
      {
        icon: <TextDecreaseOutlinedIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-font-smaller',
          defaultMessage: 'Smaller',
        }),
        onClick: () => {
          const switchValue = modelBuilder.getFontSizeModel().switchValue;
          if (switchValue) {
            switchValue(SwitchValueDirection.down);
          }
        },
      },
      null,
      {
        icon: <FormatBoldOutlinedIcon />,
        tooltip: keyTooltip(
          intl.formatMessage({
            id: 'editor-panel.tooltip-topic-font-bold',
            defaultMessage: 'Bold',
          }),
          'B',
        ),
        onClick: modelBuilder.fontWeigthModel().switchValue,
        selected: () => modelBuilder.fontWeigthModel().getValue() === 'bold',
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
        onClick: modelBuilder.getFontStyleModel().switchValue,
        selected: () => modelBuilder.getFontStyleModel().getValue() === 'italic',
      },
      null,
      {
        icon: () => <Palette htmlColor={modelBuilder.getFontColorModel().getValue() as string} />,
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
                  colorModel={modelBuilder.getFontColorModel()}
                />
              );
            },
          },
        ],
      },
      {
        icon: <NotInterestedOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-topic-font-color-default',
          defaultMessage: 'Default color',
        }),
        onClick: () => {
          const setValue = modelBuilder.getFontColorModel().setValue;
          if (setValue) {
            setValue(undefined);
          }
        },
        selected: () => modelBuilder.getFontColorModel().getValue() === undefined,
      },
    ],
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
  };

  /**
   * button to show relation pivot
   */
  const addRelationConfiguration: ActionConfig = {
    icon: <SettingsEthernetIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-add-relationship',
      defaultMessage: 'Add Relationship',
    }),
    onClick: (e) => {
      model.getDesigner().showRelPivot(e);
    },
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
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
    title: intl.formatMessage({ id: 'editor-panel.link-panel-title', defaultMessage: 'Link' }),
    options: [
      {
        render: (closeModal) => (
          <TopicLinkEditor closeModal={closeModal} urlModel={modelBuilder.getLinkModel()} />
        ),
      },
    ],
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
  };

  /**
   * tool for node link edition
   */
  const editThemeConfiguration: ActionConfig = {
    icon: <ColorLensOutlined />,
    tooltip: intl.formatMessage({ id: 'editor-panel.tooltip-theme', defaultMessage: 'Theme' }),
    useClickToClose: true,
    title: intl.formatMessage({ id: 'editor-panel.theme-title', defaultMessage: 'Theme' }),
    options: [
      {
        render: (closeModal) => (
          <ThemeEditor closeModal={closeModal} themeModel={modelBuilder.getThemeModel()} />
        ),
      },
    ],
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
    title: intl.formatMessage({ id: 'editor-panel.note-panel-title', defaultMessage: 'Note' }),
    options: [
      {
        tooltip: intl.formatMessage({
          id: 'editor-panel.note-panel-title',
          defaultMessage: 'Note',
        }),
        render: (closeModal) => (
          <RichTextNoteEditor closeModal={closeModal} noteModel={modelBuilder.getNoteModel()} />
        ),
      },
    ],
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
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
    title: intl.formatMessage({ id: 'editor-panel.icon-title', defaultMessage: 'Icon' }),
    options: [
      {
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-add-icon',
          defaultMessage: 'Add Icon',
        }),
        render: (closeModal) => (
          <IconPicker triggerClose={closeModal} iconModel={modelBuilder.getTopicIconModel()} />
        ),
      },
    ],
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
  };

  const addNodeToolbarConfiguration = {
    icon: <AddCircleOutlineOutlinedIcon />,
    tooltip:
      intl.formatMessage({ id: 'editor-panel.tooltip-add-topic', defaultMessage: 'Add Topic' }) +
      ' (Enter)',
    onClick: () => model.getDesigner().createSiblingForSelectedNode(),
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
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
    connectionStyleConfiguration,
    editIconConfiguration,
    editNoteConfiguration,
    editLinkUrlConfiguration,
    addRelationConfiguration,
    editThemeConfiguration,
  ];
}
