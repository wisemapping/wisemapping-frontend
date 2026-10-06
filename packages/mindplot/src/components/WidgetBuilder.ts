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

import debounce from 'lodash/debounce';
import type { ElementClass, ElementPeer } from '@wisemapping/web2d';
import DOMUtils from './util/DOMUtils';
import type LinkIcon from './LinkIcon';
import type LinkModel from './model/LinkModel';
import type NoteModel from './model/NoteModel';
import type NoteIcon from './NoteIcon';
import type Topic from './Topic';
import { $msg } from './Messages';
import ContentType from './ContentType';
import HtmlSanitizer from './security/HtmlSanitizer';

export type WidgetEventType = 'none' | 'link' | 'note';

// Tooltip timing constants
const TOOLTIP_SHOW_DELAY = 600; // milliseconds to wait before showing tooltip
const TOOLTIP_HIDE_DELAY = 1000; // milliseconds to wait before hiding tooltip

abstract class WidgetBuilder {
  protected _listener: (event: WidgetEventType, topic?: Topic) => void;

  private _showTimeout: number | null = null;

  // Hides the tooltip it is given last, once the pointer has been away from it for a while.
  private _hideTooltip: ReturnType<typeof debounce<(tooltip: HTMLElement) => void>>;

  constructor() {
    this._listener = () => {};

    // Initialize debounced hide function for tooltips
    this._hideTooltip = debounce((tooltip: HTMLElement) => {
      DOMUtils.css(tooltip, 'display', 'none');
    }, TOOLTIP_HIDE_DELAY);
  }

  /**
   * The shadow root of the web component of the topic's designer, which holds its tooltip: each
   * map on the page has its own. Undefined when the topic's map is not in a web component.
   */
  private static shadowRootOf(topic: Topic): ShadowRoot | undefined {
    const root = topic.getDesigner()?.getContainer().getRootNode();
    return root instanceof ShadowRoot ? root : undefined;
  }

  private createTooltip(
    topic: Topic,
    mindmapElement: ElementClass<ElementPeer>,
    title: string,
    linkModel?: LinkModel,
    noteModel?: NoteModel,
  ) {
    const webcomponentShadowRoot = WidgetBuilder.shadowRootOf(topic);
    if (!webcomponentShadowRoot) {
      console.warn('The map of the topic is not in a web component: it has no tooltips');
      return;
    }
    const mindmapComp = webcomponentShadowRoot.host;

    let tooltip = webcomponentShadowRoot.getElementById('mindplot-svg-tooltip');

    if (!tooltip) {
      const tooltipHTML =
        '<div id="mindplot-svg-tooltip" class="mindplot-svg-tooltip">' +
        '<div id="mindplot-svg-tooltip-content" class="mindplot-svg-tooltip-content">' +
        '<a id="mindplot-svg-tooltip-content-link" alt="Open in new window ..." class="mindplot-svg-tooltip-content-link" target="_blank" rel="nofollow noopener noreferrer"></a>' +
        '<p id="mindplot-svg-tooltip-content-note" class="mindplot-svg-tooltip-content-note"></p>' +
        '</div>' +
        '<div id="mindplot-svg-tooltip-title" class="mindplot-svg-tooltip-title"></div>' +
        '</div>';
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = tooltipHTML;
      webcomponentShadowRoot.appendChild(tempDiv.firstChild as HTMLElement);
      tooltip = webcomponentShadowRoot.getElementById('mindplot-svg-tooltip')!;

      if (tooltip) {
        tooltip.addEventListener('mouseover', (evt) => {
          // Cancel any pending hide when hovering over tooltip
          this._hideTooltip.cancel();
          DOMUtils.css(evt.currentTarget as HTMLElement, 'display', 'block');
          evt.stopPropagation();
        });
        tooltip.addEventListener('mouseleave', (evt) => {
          // Schedule hiding with debounce
          this._hideTooltip(evt.currentTarget as HTMLElement);
          evt.stopPropagation();
        });
      }
    }

    mindmapElement.addEvent('mouseenter', (evt: Event) => {
      // Cancel any pending hide operation
      this._hideTooltip.cancel();

      // Capture target element for positioning
      const targetElement = evt.target as Element;

      // Delay showing tooltip to avoid flashing on quick hover
      this._showTimeout = window.setTimeout(() => {
        const tooltipTitle = webcomponentShadowRoot.getElementById('mindplot-svg-tooltip-title')!;
        DOMUtils.text(tooltipTitle, title);

        // Configure content based on tooltip type
        if (linkModel) {
          const tooltipLink = webcomponentShadowRoot.getElementById(
            'mindplot-svg-tooltip-content-link',
          )! as HTMLAnchorElement;
          DOMUtils.attr(tooltipLink, 'href', linkModel.getUrl());
          DOMUtils.attr(tooltipLink, 'rel', 'nofollow noopener noreferrer');
          DOMUtils.text(tooltipLink, linkModel.getUrl());
          DOMUtils.css(tooltipLink, 'display', 'block');

          const tooltipNote = webcomponentShadowRoot.getElementById(
            'mindplot-svg-tooltip-content-note',
          )!;
          DOMUtils.css(tooltipNote, 'display', 'none');
        }

        if (noteModel) {
          const tooltipNote = webcomponentShadowRoot.getElementById(
            'mindplot-svg-tooltip-content-note',
          )!;
          if (noteModel.getContentType() === ContentType.HTML) {
            try {
              // Its links open in a new tab, so the map stays open.
              DOMUtils.html(tooltipNote, HtmlSanitizer.sanitizeForDisplay(noteModel.getText()));
            } catch {
              // Too large to sanitize: show its text instead.
              DOMUtils.text(tooltipNote, noteModel.getPlainText());
            }
          } else {
            DOMUtils.text(tooltipNote, noteModel.getText());
          }
          DOMUtils.css(tooltipNote, 'display', 'block');

          const tooltipLink = webcomponentShadowRoot.getElementById(
            'mindplot-svg-tooltip-content-link',
          )!;
          DOMUtils.css(tooltipLink, 'display', 'none');
        }

        // Position tooltip near the icon while keeping it inside the visible mindmap container
        const targetRect = targetElement.getBoundingClientRect();

        if (tooltip) {
          const tooltipWidth = DOMUtils.width(tooltip) || 0;
          const tooltipHeight = DOMUtils.height(tooltip) || 0;

          const containerRect = mindmapComp.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const containerHeight = containerRect.height;

          // Decide whether to place tooltip above or below the icon.
          // Add a small margin so it does not sit directly over the icon.
          const margin = 8;
          const placeAbove =
            targetRect.bottom - containerRect.top + tooltipHeight + margin > containerHeight &&
            targetRect.top - containerRect.top > tooltipHeight + margin;

          let top = placeAbove
            ? targetRect.top - containerRect.top - tooltipHeight - margin
            : targetRect.bottom - containerRect.top + margin;

          // Center horizontally relative to the icon
          let left = targetRect.left - containerRect.left + targetRect.width / 2 - tooltipWidth / 2;

          // Clamp horizontally so the tooltip stays within the mindmap container
          if (left < 0) {
            left = 0;
          } else if (left + tooltipWidth > containerWidth) {
            left = Math.max(0, containerWidth - tooltipWidth);
          }

          // Final safety clamp for top within the container
          if (top < 0) {
            top = 0;
          } else if (top + tooltipHeight > containerHeight) {
            top = Math.max(0, containerHeight - tooltipHeight);
          }

          DOMUtils.css(tooltip, 'top', `${top}px`);
          DOMUtils.css(tooltip, 'left', `${left}px`);
          DOMUtils.css(tooltip, 'position', 'absolute');
          DOMUtils.css(tooltip, 'display', 'block');
        }

        this._showTimeout = null;
      }, TOOLTIP_SHOW_DELAY);

      evt.stopPropagation();
    });

    mindmapElement.addEvent('mouseleave', (evt: Event) => {
      // Cancel pending show if mouse left before delay completed
      if (this._showTimeout) {
        clearTimeout(this._showTimeout);
        this._showTimeout = null;
      }

      // Schedule hiding with debounce delay
      if (tooltip) {
        this._hideTooltip(tooltip);
      }
      evt.stopPropagation();
    });
  }

  addHander(listener: (event: WidgetEventType, topic?: Topic) => void): void {
    this._listener = listener;
  }

  fireEvent(event: WidgetEventType, topic?: Topic): void {
    this._listener(event, topic);
  }

  createTooltipForLink(topic: Topic, linkModel: LinkModel, linkIcon: LinkIcon) {
    this.createTooltip(topic, linkIcon.getElement(), $msg('LINK'), linkModel, undefined);
  }

  configureTooltipForNode(topic: Topic, noteModel: NoteModel, noteIcon: NoteIcon): void {
    this.createTooltip(topic, noteIcon.getElement(), $msg('NOTE'), undefined, noteModel);
  }

  abstract buildEditorForLink(topic: Topic): React.ReactElement;

  abstract buidEditorForNote(topic: Topic): React.ReactElement;

  /** The size of the web component of the topic's map, or of the window outside one. */
  getContainerSize(topic: Topic): { width: number; height: number } {
    const mindmapComp = WidgetBuilder.shadowRootOf(topic)?.host;
    if (mindmapComp) {
      const rect = mindmapComp.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }
}

export default WidgetBuilder;
