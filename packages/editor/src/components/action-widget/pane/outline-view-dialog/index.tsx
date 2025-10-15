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

import React, { ReactElement, useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import { Mindmap } from '@wisemapping/mindplot';
import INodeModel from '@wisemapping/mindplot/src/components/model/INodeModel';
import LinkModel from '@wisemapping/mindplot/src/components/model/LinkModel';
import NoteModel from '@wisemapping/mindplot/src/components/model/NoteModel';
import SvgIconModel from '@wisemapping/mindplot/src/components/model/SvgIconModel';
import ContentType from '@wisemapping/mindplot/src/components/ContentType';
import LinksImage from '@wisemapping/mindplot/assets/icons/links.svg';
import NotesImage from '@wisemapping/mindplot/assets/icons/notes.svg';

const OutlineContainer = styled(Box)(({ theme }) => ({
  padding: '10px 118px 10px 118px', // 10px top/bottom, 118px left/right (144px - 26px from DialogContent)
  maxHeight: '100%',
  height: '100%',
  overflow: 'auto',
  fontFamily: 'Figtree, Segoe UI, Helvetica, Arial, sans-serif',
  fontSize: '14px',
  lineHeight: '1.6',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  position: 'relative',
}));

const OutlineNode = styled(Box)<{ level: number }>(({ theme, level }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: `${theme.spacing(0.5)} 0`,
  paddingLeft: theme.spacing(level * 2),
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.25),
  marginRight: theme.spacing(0.5),
  width: '20px',
  height: '20px',
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
}));

const NodeIcon = styled('img')(({ theme }) => ({
  marginRight: theme.spacing(0.5),
  width: '16px',
  height: '16px',
  display: 'inline-block',
  verticalAlign: 'middle',
}));

const FeatureIconImg = styled('img')(({ theme }) => ({
  marginLeft: theme.spacing(1),
  width: '26px',
  height: '26px',
  cursor: 'pointer',
  opacity: 0.7,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '4px',
  padding: '3px',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    opacity: 1,
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-1px)',
    borderColor: theme.palette.text.secondary,
  },
}));

const NodeText = styled(Typography)<{ level: number }>(({ theme, level }) => ({
  fontWeight: level === 0 ? 600 : 400,
  display: 'inline',
  fontFamily: 'Figtree, Segoe UI, Helvetica, Arial, sans-serif',
  fontSize: level === 0 ? '17px' : level === 1 ? '17px' : '15px',
  color: theme.palette.text.primary,
  lineHeight: 1.4,
}));

const VerticalLine = styled(Box)<{ level: number; hasChildren: boolean }>(
  ({ theme, level, hasChildren }) => ({
    position: 'absolute',
    left: theme.spacing(level * 2 + 0.5),
    top: hasChildren ? '20px' : '10px',
    bottom: hasChildren ? '0' : '10px',
    width: '1px',
    borderLeft: `1px dashed ${theme.palette.divider}`,
    pointerEvents: 'none',
  }),
);

const FloatingToolbar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(3),
  left: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(0.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  padding: theme.spacing(1),
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  animation: 'fadeIn 0.25s ease-out',
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
}));

const NodeWrapper = styled(Box)({
  position: 'relative',
});

const ExpandPlaceholder = styled(Box)({
  width: '28px',
  marginRight: '4px',
});

const IconContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  marginRight: '4px',
});

const FeatureIconContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  marginLeft: 'auto',
  justifyContent: 'flex-end',
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '26px',
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
}));

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
});

const OutlineContentWrapper = styled(Box)({
  paddingLeft: 18,
});

const CentralTopicTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Figtree, Segoe UI, Helvetica, Arial, sans-serif',
  fontSize: '28px',
  fontWeight: 600,
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  textAlign: 'left',
  marginLeft: 0,
  paddingLeft: theme.spacing(2),
}));

const EmptyMessage = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const ToolbarButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TooltipContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
  padding: '20px 20px 12px 20px',
  wordWrap: 'break-word',
  textAlign: 'left',
  fontSize: '14px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: 1.6,
  whiteSpace: 'pre-line',
  color: theme.palette.text.primary,
  borderRadius: '12px 12px 0 0',
}));

const TooltipTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: 'transparent',
  fontSize: '10px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textTransform: 'uppercase',
  padding: '6px 16px 8px 16px',
  textAlign: 'right',
  fontWeight: 500,
  letterSpacing: '0.8px',
  color: theme.palette.text.secondary,
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: '8px',
  opacity: 0.8,
}));

const TooltipLink = styled('a')(({ theme }) => ({
  display: 'inline-block',
  padding: '10px 14px',
  margin: '6px 0',
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #3a3a00 0%, #4a4a00 100%)'
      : 'linear-gradient(135deg, #fff8f0 0%, #fef5e7 100%)',
  border: '1px solid #ffa800',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textDecoration: 'none',
  color: '#ffa800',
  wordBreak: 'break-all',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 4px rgba(255, 168, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: 'linear-gradient(135deg, #ffa800 0%, #e57500 100%)',
    color: '#ffffff',
    borderColor: '#e57500',
    textDecoration: 'none',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(255, 168, 0, 0.3)',
  },
}));

interface OutlineNodeData {
  id: string;
  text: string;
  level: number;
  children: OutlineNodeData[];
  iconUrls: string[];
  linkUrl?: string;
  noteText?: string;
  node: INodeModel;
  isExpanded: boolean;
}

interface OutlineViewDialogProps {
  open: boolean;
  onClose: () => void;
  mindmap?: Mindmap;
}

// Helper function to get icon URL (same logic as SvgImageIcon.getImageUrl)
const getIconUrl = (iconId: string): string => {
  try {
    // Dynamically require the icon
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@wisemapping/mindplot/assets/icons/${iconId}.svg`);
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(`@wisemapping/mindplot/assets/icons/${iconId}.png`);
    } catch {
      console.warn(`Icon not found: ${iconId}`);
      return '';
    }
  }
};

const OutlineViewDialog = ({ open, onClose, mindmap }: OutlineViewDialogProps): ReactElement => {
  const intl = useIntl();
  const [outlineData, setOutlineData] = useState<OutlineNodeData[]>([]);
  const [centralTopicTitle, setCentralTopicTitle] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<INodeModel | null>(null);
  const [dialogType, setDialogType] = useState<'link' | 'note' | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (open && mindmap) {
      const centralTopic = mindmap.getCentralTopic();
      if (centralTopic) {
        // Set the central topic as title
        setCentralTopicTitle(centralTopic.getText() || 'Untitled Map');

        // Build outline data starting from level 0 (children of central topic)
        const children = centralTopic
          .getChildren()
          .filter((child) => child.getText() !== undefined)
          .map((child) => buildOutlineData(child, 0));

        setOutlineData(children);
      }
    }
  }, [open, mindmap]);

  const buildOutlineData = (node: INodeModel, level: number): OutlineNodeData => {
    const features = node.getFeatures();

    // Extract icon URLs (only SVG icons, not images)
    const iconUrls: string[] = [];
    features.forEach((feature) => {
      const type = feature.getType();
      if (type === 'icon') {
        const iconModel = feature as SvgIconModel;
        const iconType = iconModel.getIconType();
        const iconUrl = getIconUrl(iconType);
        if (iconUrl) {
          iconUrls.push(iconUrl);
        }
      }
    });

    // Extract link URL
    let linkUrl: string | undefined;
    const linkFeature = features.find((f) => f.getType() === 'link');
    if (linkFeature) {
      linkUrl = (linkFeature as LinkModel).getUrl();
    }

    // Extract note text
    let noteText: string | undefined;
    const noteFeature = features.find((f) => f.getType() === 'note');
    if (noteFeature) {
      noteText = (noteFeature as NoteModel).getText();
    }

    const nodeText =
      node.getContentType() === ContentType.HTML ? node.getPlainText() : node.getText();

    const children = node
      .getChildren()
      .filter((child) => child.getText() !== undefined)
      .map((child) => buildOutlineData(child, level + 1));

    return {
      id: `${node.getId()}-${level}`,
      text: nodeText || '',
      level,
      children,
      iconUrls,
      linkUrl,
      noteText,
      node,
      isExpanded: level < 2, // Auto-expand first two levels
    };
  };

  const toggleExpanded = (nodeId: string) => {
    const updateNode = (nodes: OutlineNodeData[]): OutlineNodeData[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setOutlineData(updateNode(outlineData));
  };

  const expandAll = () => {
    const updateNode = (nodes: OutlineNodeData[]): OutlineNodeData[] => {
      return nodes.map((node) => {
        const updatedChildren = node.children.length > 0 ? updateNode(node.children) : [];
        return { ...node, isExpanded: true, children: updatedChildren };
      });
    };
    setOutlineData(updateNode(outlineData));
  };

  const collapseAll = () => {
    const updateNode = (nodes: OutlineNodeData[]): OutlineNodeData[] => {
      return nodes.map((node) => {
        const updatedChildren = node.children.length > 0 ? updateNode(node.children) : [];
        return { ...node, isExpanded: false, children: updatedChildren };
      });
    };
    setOutlineData(updateNode(outlineData));
  };

  const handleLinkHover = (event: React.MouseEvent<HTMLElement>, node: INodeModel) => {
    setAnchorEl(event.currentTarget);
    setSelectedNode(node);
    setDialogType('link');
  };

  const handleNoteHover = (event: React.MouseEvent<HTMLElement>, node: INodeModel) => {
    setAnchorEl(event.currentTarget);
    setSelectedNode(node);
    setDialogType('note');
  };

  const handleCloseTooltip = () => {
    setAnchorEl(null);
    setSelectedNode(null);
    setDialogType(null);
  };

  const renderNode = (node: OutlineNodeData): ReactElement => {
    const hasChildren = node.children.length > 0;
    const showExpandButton = hasChildren;

    return (
      <NodeWrapper key={node.id}>
        {node.level > 0 && (
          <VerticalLine level={node.level} hasChildren={hasChildren && node.isExpanded} />
        )}

        <OutlineNode level={node.level}>
          {/* Left side: Expand/collapse button */}
          {showExpandButton ? (
            <ExpandButton
              onClick={() => toggleExpanded(node.id)}
              aria-label={
                node.isExpanded
                  ? intl.formatMessage({ id: 'outline.collapse', defaultMessage: 'Collapse' })
                  : intl.formatMessage({ id: 'outline.expand', defaultMessage: 'Expand' })
              }
            >
              {node.isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </ExpandButton>
          ) : (
            <ExpandPlaceholder />
          )}

          {/* Left side: Topic icons */}
          {node.iconUrls.length > 0 && (
            <IconContainer>
              {node.iconUrls.map((iconUrl, index) => (
                <NodeIcon
                  key={index}
                  src={iconUrl}
                  alt="icon"
                  onError={(e) => {
                    console.warn('Failed to load icon:', iconUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ))}
            </IconContainer>
          )}

          {/* Center: Node text */}
          <NodeText variant="body2" level={node.level}>
            {node.text}
          </NodeText>

          {/* Right side: Feature icons (links and notes) - aligned to right */}
          <FeatureIconContainer>
            {node.linkUrl && (
              <FeatureIconImg
                src={LinksImage}
                alt="link"
                title={node.linkUrl}
                onMouseEnter={(e) => handleLinkHover(e, node.node)}
              />
            )}

            {node.noteText && (
              <FeatureIconImg
                src={NotesImage}
                alt="note"
                title={intl.formatMessage({ id: 'outline.has-note', defaultMessage: 'Has note' })}
                onMouseEnter={(e) => handleNoteHover(e, node.node)}
              />
            )}
          </FeatureIconContainer>
        </OutlineNode>

        {hasChildren && (
          <Collapse in={node.isExpanded}>
            <Box>{node.children.map((child) => renderNode(child))}</Box>
          </Collapse>
        )}
      </NodeWrapper>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth
        fullScreen
        PaperProps={{
          sx: {
            margin: '12.5vh 12.5vw', // Top/bottom and left/right margins
            height: '75vh', // 75% of viewport height
            width: '75vw',
            maxWidth: 'none',
            maxHeight: 'none',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'background.paper',
          },
        }}
      >
        <StyledDialogContent>
          <CloseButton onClick={onClose} size="small">
            <CloseIcon />
          </CloseButton>

          <OutlineContainer sx={{ paddingLeft: 0 }}>
            <OutlineContentWrapper>
              {/* Central Topic as Title - now part of scrollable content */}
              {centralTopicTitle && (
                <CentralTopicTitle variant="h4">{centralTopicTitle}</CentralTopicTitle>
              )}

              {outlineData.length > 0 ? (
                outlineData.map((node) => renderNode(node))
              ) : (
                <EmptyMessage variant="body2" color="text.secondary">
                  <FormattedMessage id="outline.empty" defaultMessage="No content to display" />
                </EmptyMessage>
              )}
            </OutlineContentWrapper>
          </OutlineContainer>

          {/* Floating Toolbar for Expand/Collapse All */}
          <FloatingToolbar>
            <Tooltip title={<FormattedMessage id="outline.expand" defaultMessage="Expand All" />}>
              <ToolbarButton
                size="small"
                onClick={expandAll}
                aria-label={intl.formatMessage({
                  id: 'outline.expand',
                  defaultMessage: 'Expand All',
                })}
              >
                <UnfoldMoreIcon fontSize="small" />
              </ToolbarButton>
            </Tooltip>
            <Tooltip
              title={<FormattedMessage id="outline.collapse" defaultMessage="Collapse All" />}
            >
              <ToolbarButton
                size="small"
                onClick={collapseAll}
                aria-label={intl.formatMessage({
                  id: 'outline.collapse',
                  defaultMessage: 'Collapse All',
                })}
              >
                <UnfoldLessIcon fontSize="small" />
              </ToolbarButton>
            </Tooltip>
          </FloatingToolbar>
        </StyledDialogContent>
      </Dialog>

      {/* Link Tooltip Popover */}
      <Popover
        open={Boolean(anchorEl && selectedNode && dialogType === 'link')}
        anchorEl={anchorEl}
        onClose={handleCloseTooltip}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            onMouseLeave: handleCloseTooltip,
            sx: {
              backgroundColor: 'transparent',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              backdropFilter: 'blur(8px)',
              minWidth: '300px',
              maxWidth: '450px',
              overflow: 'hidden',
            },
          },
        }}
      >
        {selectedNode &&
          dialogType === 'link' &&
          (() => {
            const linkFeature = selectedNode.getFeatures().find((f) => f.getType() === 'link');
            const linkUrl = linkFeature ? (linkFeature as LinkModel).getUrl() : '';
            return (
              <Box>
                <TooltipContent>
                  <TooltipLink href={linkUrl} target="_blank" rel="noopener noreferrer">
                    {linkUrl}
                  </TooltipLink>
                </TooltipContent>
                <TooltipTitle>
                  <FormattedMessage id="outline.link" defaultMessage="Link" />
                </TooltipTitle>
              </Box>
            );
          })()}
      </Popover>

      {/* Note Tooltip Popover */}
      <Popover
        open={Boolean(anchorEl && selectedNode && dialogType === 'note')}
        anchorEl={anchorEl}
        onClose={handleCloseTooltip}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            onMouseLeave: handleCloseTooltip,
            sx: {
              backgroundColor: 'transparent',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              backdropFilter: 'blur(8px)',
              minWidth: '300px',
              maxWidth: '450px',
              overflow: 'hidden',
            },
          },
        }}
      >
        {selectedNode &&
          dialogType === 'note' &&
          (() => {
            const noteFeature = selectedNode.getFeatures().find((f) => f.getType() === 'note');
            const noteText = noteFeature ? (noteFeature as NoteModel).getText() : '';
            return (
              <Box>
                <TooltipContent>{noteText}</TooltipContent>
                <TooltipTitle>
                  <FormattedMessage id="outline.note" defaultMessage="Note" />
                </TooltipTitle>
              </Box>
            );
          })()}
      </Popover>
    </>
  );
};

export default OutlineViewDialog;
