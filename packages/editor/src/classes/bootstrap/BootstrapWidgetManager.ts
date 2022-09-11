import {
  WidgetManager,
  Topic,
  LinkModel,
  LinkIcon,
  NoteModel,
  NoteIcon,
  $msg,
} from '@wisemapping/mindplot';
import LinkIconTooltip from './LinkIconTooltip';
import LinkEditor from './LinkEditor';
import FloatingTip from './FloatingTip';
import NoteEditor from './NoteEditor';
import $ from 'jquery';

export default class BootstrapWidgetManager extends WidgetManager {
  createTooltipForLink(topic: Topic, linkModel: LinkModel, linkIcon: LinkIcon) {
    const htmlImage = linkIcon.getImage().peer;
    const toolTip = new LinkIconTooltip(linkIcon);
    linkIcon.addEvent('mouseleave', (event) => {
      setTimeout(() => {
        if (!$('#linkPopover:hover').length) {
          toolTip.hide();
        }
        event.stopPropagation();
      }, 100);
    });
    $(htmlImage._native).mouseenter(() => {
      toolTip.show();
    });
  }

  showEditorForLink(topic: Topic, linkModel: LinkModel, linkIcon: LinkIcon) {
    const editorModel = {
      getValue(): string {
        return topic.getLinkValue();
      },
      setValue(value: string) {
        topic.setLinkValue(value);
      },
    };
    topic.closeEditors();
    const editor = new LinkEditor(editorModel);
    editor.show();
  }

  private _buildTooltipContentForNote(noteModel: NoteModel): JQuery {
    if ($('body').find('#textPopoverNote').length === 1) {
      const text = $('body').find('#textPopoverNote');
      text.text(noteModel.getText());
      return text;
    }
    const result = $('<div id="textPopoverNote"></div>').css({ padding: '5px' });

    const text = $('<div></div>').text(noteModel.getText()).css({
      'white-space': 'pre-wrap',
      'word-wrap': 'break-word',
    });
    result.append(text);
    return result;
  }

  createTooltipForNote(topic: Topic, noteModel: NoteModel, noteIcon: NoteIcon) {
    const htmlImage = noteIcon.getImage().peer;
    const me = this;
    const toolTip = new FloatingTip($(htmlImage._native), {
      title: $msg('NOTE'),
      content() {
        return me._buildTooltipContentForNote(noteModel);
      },
      html: true,
      placement: 'bottom',
      destroyOnExit: true,
    });
  }

  showEditorForNote(topic: Topic, noteModel: NoteModel, noteIcon: NoteIcon) {
    const editorModel = {
      getValue(): string {
        return topic.getNoteValue();
      },
      setValue(value: string) {
        topic.setNoteValue(value);
      },
    };
    topic.closeEditors();
    const editor = new NoteEditor(editorModel);
    editor.show();
  }
}
