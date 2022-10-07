import React from 'react';
import {
  WidgetManager,
  Topic,
  LinkModel,
  LinkIcon,
  NoteModel,
  NoteIcon,
} from '@wisemapping/mindplot';
import { linkContent, noteContent } from '../../components/menu/contents';

export class DefaultWidgetManager extends WidgetManager {
  private editorOpen: boolean;
  private editorContent: React.ReactElement;
  private setPopoverOpen: (value: boolean) => void;
  private setPopoverTarget: (target: Element) => void;

  constructor(
    setPopoverOpen: (open: boolean) => void,
    setPopoverTarget: (target: Element) => void,
  ) {
    super();
    this.setPopoverOpen = setPopoverOpen;
    this.setPopoverTarget = setPopoverTarget;
  }

  showEditorForLink(topic: Topic, linkModel: LinkModel, linkIcon: LinkIcon) {
    const model: any = {
      getValue: () => topic.getLinkValue(),
      setValue: (value: string) => topic.setLinkValue(value),
    };
    this.editorContent = linkContent(model, () => this.setPopoverOpen(false));
    this.setPopoverTarget(topic.getOuterShape().peer._native);
    this.setPopoverOpen(true);
    topic.closeEditors();
  }

  isEditorOpen(): boolean {
    return this.editorOpen;
  }

  getEditorContent(): React.ReactElement {
    return this.editorContent;
  }

  handleClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void = () => {
    this.setPopoverOpen(false);
    this.editorContent = undefined;
    this.setPopoverTarget(undefined);
  };

  showEditorForNote(topic: Topic, noteModel: NoteModel, noteIcon: NoteIcon) {
    const model = {
      getValue(): string {
        return topic.getNoteValue();
      },
      setValue(value: string) {
        topic.setNoteValue(value);
      },
    };
    this.editorContent = noteContent(model, () => this.setPopoverOpen(false));
    this.setPopoverTarget(topic.getOuterShape().peer._native);
    this.setPopoverOpen(true);
    topic.closeEditors();
  }
}

export default DefaultWidgetManager;
