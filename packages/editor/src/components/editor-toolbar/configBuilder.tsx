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
import BrushIcon from '@mui/icons-material/Brush';
import FontDownloadOutlinedIcon from '@mui/icons-material/FontDownloadOutlined';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import TextureIcon from '@mui/icons-material/Texture';

import ActionConfig from '../../classes/action/action-config';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import TopicLinkEditor from '../action-widget/pane/topic-link-editor';
import RichTextNoteEditor from '../action-widget/pane/rich-text-note-editor';
import TopicImagePicker from '../action-widget/pane/topic-image-picker';
import TopicStyleEditor from '../action-widget/pane/topic-style-editor';
import TopicFontEditor from '../action-widget/pane/topic-font-editor';
import RelationshipStyleEditor from '../action-widget/pane/relationship-style-editor';
import RelationshipStyleIcon from '../icons/RelationshipStyleIcon';
import TopicIconEditor from '../action-widget/pane/topic-icon-editor';
import Editor from '../../classes/model/editor';
import { IntlShape } from 'react-intl';
import { trackRelationshipAction, trackEditorPanelAction } from '../../utils/analytics';
import CanvasStyleEditor, { CanvasStyle } from '../action-widget/pane/canvas-style-editor';

const keyTooltip = (msg: string, key: string): string => {
  const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return `${msg} (${isMac ? '⌘' : 'Ctrl'} + ${key})`;
};

export function buildEditorPanelConfig(model: Editor, intl: IntlShape): ActionConfig[] {
  const modelBuilder = new NodePropertyValueModelBuilder(model.getDesigner());

  const styleConfiguration: ActionConfig = {
    icon: <BrushIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-unified-styling',
      defaultMessage: 'Style Topic & Connections',
    }),
    options: [
      {
        render: (closeModal) => {
          trackEditorPanelAction('open_topic_style_editor');
          return (
            <TopicStyleEditor
              closeModal={closeModal}
              shapeModel={modelBuilder.getTopicShapeModel()}
              fillColorModel={modelBuilder.getSelectedTopicColorModel()}
              borderColorModel={modelBuilder.getColorBorderModel()}
              borderStyleModel={modelBuilder.getBorderStyleModel()}
              connectionStyleModel={modelBuilder.getConnectionStyleModel()}
              connectionColorModel={modelBuilder.getConnectionColorModel()}
            />
          );
        },
      },
    ],
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
  };

  const relationshipStyleConfiguration: ActionConfig = {
    icon: <RelationshipStyleIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-relationship-style',
      defaultMessage: 'Relationship Style',
    }),
    options: [
      {
        render: (closeModal) => {
          trackEditorPanelAction('open_relationship_style_editor');
          return (
            <RelationshipStyleEditor
              closeModal={closeModal}
              strokeStyleModel={modelBuilder.getRelationshipStrokeStyleModel()}
              startArrowModel={modelBuilder.getRelationshipStartArrowModel()}
              endArrowModel={modelBuilder.getRelationshipEndArrowModel()}
              colorModel={modelBuilder.getRelationshipColorModel()}
            />
          );
        },
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
        render: (closeModal) => {
          trackEditorPanelAction('open_font_style_editor');
          return (
            <TopicFontEditor
              closeModal={closeModal}
              fontFamilyModel={modelBuilder.getFontFamilyModel()}
              fontSizeModel={modelBuilder.getFontSizeModel()}
              fontWeightModel={modelBuilder.fontWeigthModel()}
              fontStyleModel={modelBuilder.getFontStyleModel()}
              fontColorModel={modelBuilder.getFontColorModel()}
              // @todo: This does not seem correct.
              model={model}
            />
          );
        },
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
    options: [
      {
        render: (closeModal) => {
          trackEditorPanelAction('open_link_editor');
          return <TopicLinkEditor closeModal={closeModal} urlModel={modelBuilder.getLinkModel()} />;
        },
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
    options: [
      {
        render: (closeModal) => {
          trackEditorPanelAction('open_canvas_style_editor');
          return (
            <CanvasStyleEditor
              closeModal={closeModal}
              initialStyle={
                model.getDesigner().getMindmap()?.getCanvasStyle() as Partial<CanvasStyle>
              }
              onStyleChange={(style: Partial<CanvasStyle>) => {
                model.getDesigner().setCanvasStyle(style);
              }}
            />
          );
        },
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
    options: [
      {
        tooltip: intl.formatMessage({
          id: 'editor-panel.note-panel-title',
          defaultMessage: 'Note',
        }),
        render: (closeModal) => {
          trackEditorPanelAction('open_note_editor');
          return (
            <RichTextNoteEditor closeModal={closeModal} noteModel={modelBuilder.getNoteModel()} />
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
    options: [
      {
        render: (closeModal) => {
          trackEditorPanelAction('open_icon_editor');
          return (
            <TopicIconEditor closeModal={closeModal} iconModel={modelBuilder.getTopicIconModel()} />
          );
        },
      },
    ],
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
  };

  /**
   * tool for topic image selection
   */
  const editTopicImageConfiguration: ActionConfig = {
    icon: <ImageOutlinedIcon />,
    tooltip: intl.formatMessage({
      id: 'editor-panel.tooltip-add-topic-image',
      defaultMessage: 'Add Topic Image',
    }),
    options: [
      {
        tooltip: intl.formatMessage({
          id: 'editor-panel.tooltip-add-topic-image',
          defaultMessage: 'Add Topic Image',
        }),
        render: (closeModal) => {
          trackEditorPanelAction('open_topic_image_editor');
          return (
            <TopicImagePicker
              triggerClose={closeModal}
              emojiModel={modelBuilder.getImageEmojiCharModel()}
              iconsGalleryModel={modelBuilder.getImageGalleryIconNameModel()}
            />
          );
        },
      },
    ],
    disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0,
  };

  return [
    styleConfiguration,
    fontFormatToolbarConfiguration,
    editIconConfiguration,
    editTopicImageConfiguration,
    editNoteConfiguration,
    editLinkUrlConfiguration,
    addRelationConfiguration,
    relationshipStyleConfiguration,
    editCanvasStyleConfiguration,
  ];
}
