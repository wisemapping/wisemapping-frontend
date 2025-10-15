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
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import LinkIcon from '@mui/icons-material/Link';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { FormattedMessage, useIntl } from 'react-intl';
import { Mindmap } from '@wisemapping/mindplot';
import INodeModel from '@wisemapping/mindplot/src/components/model/INodeModel';
import LinkModel from '@wisemapping/mindplot/src/components/model/LinkModel';
import NoteModel from '@wisemapping/mindplot/src/components/model/NoteModel';
import { OutlineBuilder, OutlineNodeData } from './OutlineBuilder';
import {
  OutlineContainer,
  OutlineNode,
  ExpandButton,
  NodeIcon,
  FeatureIcon,
  NodeText,
  VerticalLine,
  FloatingToolbar,
  NodeWrapper,
  ExpandPlaceholder,
  IconContainer,
  FeatureIconContainer,
  StyledDialogContent,
  CloseButton,
  OutlineContentWrapper,
  CentralTopicTitle,
  EmptyMessage,
  ToolbarButton,
  TooltipContent,
  TooltipTitle,
  TooltipLink,
  StyledDialogPaper,
  popoverPaperStyles,
} from './styled';

interface OutlineViewDialogProps {
  open: boolean;
  onClose: () => void;
  mindmap?: Mindmap;
}

// Create outline builder instance
const outlineBuilder = new OutlineBuilder();

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

        // Build outline data using OutlineBuilder
        const children = outlineBuilder.buildFromCentralTopic(centralTopic);
        setOutlineData(children);
      }
    }
  }, [open, mindmap]);

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
              <Tooltip title={node.linkUrl}>
                <FeatureIcon onMouseEnter={(e) => handleLinkHover(e, node.node)} aria-label="link">
                  <LinkIcon fontSize="small" />
                </FeatureIcon>
              </Tooltip>
            )}

            {node.noteText && (
              <Tooltip
                title={intl.formatMessage({ id: 'outline.has-note', defaultMessage: 'Has note' })}
              >
                <FeatureIcon onMouseEnter={(e) => handleNoteHover(e, node.node)} aria-label="note">
                  <StickyNote2Icon fontSize="small" />
                </FeatureIcon>
              </Tooltip>
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
      <Dialog open={open} onClose={onClose} maxWidth={false} PaperComponent={StyledDialogPaper}>
        <StyledDialogContent>
          <CloseButton onClick={onClose} size="small">
            <CloseIcon />
          </CloseButton>

          <OutlineContainer>
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
            sx: popoverPaperStyles,
            onMouseLeave: handleCloseTooltip,
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
            sx: popoverPaperStyles,
            onMouseLeave: handleCloseTooltip,
          },
        }}
      >
        {selectedNode &&
          dialogType === 'note' &&
          (() => {
            const noteFeature = selectedNode.getFeatures().find((f) => f.getType() === 'note');
            const noteModel = noteFeature as NoteModel;
            const noteText = noteModel ? noteModel.getText() : '';
            const isHtml = noteModel?.getContentType() === 'html';
            return (
              <Box>
                {isHtml ? (
                  <TooltipContent dangerouslySetInnerHTML={{ __html: noteText }} />
                ) : (
                  <TooltipContent>{noteText}</TooltipContent>
                )}
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
