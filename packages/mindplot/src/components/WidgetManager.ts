import $ from 'jquery';
import LinkIcon from './LinkIcon';
import LinkModel from './model/LinkModel';
import NoteModel from './model/NoteModel';
import NoteIcon from './NoteIcon';
import Topic from './Topic';
import { $msg } from './Messages';

abstract class WidgetManager {
  // eslint-disable-next-line no-use-before-define
  private static _instance: WidgetManager;

  static init = (instance: WidgetManager) => {
    this._instance = instance;
  };

  static getInstance(): WidgetManager {
    return this._instance;
  }

  private createTooltip(
    mindmapElement,
    title: string,
    linkModel?: LinkModel,
    noteModel?: NoteModel,
  ) {
    const webcomponentShadowRoot = $($('#mindmap-comp')[0].shadowRoot);
    let tooltip = webcomponentShadowRoot.find('#mindplot-svg-tooltip');
    if (!tooltip.length) {
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

    mindmapElement.addEvent('mouseenter', (evt) => {
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
      const targetRect = evt.target.getBoundingClientRect();
      const newX = Math.max(0, targetRect.left + targetRect.width / 2 - tooltip.width() / 2);
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

  createTooltipForLink(topic: Topic, linkModel: LinkModel, linkIcon: LinkIcon) {
    this.createTooltip(linkIcon.getElement().peer, $msg('LINK'), linkModel, undefined);
  }

  createTooltipForNote(topic: Topic, noteModel: NoteModel, noteIcon: NoteIcon): void {
    this.createTooltip(noteIcon.getElement().peer, $msg('NOTE'), undefined, noteModel);
  }

  configureEditorForLink(topic: Topic, linkModel: LinkModel, linkIcon: LinkIcon): void {
    const htmlImage = linkIcon.getElement().peer;
    htmlImage.addEvent('click', (evt) => {
      this.showEditorForLink(topic, linkModel, linkIcon);
      evt.stopPropagation();
    });
  }

  configureEditorForNote(topic: Topic, noteModel: NoteModel, noteIcon: NoteIcon): void {
    const htmlImage = noteIcon.getElement().peer;
    htmlImage.addEvent('click', (evt) => {
      this.showEditorForNote(topic, noteModel, noteIcon);
      evt.stopPropagation();
    });
  }

  abstract showEditorForLink(
    topic: Topic,
    linkModel: LinkModel | null,
    linkIcon: LinkIcon | null,
  ): void;

  abstract showEditorForNote(
    topic: Topic,
    noteModel: NoteModel | null,
    noteIcon: NoteIcon | null,
  ): void;
}

export default WidgetManager;
