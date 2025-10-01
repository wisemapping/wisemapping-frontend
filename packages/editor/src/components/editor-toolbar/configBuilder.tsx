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
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import TextureIcon from '@mui/icons-material/Texture';
import RemoveIcon from '@mui/icons-material/Remove';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RelationshipStyleIcon from '../icons/RelationshipStyleIcon';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';

import {
  BorderColorIcon,
  FillColorIcon,
  ConnectionColorIcon,
  RelationshipColorIcon,
  FontColorIcon,
} from './themed-icons';
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
import {
  trackTopicStyleAction,
  trackConnectionStyleAction,
  trackFontFormatAction,
  trackRelationshipAction,
  trackEditorPanelAction,
} from '../../utils/analytics';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';
import CanvasStyleEditor, { CanvasStyle } from '../action-widget/pane/canvas-style-editor';

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
          trackTopicStyleAction('shape_change', 'rectangle');
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
          trackTopicStyleAction('shape_change', 'rounded_rectangle');
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
          trackTopicStyleAction('shape_change', 'line');
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
          trackTopicStyleAction('shape_change', 'ellipse');
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
          trackTopicStyleAction('shape_change', 'none');
          const setValue = modelBuilder.getTopicShapeModel().setValue;
          if (setValue) {
            setValue('none');
          }
        },
        selected: () => modelBuilder.getTopicShapeModel().getValue() === 'none',
      },
      null,
      {
        icon: () => <BorderColorIcon modelValue={modelBuilder.getColorBorderModel().getValue()} />,
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
          trackTopicStyleAction('border_color_reset');
          const setValue = modelBuilder.getColorBorderModel().setValue;
          if (setValue) {
            setValue(undefined);
          }
        },
        selected: () => modelBuilder.getColorBorderModel().getValue() === undefined,
      },
      null,
      {
        icon: () => (
          <FillColorIcon modelValue={modelBuilder.getSelectedTopicColorModel().getValue()} />
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
          trackTopicStyleAction('topic_color_reset');
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
          trackConnectionStyleAction('connection_style_change', 'thick_curved');
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
          trackConnectionStyleAction('connection_style_change', 'arc');
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
          trackConnectionStyleAction('connection_style_change', 'thin_curved');
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
          trackConnectionStyleAction('connection_style_change', 'polyline_middle');
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
          trackConnectionStyleAction('connection_style_change', 'polyline_curved');
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
        icon: () => (
          <ConnectionColorIcon modelValue={modelBuilder.getConnectionColorModel().getValue()} />
        ),
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
          trackConnectionStyleAction('connection_color_reset');
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

  const relationshipStyleConfiguration: ActionConfig = {
    icon: <RelationshipStyleIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-relationship-style',
      defaultMessage: 'Relationship Style',
    }),
    options: [
      {
        icon: <RemoveIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-relationship-stroke-solid',
          defaultMessage: 'Solid Line',
        }),
        onClick: () => {
          trackRelationshipAction('stroke_style_change', 'solid');
          const setValue = modelBuilder.getRelationshipStrokeStyleModel().setValue;
          if (setValue) {
            setValue(StrokeStyle.SOLID);
          }
        },
        selected: () =>
          modelBuilder.getRelationshipStrokeStyleModel().getValue() === StrokeStyle.SOLID,
      },
      {
        icon: <MoreHorizIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-relationship-stroke-dashed',
          defaultMessage: 'Dashed Line',
        }),
        onClick: () => {
          trackRelationshipAction('stroke_style_change', 'dashed');
          const setValue = modelBuilder.getRelationshipStrokeStyleModel().setValue;
          if (setValue) {
            setValue(StrokeStyle.DASHED);
          }
        },
        selected: () =>
          modelBuilder.getRelationshipStrokeStyleModel().getValue() === StrokeStyle.DASHED,
      },
      {
        icon: <FiberManualRecordIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-relationship-stroke-dotted',
          defaultMessage: 'Dotted Line',
        }),
        onClick: () => {
          trackRelationshipAction('stroke_style_change', 'dotted');
          const setValue = modelBuilder.getRelationshipStrokeStyleModel().setValue;
          if (setValue) {
            setValue(StrokeStyle.DOTTED);
          }
        },
        selected: () =>
          modelBuilder.getRelationshipStrokeStyleModel().getValue() === StrokeStyle.DOTTED,
      },
      null,
      {
        icon: <ArrowLeftIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-relationship-arrow-end',
          defaultMessage: 'End Arrow',
        }),
        onClick: () => {
          trackRelationshipAction('arrow_toggle', 'end_arrow');
          const setValue = modelBuilder.getRelationshipEndArrowModel().setValue;
          if (setValue) {
            setValue(!modelBuilder.getRelationshipEndArrowModel().getValue());
          }
        },
        selected: () => modelBuilder.getRelationshipEndArrowModel().getValue(),
      },
      {
        icon: <ArrowRightIcon />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-relationship-arrow-start',
          defaultMessage: 'Start Arrow',
        }),
        onClick: () => {
          trackRelationshipAction('arrow_toggle', 'start_arrow');
          const setValue = modelBuilder.getRelationshipStartArrowModel().setValue;
          if (setValue) {
            setValue(!modelBuilder.getRelationshipStartArrowModel().getValue());
          }
        },
        selected: () => modelBuilder.getRelationshipStartArrowModel().getValue(),
      },
      null,
      {
        icon: () => (
          <RelationshipColorIcon modelValue={modelBuilder.getRelationshipColorModel().getValue()} />
        ),
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-relationship-color',
          defaultMessage: 'Color',
        }),
        options: [
          {
            render: (closeModal) => {
              return (
                <ColorPicker
                  closeModal={closeModal}
                  colorModel={modelBuilder.getRelationshipColorModel()}
                />
              );
            },
          },
        ],
      },
      {
        icon: <NotInterestedOutlined />,
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-relationship-color-default',
          defaultMessage: 'Default color',
        }),
        onClick: () => {
          trackRelationshipAction('relationship_color_reset');
          const setValue = modelBuilder.getRelationshipColorModel().setValue;
          if (setValue) {
            setValue(undefined);
          }
        },
        selected: () => modelBuilder.getRelationshipColorModel().getValue() === undefined,
      },
    ],
    disabled: () => {
      const selected = model.getDesignerModel()!.filterSelectedRelationships();
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
          trackFontFormatAction('font_size_change', 'increase');
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
          trackFontFormatAction('font_size_change', 'decrease');
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
        onClick: () => {
          trackFontFormatAction('font_weight_toggle');
          const switchValue = modelBuilder.fontWeigthModel().switchValue;
          if (switchValue) {
            switchValue();
          }
        },
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
        onClick: () => {
          trackFontFormatAction('font_style_toggle');
          const switchValue = modelBuilder.getFontStyleModel().switchValue;
          if (switchValue) {
            switchValue();
          }
        },
        selected: () => modelBuilder.getFontStyleModel().getValue() === 'italic',
      },
      null,
      {
        icon: () => (
          <FontColorIcon modelValue={modelBuilder.getFontColorModel().getValue() as string} />
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
          trackFontFormatAction('font_color_reset');
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
      trackRelationshipAction('show_relationship_pivot');
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
   * tool for background customization
   */
  const editCanvasStyleConfiguration: ActionConfig = {
    icon: <TextureIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-canvas-style',
      defaultMessage: 'Background',
    }),
    title: intl.formatMessage({
      id: 'editor-panel.canvas-style-title',
      defaultMessage: 'Background',
    }),
    options: [
      {
        render: (closeModal) => (
          <CanvasStyleEditor
            closeModal={closeModal}
            initialStyle={model.getDesigner().getMindmap()?.getCanvasStyle()}
            onStyleChange={(style: CanvasStyle) => {
              model.getDesigner().setCanvasStyle(style);
            }}
          />
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
  const emojiToolbarConfiguration: ActionConfig = {
    icon: <ImageOutlinedIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-topic-emoji',
      defaultMessage: 'Add Imagine',
    }),
    onClick: () => {
      trackTopicStyleAction('emoji_picker_open');
      // This will be handled by the emoji picker modal
    },
    selected: () => modelBuilder.getImageEmojiCharModel().getValue() !== undefined,
    options: [
      {
        render: (closeModal) => {
          return (
            <EmojiPicker
              onEmojiClick={(emoji: EmojiClickData) => {
                console.log('Emoji picker selection:', emoji.emoji);

                // Set the image emoji character
                const setImageEmojiValue = modelBuilder.getImageEmojiCharModel().setValue;
                if (setImageEmojiValue) {
                  console.log('Setting image emoji character to:', emoji.emoji);
                  setImageEmojiValue(emoji.emoji);
                }

                closeModal();
              }}
              lazyLoadEmojis={true}
              autoFocusSearch={true}
              previewConfig={{ showPreview: false }}
              emojiStyle={EmojiStyle.NATIVE}
              skinTonesDisabled
              theme={Theme.AUTO}
            />
          );
        },
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
    onClick: () => {
      trackEditorPanelAction('create_sibling_topic');
      model.getDesigner().createSiblingForSelectedNode();
    },
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
  };

  const deleteNodeToolbarConfiguration = {
    icon: <RemoveCircleOutlineIcon />,
    tooltip:
      intl.formatMessage({
        id: 'editor-panel.tooltip-delete-topic',
        defaultMessage: 'Delete Topic',
      }) + ' (Delete)',
    onClick: () => {
      trackEditorPanelAction('delete_selected_entities');
      model.getDesigner().deleteSelectedEntities();
    },
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
    emojiToolbarConfiguration,
    addRelationConfiguration,
    relationshipStyleConfiguration,
    editCanvasStyleConfiguration,
  ];
}
