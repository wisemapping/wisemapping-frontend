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

import DOMUtils from './util/DOMUtils';
import LinkIcon from './LinkIcon';
import LinkModel from './model/LinkModel';
import NoteModel from './model/NoteModel';
import NoteIcon from './NoteIcon';
import Topic from './Topic';
import { $msg } from './Messages';

export type WidgetEventType = 'none' | 'link' | 'note';

abstract class WidgetBuilder {
  protected _listener: (event: WidgetEventType, topic?: Topic) => void;

  constructor() {
    this._listener = () => {};
  }

  private createTooltip(
    mindmapElement,
    title: string,
    linkModel?: LinkModel,
    noteModel?: NoteModel,
  ) {
    const mindmapComp = document.getElementById('mindmap-comp') as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const webcomponentShadowRoot = mindmapComp.shadowRoot!;

    let tooltip = webcomponentShadowRoot.getElementById('mindplot-svg-tooltip');
    let hideTimeout: NodeJS.Timeout | null = null;
    if (!tooltip) {
      const tooltipHTML =
        '<div id="mindplot-svg-tooltip" class="mindplot-svg-tooltip">' +
        '<div id="mindplot-svg-tooltip-content" class="mindplot-svg-tooltip-content">' +
        '<a id="mindplot-svg-tooltip-content-link" alt="Open in new window ..." class="mindplot-svg-tooltip-content-link" target="_blank"></a>' +
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
          // Clear any existing hide timeout when hovering over tooltip
          if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
          }
          if (tooltip) DOMUtils.css(tooltip, 'display', 'block');
          evt.stopPropagation();
        });
        tooltip.addEventListener('mouseleave', (evt) => {
          // Add 2 second delay before hiding the tooltip
          hideTimeout = setTimeout(() => {
            if (tooltip) DOMUtils.css(tooltip, 'display', 'none');
            hideTimeout = null;
          }, 1000);
          evt.stopPropagation();
        });
      }
    }

    mindmapElement.addEvent('mouseenter', (evt: MouseEvent) => {
      // Clear any existing hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      const tooltipTitle = webcomponentShadowRoot.getElementById('mindplot-svg-tooltip-title')!;
      DOMUtils.html(tooltipTitle, title);

      if (linkModel) {
        const tooltipLink = webcomponentShadowRoot.getElementById(
          'mindplot-svg-tooltip-content-link',
        )! as HTMLAnchorElement;
        DOMUtils.attr(tooltipLink, 'href', linkModel.getUrl());
        DOMUtils.html(tooltipLink, linkModel.getUrl());
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
        DOMUtils.html(tooltipNote, noteModel.getText());
        DOMUtils.css(tooltipNote, 'display', 'block');

        const tooltipLink = webcomponentShadowRoot.getElementById(
          'mindplot-svg-tooltip-content-link',
        )!;
        DOMUtils.css(tooltipLink, 'display', 'none');
      }
      const targetRect = (evt.target as Element).getBoundingClientRect();
      const width = tooltip ? DOMUtils.width(tooltip) || 0 : 0;
      const newX = Math.max(0, targetRect.left + targetRect.width / 2 - width / 2);
      const newY = Math.max(0, targetRect.bottom);
      if (tooltip) {
        DOMUtils.css(tooltip, 'top', `${newY}px`);
        DOMUtils.css(tooltip, 'left', `${newX}px`);
        DOMUtils.css(tooltip, 'position', 'absolute');
        DOMUtils.css(tooltip, 'display', 'block');
      }
      evt.stopPropagation();
    });

    mindmapElement.addEvent('mouseleave', (evt: MouseEvent) => {
      // Add 2 second delay before hiding the tooltip
      hideTimeout = setTimeout(() => {
        if (tooltip) DOMUtils.css(tooltip, 'display', 'none');
        hideTimeout = null;
      }, 1000);
      evt.stopPropagation();
    });
  }

  addHander(listener: (event: WidgetEventType, topic?: Topic) => void): void {
    this._listener = listener;
  }

  fireEvent(event: WidgetEventType, topic?: Topic): void {
    this._listener(event, topic);
  }

  createTooltipForLink(_topic: Topic, linkModel: LinkModel, linkIcon: LinkIcon) {
    this.createTooltip(linkIcon.getElement().peer, $msg('LINK'), linkModel, undefined);
  }

  configureTooltipForNode(_topic: Topic, noteModel: NoteModel, noteIcon: NoteIcon): void {
    this.createTooltip(noteIcon.getElement().peer, $msg('NOTE'), undefined, noteModel);
  }

  abstract buildEditorForLink(topic: Topic): React.ReactElement;

  abstract buidEditorForNote(topic: Topic): React.ReactElement;
}

export default WidgetBuilder;
