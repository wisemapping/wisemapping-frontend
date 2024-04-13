/* eslint-disable react-hooks/rules-of-hooks */
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
import { WidgetManager, Topic } from '@wisemapping/mindplot';
import { linkContent, noteContent } from './react-component';
import NodeProperty from '../model/node-property';

export class DefaultWidgetManager extends WidgetManager {
  private editorOpen: boolean;
  private editorContent: React.ReactElement | undefined;
  private editorTitle: string | undefined;
  private setPopoverOpen: (value: boolean) => void;
  private setPopoverTarget: (target: Element | undefined) => void | undefined;

  constructor(
    setPopoverOpen: (open: boolean) => void,
    setPopoverTarget: (target: Element | undefined) => void,
  ) {
    super();
    this.editorOpen = false;
    this.setPopoverOpen = setPopoverOpen;
    this.setPopoverTarget = setPopoverTarget;
  }

  showEditorForLink(topic: Topic): void {
    const model = {
      getValue: () => topic.getLinkValue(),
      setValue: (value: string) => topic.setLinkValue(value),
    };
    this.editorContent = linkContent(model, () => this.setPopoverOpen(false));
    this.setPopoverTarget(topic.getOuterShape().peer._native);
    this.setPopoverOpen(true);
    this.editorTitle = 'editor-panel.link-panel-title';
    topic.closeEditors();
  }

  isEditorOpen(): boolean {
    return this.editorOpen;
  }

  getEditorContent(): React.ReactElement | undefined {
    return this.editorContent;
  }

  handleClose: (event, reason: 'backdropClick' | 'escapeKeyDown') => void = () => {
    this.setPopoverOpen(false);
    this.editorContent = undefined;
    this.setPopoverTarget(undefined);
  };

  showEditorForNote(topic: Topic): void {
    const model: NodeProperty<string | undefined> = {
      getValue(): string | undefined {
        const result = topic.getNoteValue();
        return result ? result : undefined;
      },
      setValue(value: string | undefined) {
        const note = value && value.trim() !== '' ? value : undefined;
        topic.setNoteValue(note);
      },
    };

    this.editorContent = noteContent(model, () => this.setPopoverOpen(false));
    this.setPopoverTarget(topic.getOuterShape().peer._native);
    this.setPopoverOpen(true);
    this.editorTitle = 'editor-panel.note-panel-title';
    topic.closeEditors();
  }

  static useCreate(): [
    boolean,
    (arg0: boolean) => void,
    Element | undefined,
    DefaultWidgetManager,
  ] {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [popoverTarget, setPopoverTarget] = useState<Element | undefined>(undefined);

    const WidgetManager = new DefaultWidgetManager(
      setPopoverOpen,
      (target: Element | undefined) => {
        if (setPopoverTarget) {
          setPopoverTarget(target);
        }
      },
    );
    const widgetManager = useRef(WidgetManager);

    return [popoverOpen, setPopoverOpen, popoverTarget, widgetManager.current];
  }

  getEditorTile(): string {
    return this.editorTitle ? this.editorTitle : '';
  }
}

export default DefaultWidgetManager;
