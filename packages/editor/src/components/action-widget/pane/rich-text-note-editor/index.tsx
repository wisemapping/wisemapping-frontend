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
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import CloseIcon from '@mui/icons-material/Close';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import { useTheme } from '@mui/material/styles';
import React, {
  ReactElement,
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import NodeProperty from '../../../../classes/model/node-property';
import SaveAndDelete from '../save-and-delete';
import type { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from '../shared/emoji-picker';
import { HtmlSanitizer } from '@wisemapping/mindplot';
import { attachNoteEditing, NoteEditing } from './note-editing';
import { safeLinkUrl } from './markdown-rules';
import {
  CloseNoteButton,
  EmojiPopoverBox,
  FooterBar,
  HeaderControl,
  HeaderSelect,
  NoteEditable,
  NoteEditorFrame,
  NoteFrame,
  ToolbarFrame,
  ToolbarRow,
  ToolButton,
  ToolGroup,
} from './styled';

type RichTextNoteEditorProps = {
  closeModal: () => void;
  noteModel: NodeProperty<string | undefined>;
};

const MAX_CHARACTERS = 10000;

type CharacterCounterHandle = { setCount: (count: number) => void };

/**
 * The characters left. It has its own state so that an edit re-renders only the counter: a
 * re-render of the whole editor on every input, toolbar included (MUI's FormControl updates its
 * input after each of its renders in development), made characters typed in a burst, as Cypress
 * does, add up to React's nested update limit.
 */
const CharacterCounter = ({
  initialCount,
  handleRef,
}: {
  initialCount: number;
  handleRef: React.Ref<CharacterCounterHandle>;
}): ReactElement => {
  const [characterCount, setCharacterCount] = useState(initialCount);
  useImperativeHandle(handleRef, () => ({ setCount: setCharacterCount }), []);
  return (
    <Box
      sx={{
        fontSize: '12px',
        color: characterCount > MAX_CHARACTERS * 0.9 ? 'error.main' : 'text.secondary',
        fontWeight: characterCount > MAX_CHARACTERS * 0.9 ? 600 : 400,
      }}
    >
      <FormattedMessage
        id="note.character.count"
        defaultMessage="{remaining} left"
        values={{
          remaining: MAX_CHARACTERS - characterCount,
        }}
      />
      {characterCount > MAX_CHARACTERS * 0.9 && (
        <Box component="span" sx={{ ml: 1, fontSize: '11px' }}>
          <FormattedMessage
            id="note.character.limit.warning"
            defaultMessage="(Approaching limit)"
          />
        </Box>
      )}
    </Box>
  );
};

/**
 * Rich text note editor using contentEditable for React 19 compatibility
 */
const RichTextNoteEditor = ({ closeModal, noteModel }: RichTextNoteEditorProps): ReactElement => {
  const initialValue = noteModel.getValue() || '';
  const editorRef = useRef<HTMLDivElement>(null);
  const [iconPickerAnchor, setIconPickerAnchor] = useState<HTMLButtonElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const editingRef = useRef<NoteEditing | null>(null);
  const counterRef = useRef<CharacterCounterHandle>(null);
  // Count visible text, as edits do; DOMParser is inert (no scripts or image loads).
  const [initialCount] = useState(
    () => new DOMParser().parseFromString(initialValue, 'text/html').body.textContent?.length ?? 0,
  );
  const theme = useTheme();
  const intl = useIntl();

  const submitHandler = useCallback(() => {
    closeModal();
    if (noteModel.setValue) {
      // The content is read from the editor, which is rendered with the component. Only the
      // markup the note sanitizer keeps is saved.
      noteModel.setValue(HtmlSanitizer.sanitize(editorRef.current!.innerHTML));
    }
  }, [closeModal, noteModel]);

  // The content stays in the editor's DOM: an edit only updates the character count.
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      // Get plain text length for character count validation
      const textContent = editorRef.current.textContent || '';

      // Prevent exceeding character limit
      if (textContent.length > MAX_CHARACTERS) {
        // Truncate content to stay within limit
        const truncatedText = textContent.substring(0, MAX_CHARACTERS);

        // Create a temporary element to convert plain text back to HTML
        const tempDiv = document.createElement('div');
        tempDiv.textContent = truncatedText;

        // Update the editor content
        editorRef.current.innerHTML = tempDiv.innerHTML;
        counterRef.current?.setCount(MAX_CHARACTERS);

        // Position cursor at the end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        counterRef.current?.setCount(textContent.length);
      }
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const textContent = editorRef.current.textContent || '';
      counterRef.current?.setCount(textContent.length);
    }
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:')?.trim();
    if (url) {
      // An address without a scheme is taken as https; javascript: and the like are refused.
      const href = safeLinkUrl(/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`);
      if (href) {
        execCommand('createLink', href);
      }
    }
  }, [execCommand]);

  const handleIconPickerOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Save the current cursor position before opening the picker
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
    setIconPickerAnchor(event.currentTarget);
  }, []);

  const handleIconPickerClose = useCallback(() => {
    setIconPickerAnchor(null);
    savedRangeRef.current = null;
  }, []);

  const handleEmojiSelect = useCallback(
    (emoji: EmojiClickData) => {
      if (editorRef.current) {
        // Focus the editor first
        editorRef.current.focus();

        const selection = window.getSelection();
        if (selection) {
          // Restore the saved cursor position
          if (savedRangeRef.current) {
            selection.removeAllRanges();
            selection.addRange(savedRangeRef.current);
          }

          // Use document.execCommand for better compatibility with contentEditable
          const success = document.execCommand('insertText', false, emoji.emoji + ' ');

          if (!success) {
            // Fallback to manual insertion
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              const textNode = document.createTextNode(emoji.emoji + ' ');
              range.insertNode(textNode);
              range.setStartAfter(textNode);
              range.setEndAfter(textNode);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }

          // Update content state
          handleContentChange();
        }
      }
      handleIconPickerClose();
    },
    [handleContentChange, handleIconPickerClose],
  );

  const setHeader = useCallback(
    (headerType: string) => {
      if (headerType === 'normal') {
        execCommand('formatBlock', 'div');
      } else if (headerType === 'blockquote') {
        execCommand('formatBlock', 'blockquote');
      } else if (headerType === 'pre') {
        execCommand('formatBlock', 'pre');
      } else {
        execCommand('formatBlock', headerType);
      }
    },
    [execCommand],
  );

  useEffect(() => {
    if (editorRef.current) {
      // The note comes from the map: it is sanitized before it is edited.
      editorRef.current.innerHTML = HtmlSanitizer.sanitize(initialValue || '');
      // Auto-focus the editor when it opens
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 100);
    }
  }, [initialValue]);

  // Markdown, nested lists, line breaks and links (see note-editing).
  useEffect(() => {
    // The editor element is rendered with the component.
    const editing = attachNoteEditing(editorRef.current!, { onChange: handleContentChange });
    editingRef.current = editing;
    return () => {
      editing.detach();
      editingRef.current = null;
    };
  }, [handleContentChange]);

  const indent = useCallback((outdent: boolean) => {
    editingRef.current?.indent(outdent);
  }, []);

  // Handle keyboard shortcuts and prevent editor interference
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }
    };

    const handleEditorKeyDown = (event: KeyboardEvent) => {
      // Stop propagation to prevent main editor from intercepting keystrokes
      event.stopPropagation();
    };

    const handleEditorKeyUp = (event: KeyboardEvent) => {
      // Stop propagation to prevent main editor from intercepting keystrokes
      event.stopPropagation();
    };

    const handleEditorKeyPress = (event: KeyboardEvent) => {
      // Stop propagation to prevent main editor from intercepting keystrokes
      event.stopPropagation();
    };

    // Add event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Add event listeners to the editor to prevent interference
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keydown', handleEditorKeyDown);
      editor.addEventListener('keyup', handleEditorKeyUp);
      editor.addEventListener('keypress', handleEditorKeyPress);
    }

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (editor) {
        editor.removeEventListener('keydown', handleEditorKeyDown);
        editor.removeEventListener('keyup', handleEditorKeyUp);
        editor.removeEventListener('keypress', handleEditorKeyPress);
      }
    };
  }, []);

  return (
    <NoteEditorFrame>
      <CloseNoteButton onClick={closeModal}>
        <CloseIcon />
      </CloseNoteButton>
      {/* Toolbar */}
      <ToolbarFrame>
        {/* Single Row - All Options */}
        <ToolbarRow>
          <HeaderControl size="small">
            <HeaderSelect
              defaultValue="normal"
              onChange={(e) => setHeader(String(e.target.value))}
              displayEmpty
            >
              <MenuItem value="normal" sx={{ fontSize: '12px' }}>
                Normal
              </MenuItem>
              <MenuItem value="h1" sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                Heading 1
              </MenuItem>
              <MenuItem value="h2" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Heading 2
              </MenuItem>
              <MenuItem value="h3" sx={{ fontSize: '15px', fontWeight: 'bold' }}>
                Heading 3
              </MenuItem>
              <MenuItem value="h4" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                Heading 4
              </MenuItem>
              <MenuItem value="h5" sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                Heading 5
              </MenuItem>
              <MenuItem value="h6" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                Heading 6
              </MenuItem>
              <MenuItem value="blockquote" sx={{ fontSize: '12px', fontStyle: 'italic' }}>
                Quote
              </MenuItem>
              <MenuItem value="pre" sx={{ fontSize: '10px', fontFamily: 'monospace' }}>
                Code Block
              </MenuItem>
            </HeaderSelect>
          </HeaderControl>

          <ToolGroup size="small" variant="outlined">
            <ToolButton
              onClick={insertLink}
              title={intl.formatMessage({
                id: 'rich-text-editor.insert-link',
                defaultMessage: 'Insert Link',
              })}
            >
              🔗
            </ToolButton>
            <ToolButton
              onClick={handleIconPickerOpen}
              title={intl.formatMessage({
                id: 'rich-text-editor.insert-icon',
                defaultMessage: 'Insert Icon',
              })}
            >
              😀
            </ToolButton>
          </ToolGroup>

          <ToolGroup size="small" variant="outlined">
            <ToolButton
              onClick={() => execCommand('bold')}
              title={intl.formatMessage({ id: 'rich-text-editor.bold', defaultMessage: 'Bold' })}
            >
              <strong>B</strong>
            </ToolButton>
            <ToolButton
              onClick={() => execCommand('italic')}
              title={intl.formatMessage({
                id: 'rich-text-editor.italic',
                defaultMessage: 'Italic',
              })}
            >
              <em>I</em>
            </ToolButton>
            <ToolButton
              onClick={() => execCommand('underline')}
              title={intl.formatMessage({
                id: 'rich-text-editor.underline',
                defaultMessage: 'Underline',
              })}
            >
              <u>U</u>
            </ToolButton>
            <ToolButton
              onClick={() => execCommand('strikeThrough')}
              title={intl.formatMessage({
                id: 'rich-text-editor.strikethrough',
                defaultMessage: 'Strikethrough',
              })}
            >
              <s>S</s>
            </ToolButton>
          </ToolGroup>

          <ToolGroup size="small" variant="outlined">
            <ToolButton
              onClick={() => execCommand('insertUnorderedList')}
              title={intl.formatMessage({
                id: 'rich-text-editor.bullet-list',
                defaultMessage: 'Bullet List',
              })}
            >
              •
            </ToolButton>
            <ToolButton
              onClick={() => execCommand('insertOrderedList')}
              title={intl.formatMessage({
                id: 'rich-text-editor.numbered-list',
                defaultMessage: 'Numbered List',
              })}
            >
              1.
            </ToolButton>
            <ToolButton
              // Keeps the selection in the note.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => indent(true)}
              title={intl.formatMessage({
                id: 'rich-text-editor.outdent',
                defaultMessage: 'Decrease Indent (Shift+Tab)',
              })}
            >
              <FormatIndentDecreaseIcon fontSize="small" />
            </ToolButton>
            <ToolButton
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => indent(false)}
              title={intl.formatMessage({
                id: 'rich-text-editor.indent',
                defaultMessage: 'Increase Indent (Tab)',
              })}
            >
              <FormatIndentIncreaseIcon fontSize="small" />
            </ToolButton>
          </ToolGroup>
        </ToolbarRow>
      </ToolbarFrame>

      {/* Editor */}
      <NoteFrame>
        <NoteEditable
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onBlur={handleContentChange}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
          suppressContentEditableWarning={true}
        />
      </NoteFrame>

      {/* Character Counter and Save/Delete Buttons */}
      <FooterBar>
        {/* Character Counter */}
        <CharacterCounter initialCount={initialCount} handleRef={counterRef} />

        {/* Save and Delete Buttons */}
        <SaveAndDelete model={noteModel} closeModal={closeModal} submitHandler={submitHandler} />
      </FooterBar>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(iconPickerAnchor)}
        anchorEl={iconPickerAnchor}
        onClose={handleIconPickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <EmojiPopoverBox>
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
            searchPlaceholder={intl.formatMessage({
              id: 'emoji-picker.search-placeholder',
              defaultMessage: 'Search emojis...',
            })}
          />
        </EmojiPopoverBox>
      </Popover>
    </NoteEditorFrame>
  );
};

export default RichTextNoteEditor;
