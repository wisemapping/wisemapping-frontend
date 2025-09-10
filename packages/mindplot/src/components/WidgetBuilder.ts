/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import $ from 'jquery';
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
    const { shadowRoot } = $('#mindmap-comp')[0];
    const webcomponentShadowRoot = $(shadowRoot!);

    let tooltip = webcomponentShadowRoot.find('#mindplot-svg-tooltip');
    if (!tooltip.length || !tooltip) {
      webcomponentShadowRoot.append(
        '<div id="mindplot-svg-tooltip" class="mindplot-svg-tooltip">' +
          '<div id="mindplot-svg-tooltip-title" class="mindplot-svg-tooltip-title"></div>' +
          '<div id="mindplot-svg-tooltip-content" class="mindplot-svg-tooltip-content">' +
          '<a id="mindplot-svg-tooltip-content-link" alt="Open in new window ..." class="mindplot-svg-tooltip-content-link" target="_blank"></a>' +
          '<p id="mindplot-svg-tooltip-content-note" class="mindplot-svg-tooltip-content-note"></p>' +
          '</div>' +
          '</div>',
      );
      tooltip = webcomponentShadowRoot.find('#mindplot-svg-tooltip');

      tooltip.on('mouseover', (evt) => {
        tooltip.css({ display: 'block' });
        evt.stopPropagation();
      });
      tooltip.on('mouseleave', (evt) => {
        tooltip.css({ display: 'none' });
        evt.stopPropagation();
      });
    }

    mindmapElement.addEvent('mouseenter', (evt: MouseEvent) => {
      webcomponentShadowRoot.find('#mindplot-svg-tooltip-title').html(title);
      if (linkModel) {
        webcomponentShadowRoot
          .find('#mindplot-svg-tooltip-content-link')
          .attr('href', linkModel.getUrl());
        webcomponentShadowRoot.find('#mindplot-svg-tooltip-content-link').html(linkModel.getUrl());
        webcomponentShadowRoot.find('#mindplot-svg-tooltip-content-link').css({ display: 'block' });
        webcomponentShadowRoot.find('#mindplot-svg-tooltip-content-note').css({ display: 'none' });
      }
      if (noteModel) {
        webcomponentShadowRoot.find('#mindplot-svg-tooltip-content-note').html(noteModel.getText());
        webcomponentShadowRoot.find('#mindplot-svg-tooltip-content-note').css({ display: 'block' });
        webcomponentShadowRoot.find('#mindplot-svg-tooltip-content-link').css({ display: 'none' });
      }
      const targetRect = (evt.target as Element).getBoundingClientRect();
      const width = tooltip.width() || 0;
      const newX = Math.max(0, targetRect.left + targetRect.width / 2 - width / 2);
      const newY = Math.max(0, targetRect.bottom);
      tooltip.css({ top: newY, left: newX, position: 'absolute' });
      tooltip.css({ display: 'block' });
      evt.stopPropagation();
    });

    mindmapElement.addEvent('mouseleave', (evt: MouseEvent) => {
      tooltip.css({ display: 'none' });
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
export { WidgetEventType };
