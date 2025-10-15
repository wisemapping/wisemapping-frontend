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
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import { IntlShape } from 'react-intl';
import { Topic } from '@wisemapping/mindplot';
import ActionConfig from '../../../classes/action/action-config';
import Editor from '../../../classes/model/editor';
import { IconWithBadgeContainer, LevelBadge } from '../styled';
import { formatTooltip } from '../utils';

// Helper function to get topic depth/level
const getTopicDepth = (topic: Topic): number => {
  let depth = 0;
  let current: Topic | null = topic;
  while (current && current.getParent() !== null) {
    depth++;
    current = current.getParent();
  }
  return depth;
};

// Helper function to expand nodes up to a specific level
const expandToLevel = (model: Editor, targetLevel: number): void => {
  if (!model?.isMapLoadded()) return;

  // First, collapse all nodes to ensure clean state
  model.getDesigner().collapseAllNodes();

  const allTopics = model.getDesigner().getModel().getTopics();
  const topicsToExpand: number[] = [];

  allTopics.forEach((topic) => {
    if (topic.getType() !== 'CentralTopic') {
      const depth = getTopicDepth(topic);
      // Expand topics that are at or below the target level
      if (depth <= targetLevel) {
        topicsToExpand.push(topic.getId());
      }
    }
  });

  if (topicsToExpand.length > 0) {
    model.getDesigner().getActionDispatcher().shrinkBranch(topicsToExpand, false);
  }
};

// Helper function to handle expand by level cycling logic
export const handleExpandByLevel = (
  model: Editor,
  currentLevel: number,
  setExpandLevel: (level: number) => void,
): void => {
  const maxDepth = model.getDesigner().getMindmap().getMaxDepth();

  // Cycle back to 0 when reaching maxDepth - 1 (since first level is always visible)
  if (currentLevel >= maxDepth - 1) {
    model.getDesigner().collapseAllNodes();
    setExpandLevel(0);
  } else {
    const nextLevel = currentLevel + 1;
    setExpandLevel(nextLevel);
    expandToLevel(model, nextLevel);
  }
};

// Helper function to get the actual visible level count (internal level + 1 for always-visible first level)
const getVisibleLevelCount = (internalLevel: number): number => {
  return internalLevel > 0 ? internalLevel + 1 : 0;
};

// Build the expand by level action configuration
export const buildExpandByLevelConfig = (
  model: Editor,
  intl: IntlShape,
  currentExpandLevel: number,
  setExpandLevel: (level: number) => void,
  onInteraction: () => void,
): ActionConfig => {
  return {
    icon: (
      <IconWithBadgeContainer>
        <FormatLineSpacingIcon />
        {currentExpandLevel > 0 && (
          <LevelBadge>{getVisibleLevelCount(currentExpandLevel)}</LevelBadge>
        )}
      </IconWithBadgeContainer>
    ),
    tooltip: formatTooltip(
      intl.formatMessage({
        id: 'visualization-toolbar.tooltip-expand-level',
        defaultMessage: `Expand by Level${currentExpandLevel > 0 ? ` (Level ${getVisibleLevelCount(currentExpandLevel)})` : ''}`,
      }),
      'E',
    ),
    ariaLabel: intl.formatMessage({
      id: 'visualization-toolbar.tooltip-expand-level',
      defaultMessage: 'Expand by Level',
    }),
    onClick: () => {
      handleExpandByLevel(model, currentExpandLevel, setExpandLevel);
      onInteraction();
    },
    disabled: () => !model?.isMapLoadded(),
  };
};
