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
import React, { useRef, useState } from 'react';
import {
  WidgetManager,
  Topic,
  LinkModel,
  LinkIcon,
  NoteModel,
  NoteIcon,
} from '@wisemapping/mindplot';
import { linkContent, noteContent } from './react-component';

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

  showEditorForLink(topic: Topic, linkModel: LinkModel, linkIcon: LinkIcon): void {
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
        const note = value && value.trim() !== '' ? value : undefined;
        topic.setNoteValue(note);
      },
    };
    this.editorContent = noteContent(model, () => this.setPopoverOpen(false));
    this.setPopoverTarget(topic.getOuterShape().peer._native);
    this.setPopoverOpen(true);
    topic.closeEditors();
  }

  static create(): [boolean, Element | undefined, DefaultWidgetManager] {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [popoverTarget, setPopoverTarget] = useState(undefined);
    const widgetManager = useRef(new DefaultWidgetManager(setPopoverOpen, setPopoverTarget));

    return [popoverOpen, popoverTarget, widgetManager.current];
  }
}

export default DefaultWidgetManager;
