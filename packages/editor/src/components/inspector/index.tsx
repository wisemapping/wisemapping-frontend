import React, { ReactElement, useState, useEffect, useMemo, useCallback } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CommentIcon from '@mui/icons-material/Comment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PersonIcon from '@mui/icons-material/Person';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Model from '../../classes/model/editor';
import Capability from '../../classes/action/capability';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import TopicStyleEditor from '../action-widget/pane/topic-style-editor';
import TopicFontEditor from '../action-widget/pane/topic-font-editor';
import TopicIconEditor from '../action-widget/pane/topic-icon-editor';
import TopicImagePicker from '../action-widget/pane/topic-image-picker';
import RichTextNoteEditor from '../action-widget/pane/rich-text-note-editor';
import TopicLinkEditor from '../action-widget/pane/topic-link-editor';
import RelationshipStyleEditor from '../action-widget/pane/relationship-style-editor';
import CanvasStyleEditor, { CanvasStyle } from '../action-widget/pane/canvas-style-editor';
import CommentThread from './comment-thread';
import {
  InspectorContainer,
  InspectorHeader,
  InspectorTitle,
  InspectorTabs,
  InspectorTab,
  InspectorBody,
  SectionCard,
  SectionTitle,
  EmptySelectionState,
  CollapsedRail,
  CollapsedRailButton,
} from './style';

export interface InspectorProps {
  model?: Model;
  capability?: Capability;
  open?: boolean;
  onClose?: () => void;
  onToggleOpen?: () => void;
  mapId?: number | string;
  lockedByFullName?: string | null;
}

type TabKey = 'style' | 'font' | 'properties' | 'comments';

export const Inspector = ({
  model,
  capability,
  open = true,
  onClose,
  onToggleOpen,
  mapId,
  lockedByFullName,
}: InspectorProps): ReactElement => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<TabKey>('style');
  const [selectionVersion, setSelectionVersion] = useState<number>(0);

  const designer = model?.getDesigner();
  const designerModel = model?.getDesignerModel();

  // Listen to designer events to track selection changes
  useEffect(() => {
    if (!designer) return;

    const handleUpdate = () => {
      setSelectionVersion((v) => v + 1);
    };

    designer.addEvent('modelUpdate', handleUpdate);
    designer.addEvent('loadSuccess', handleUpdate);
    designer.addEvent('onfocus', handleUpdate);
    designer.addEvent('onblur', handleUpdate);

    return () => {
      designer.removeEvent('modelUpdate', handleUpdate);
      designer.removeEvent('loadSuccess', handleUpdate);
      designer.removeEvent('onfocus', handleUpdate);
      designer.removeEvent('onblur', handleUpdate);
    };
  }, [designer]);

  const selectedTopics = useMemo(() => {
    return designerModel?.filterSelectedTopics() ?? [];
  }, [designerModel, selectionVersion]);

  const selectedRelationships = useMemo(() => {
    return designerModel?.filterSelectedRelationships() ?? [];
  }, [designerModel, selectionVersion]);

  const hasSelection = selectedTopics.length > 0 || selectedRelationships.length > 0;
  const primaryTopic = selectedTopics[0];
  const topicId = primaryTopic?.getId() ? String(primaryTopic.getId()) : undefined;

  const modelBuilder = useMemo(() => {
    return designer ? new NodePropertyValueModelBuilder(designer) : null;
  }, [designer]);

  const noopClose = useCallback(() => {
    // Docked inspector stays open on value edits
  }, []);

  const toggleHandler = onToggleOpen || onClose;

  return (
    <InspectorContainer $open={open} data-testid="editor-inspector">
      {!open ? (
        <CollapsedRail data-testid="editor-inspector-collapsed">
          <Tooltip
            title={intl.formatMessage({
              id: 'editor.inspector.expand',
              defaultMessage: 'Expand Inspector',
            })}
            placement="left"
          >
            <CollapsedRailButton
              onClick={toggleHandler}
              aria-label="Expand Inspector"
              data-testid="expand-inspector-button"
            >
              <ChevronLeftIcon fontSize="small" />
            </CollapsedRailButton>
          </Tooltip>
          <Divider flexItem sx={{ my: 0.5 }} />
          <Tooltip
            title={intl.formatMessage({
              id: 'editor.inspector.tab.style',
              defaultMessage: 'Style',
            })}
            placement="left"
          >
            <CollapsedRailButton
              $active={activeTab === 'style'}
              onClick={() => {
                setActiveTab('style');
                onToggleOpen?.();
              }}
              aria-label="Style"
              data-testid="inspector-rail-style"
            >
              <PaletteOutlinedIcon fontSize="small" />
            </CollapsedRailButton>
          </Tooltip>
          <Tooltip
            title={intl.formatMessage({
              id: 'editor.inspector.tab.font',
              defaultMessage: 'Font',
            })}
            placement="left"
          >
            <CollapsedRailButton
              $active={activeTab === 'font'}
              onClick={() => {
                setActiveTab('font');
                onToggleOpen?.();
              }}
              aria-label="Font"
              data-testid="inspector-rail-font"
            >
              <TextFieldsIcon fontSize="small" />
            </CollapsedRailButton>
          </Tooltip>
          <Tooltip
            title={intl.formatMessage({
              id: 'editor.inspector.tab.props',
              defaultMessage: 'More',
            })}
            placement="left"
          >
            <CollapsedRailButton
              $active={activeTab === 'properties'}
              onClick={() => {
                setActiveTab('properties');
                onToggleOpen?.();
              }}
              aria-label="More"
              data-testid="inspector-rail-props"
            >
              <MoreHorizIcon fontSize="small" />
            </CollapsedRailButton>
          </Tooltip>
          <Tooltip
            title={intl.formatMessage({
              id: 'editor.inspector.tab.comments',
              defaultMessage: 'Comments',
            })}
            placement="left"
          >
            <CollapsedRailButton
              $active={activeTab === 'comments'}
              onClick={() => {
                setActiveTab('comments');
                onToggleOpen?.();
              }}
              aria-label="Comments"
              data-testid="inspector-rail-comments"
            >
              <CommentIcon fontSize="small" />
            </CollapsedRailButton>
          </Tooltip>
        </CollapsedRail>
      ) : (
        <>
          <InspectorHeader>
            <InspectorTitle>
              <FormattedMessage id="editor.inspector.title" defaultMessage="Inspector" />
              {lockedByFullName && (
                <Chip
                  size="small"
                  icon={<PersonIcon />}
                  label={intl.formatMessage(
                    { id: 'editor.presence.editing', defaultMessage: '{name} is editing' },
                    { name: lockedByFullName },
                  )}
                  color="warning"
                  variant="outlined"
                  sx={{ height: 22, fontSize: 11 }}
                />
              )}
            </InspectorTitle>
            {toggleHandler && (
              <Tooltip
                title={intl.formatMessage({
                  id: 'editor.inspector.collapse',
                  defaultMessage: 'Collapse Inspector',
                })}
                placement="left"
              >
                <IconButton
                  size="small"
                  onClick={toggleHandler}
                  aria-label="Collapse Inspector"
                  data-testid="collapse-inspector-button"
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </InspectorHeader>

          <InspectorTabs>
            <InspectorTab
              $active={activeTab === 'style'}
              onClick={() => setActiveTab('style')}
              title="Style"
            >
              <PaletteOutlinedIcon fontSize="small" />
              <FormattedMessage id="editor.inspector.tab.style" defaultMessage="Style" />
            </InspectorTab>
            <InspectorTab
              $active={activeTab === 'font'}
              onClick={() => setActiveTab('font')}
              title="Font"
            >
              <TextFieldsIcon fontSize="small" />
              <FormattedMessage id="editor.inspector.tab.font" defaultMessage="Font" />
            </InspectorTab>
            <InspectorTab
              $active={activeTab === 'properties'}
              onClick={() => setActiveTab('properties')}
              title="Props"
            >
              <MoreHorizIcon fontSize="small" />
              <FormattedMessage id="editor.inspector.tab.props" defaultMessage="More" />
            </InspectorTab>
            <InspectorTab
              $active={activeTab === 'comments'}
              onClick={() => setActiveTab('comments')}
              title="Comments"
            >
              <CommentIcon fontSize="small" />
              <FormattedMessage id="editor.inspector.tab.comments" defaultMessage="Comments" />
            </InspectorTab>
          </InspectorTabs>

          <InspectorBody>
            {activeTab === 'comments' && (
              <CommentThread
                mapId={mapId}
                topicId={topicId}
                readOnly={capability?.isHidden('save')}
              />
            )}

            {activeTab !== 'comments' && !hasSelection && (
              <EmptySelectionState>
                <SectionCard style={{ width: '100%' }}>
                  <SectionTitle>
                    <FormattedMessage
                      id="editor.inspector.canvas_style"
                      defaultMessage="Canvas Style"
                    />
                  </SectionTitle>
                  {model && (
                    <CanvasStyleEditor
                      closeModal={noopClose}
                      initialStyle={
                        model.getDesigner()?.getMindmap()?.getCanvasStyle() as Partial<CanvasStyle>
                      }
                      onStyleChange={(style: Partial<CanvasStyle>) => {
                        model.getDesigner()?.setCanvasStyle(style);
                      }}
                    />
                  )}
                </SectionCard>
                <FormattedMessage
                  id="editor.inspector.no_selection"
                  defaultMessage="Select a topic or connection to edit its properties."
                />
              </EmptySelectionState>
            )}

            {activeTab === 'style' && hasSelection && modelBuilder && (
              <>
                {selectedTopics.length > 0 && (
                  <SectionCard>
                    <SectionTitle>
                      <FormattedMessage
                        id="editor.inspector.topic_style"
                        defaultMessage="Topic Shape & Colors"
                      />
                    </SectionTitle>
                    <TopicStyleEditor
                      closeModal={noopClose}
                      shapeModel={modelBuilder.getTopicShapeModel()}
                      fillColorModel={modelBuilder.getSelectedTopicColorModel()}
                      borderColorModel={modelBuilder.getColorBorderModel()}
                      borderStyleModel={modelBuilder.getBorderStyleModel()}
                      connectionStyleModel={modelBuilder.getConnectionStyleModel()}
                      connectionColorModel={modelBuilder.getConnectionColorModel()}
                    />
                  </SectionCard>
                )}

                {selectedRelationships.length > 0 && (
                  <SectionCard>
                    <SectionTitle>
                      <FormattedMessage
                        id="editor.inspector.relationship_style"
                        defaultMessage="Relationship"
                      />
                    </SectionTitle>
                    <RelationshipStyleEditor
                      closeModal={noopClose}
                      strokeStyleModel={modelBuilder.getRelationshipStrokeStyleModel()}
                      startArrowModel={modelBuilder.getRelationshipStartArrowModel()}
                      endArrowModel={modelBuilder.getRelationshipEndArrowModel()}
                      colorModel={modelBuilder.getRelationshipColorModel()}
                    />
                  </SectionCard>
                )}
              </>
            )}

            {activeTab === 'font' && hasSelection && modelBuilder && selectedTopics.length > 0 && (
              <SectionCard>
                <SectionTitle>
                  <FormattedMessage id="editor.inspector.font_style" defaultMessage="Typography" />
                </SectionTitle>
                <TopicFontEditor
                  closeModal={noopClose}
                  fontFamilyModel={modelBuilder.getFontFamilyModel()}
                  fontSizeModel={modelBuilder.getFontSizeModel()}
                  fontWeightModel={modelBuilder.fontWeigthModel()}
                  fontStyleModel={modelBuilder.getFontStyleModel()}
                  fontColorModel={modelBuilder.getFontColorModel()}
                  model={model}
                />
              </SectionCard>
            )}

            {activeTab === 'properties' &&
              hasSelection &&
              modelBuilder &&
              selectedTopics.length > 0 && (
                <>
                  <SectionCard>
                    <SectionTitle>
                      <FormattedMessage id="editor.inspector.icons" defaultMessage="Topic Icons" />
                    </SectionTitle>
                    <TopicIconEditor
                      closeModal={noopClose}
                      iconModel={modelBuilder.getTopicIconModel()}
                    />
                  </SectionCard>

                  <SectionCard>
                    <SectionTitle>
                      <FormattedMessage id="editor.inspector.images" defaultMessage="Topic Image" />
                    </SectionTitle>
                    <TopicImagePicker
                      triggerClose={noopClose}
                      emojiModel={modelBuilder.getImageEmojiCharModel()}
                      iconsGalleryModel={modelBuilder.getImageGalleryIconNameModel()}
                    />
                  </SectionCard>

                  <SectionCard>
                    <SectionTitle>
                      <FormattedMessage id="editor.inspector.notes" defaultMessage="Notes" />
                    </SectionTitle>
                    <RichTextNoteEditor
                      closeModal={noopClose}
                      noteModel={modelBuilder.getNoteModel()}
                    />
                  </SectionCard>

                  <SectionCard>
                    <SectionTitle>
                      <FormattedMessage id="editor.inspector.links" defaultMessage="Link URL" />
                    </SectionTitle>
                    <TopicLinkEditor
                      closeModal={noopClose}
                      urlModel={modelBuilder.getLinkModel()}
                    />
                  </SectionCard>
                </>
              )}
          </InspectorBody>
        </>
      )}
    </InspectorContainer>
  );
};

export default Inspector;
