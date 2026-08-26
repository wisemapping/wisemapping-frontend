import React, { ReactElement, useState, useMemo, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import FontIcon from '@mui/icons-material/TextFields';
import PropsIcon from '@mui/icons-material/MoreHoriz';
import CommentIcon from '@mui/icons-material/Comment';

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
import CommentThread from '../inspector/comment-thread';

export interface MobileToolSheetProps {
  open: boolean;
  onClose: () => void;
  model?: Model;
  capability?: Capability;
  mapId?: number | string;
}

export const MobileToolSheet = ({
  open,
  onClose,
  model,
  capability,
  mapId,
}: MobileToolSheetProps): ReactElement => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const designer = model?.getDesigner();
  const designerModel = model?.getDesignerModel();

  const selectedTopics = useMemo(() => {
    return designerModel?.filterSelectedTopics() ?? [];
  }, [designerModel]);

  const selectedRelationships = useMemo(() => {
    return designerModel?.filterSelectedRelationships() ?? [];
  }, [designerModel]);

  const primaryTopic = selectedTopics[0];
  const topicId = primaryTopic?.getId() ? String(primaryTopic.getId()) : undefined;

  const modelBuilder = useMemo(() => {
    return designer ? new NodePropertyValueModelBuilder(designer) : null;
  }, [designer]);

  const noopClose = useCallback(() => {
    // Sheet stays open or controlled via onClose
  }, []);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            maxHeight: '75vh',
            pb: 2,
            boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          },
        },
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Grab handle */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: 'divider',
            borderRadius: 2,
            mx: 'auto',
            mt: 1.5,
            mb: 1,
          }}
        />

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            <FormattedMessage id="editor.mobile.tools_title" defaultMessage="Topic Properties" />
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '12px',
              textTransform: 'none',
              py: 0.5,
            },
          }}
        >
          <Tab icon={<PaletteIcon fontSize="small" />} label="Style" />
          <Tab icon={<FontIcon fontSize="small" />} label="Font" />
          <Tab icon={<PropsIcon fontSize="small" />} label="Props" />
          <Tab icon={<CommentIcon fontSize="small" />} label="Chat" />
        </Tabs>

        {/* Content */}
        <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '55vh' }}>
          {activeTab === 0 && modelBuilder && (
            <>
              {selectedTopics.length > 0 && (
                <TopicStyleEditor
                  closeModal={noopClose}
                  shapeModel={modelBuilder.getTopicShapeModel()}
                  fillColorModel={modelBuilder.getSelectedTopicColorModel()}
                  borderColorModel={modelBuilder.getColorBorderModel()}
                  borderStyleModel={modelBuilder.getBorderStyleModel()}
                  connectionStyleModel={modelBuilder.getConnectionStyleModel()}
                  connectionColorModel={modelBuilder.getConnectionColorModel()}
                />
              )}
              {selectedRelationships.length > 0 && (
                <RelationshipStyleEditor
                  closeModal={noopClose}
                  strokeStyleModel={modelBuilder.getRelationshipStrokeStyleModel()}
                  startArrowModel={modelBuilder.getRelationshipStartArrowModel()}
                  endArrowModel={modelBuilder.getRelationshipEndArrowModel()}
                  colorModel={modelBuilder.getRelationshipColorModel()}
                />
              )}
            </>
          )}

          {activeTab === 1 && modelBuilder && selectedTopics.length > 0 && (
            <TopicFontEditor
              closeModal={noopClose}
              fontFamilyModel={modelBuilder.getFontFamilyModel()}
              fontSizeModel={modelBuilder.getFontSizeModel()}
              fontWeightModel={modelBuilder.fontWeigthModel()}
              fontStyleModel={modelBuilder.getFontStyleModel()}
              fontColorModel={modelBuilder.getFontColorModel()}
              model={model}
            />
          )}

          {activeTab === 2 && modelBuilder && selectedTopics.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TopicIconEditor
                closeModal={noopClose}
                iconModel={modelBuilder.getTopicIconModel()}
              />
              <TopicImagePicker
                triggerClose={noopClose}
                emojiModel={modelBuilder.getImageEmojiCharModel()}
                iconsGalleryModel={modelBuilder.getImageGalleryIconNameModel()}
              />
              <RichTextNoteEditor closeModal={noopClose} noteModel={modelBuilder.getNoteModel()} />
              <TopicLinkEditor closeModal={noopClose} urlModel={modelBuilder.getLinkModel()} />
            </Box>
          )}

          {activeTab === 3 && (
            <CommentThread
              mapId={mapId}
              topicId={topicId}
              readOnly={capability?.isHidden('save')}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileToolSheet;
