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

import { INodeModel, SvgImageIcon, ContentType } from '@wisemapping/mindplot';

export interface OutlineNodeData {
  id: string;
  text: string;
  level: number;
  children: OutlineNodeData[];
  iconUrls: string[];
  emojiChars: string[];
  linkUrl?: string;
  noteText?: string;
  node: INodeModel;
  isExpanded: boolean;
}

export interface OutlineBuilderConfig {
  autoExpandLevels?: number;
}

/**
 * Responsible for converting mindmap nodes into outline data structure
 */
export class OutlineBuilder {
  private autoExpandLevels: number;

  constructor(config: OutlineBuilderConfig = {}) {
    this.autoExpandLevels = config.autoExpandLevels ?? 2;
  }

  /**
   * Helper function to get icon URL (same logic as SvgImageIcon.getImageUrl)
   */
  private getIconUrl(iconId: string): string {
    // The same lookup as the canvas: the browser bundle has no require() to load the asset with.
    return SvgImageIcon.getImageUrl(iconId);
  }

  /**
   * Builds outline data from a mindmap node and its children
   * @param node The mindmap node to convert
   * @param level The depth level in the outline hierarchy
   * @returns OutlineNodeData structure
   */
  buildOutlineData(node: INodeModel, level: number): OutlineNodeData {
    const features = node.getFeatures();

    // Extract icon URLs (SVG icons) and emoji characters
    const iconUrls: string[] = [];
    const emojiChars: string[] = [];

    features.forEach((feature) => {
      if (feature.isOfType('icon')) {
        // SVG icon from gallery
        const iconType = feature.getIconType();
        const iconUrl = this.getIconUrl(iconType);
        if (iconUrl) {
          iconUrls.push(iconUrl);
        }
      } else if (feature.isOfType('eicon')) {
        // Emoji icon - extract the emoji character
        // The feature attributes contain the emoji ID
        const attributes = feature.getAttributes();
        if (attributes && attributes.id) {
          emojiChars.push(attributes.id);
        }
      }
    });

    // Extract link URL
    let linkUrl: string | undefined;
    const linkFeature = features.find((f) => f.isOfType('link'));
    if (linkFeature) {
      linkUrl = linkFeature.getUrl();
    }

    // Extract note text
    let noteText: string | undefined;
    const noteFeature = features.find((f) => f.isOfType('note'));
    if (noteFeature) {
      noteText = noteFeature.getText();
    }

    const nodeText =
      node.getContentType() === ContentType.HTML ? node.getPlainText() : node.getText();

    const children = node
      .getChildren()
      .filter((child) => child.getText() !== undefined)
      .map((child) => this.buildOutlineData(child, level + 1));

    return {
      id: `${node.getId()}-${level}`,
      text: nodeText || '',
      level,
      children,
      iconUrls,
      emojiChars,
      linkUrl,
      noteText,
      node,
      isExpanded: level < this.autoExpandLevels,
    };
  }

  /**
   * Builds outline data from a central topic node
   * @param centralTopic The central topic node
   * @returns Array of outline data for the central topic's children
   */
  buildFromCentralTopic(centralTopic: INodeModel): OutlineNodeData[] {
    return centralTopic
      .getChildren()
      .filter((child) => child.getText() !== undefined)
      .map((child) => this.buildOutlineData(child, 0));
  }
}
