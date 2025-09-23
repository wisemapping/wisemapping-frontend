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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Popover from '@mui/material/Popover';
import React, { ReactElement, useState, useCallback, useRef, useEffect } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import SaveAndDelete from '../save-and-delete';
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';

type RichTextNoteEditorProps = {
  closeModal: () => void;
  noteModel: NodeProperty<string | undefined>;
};

/**
 * Rich text note editor using contentEditable for React 19 compatibility
 */
const RichTextNoteEditor = ({ closeModal, noteModel }: RichTextNoteEditorProps): ReactElement => {
  const initialValue = noteModel.getValue() || '';
  const [content, setContent] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);
  const [iconPickerAnchor, setIconPickerAnchor] = useState<HTMLButtonElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const submitHandler = useCallback(() => {
    closeModal();
    if (noteModel.setValue) {
      noteModel.setValue(content);
    }
  }, [closeModal, noteModel, content]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const handleIconPickerOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Save the current cursor position before opening the picker
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      console.log(
        'Cursor position saved:',
        savedRangeRef.current.startOffset,
        savedRangeRef.current.endOffset,
      );
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
            console.log(
              'Cursor position restored:',
              savedRangeRef.current.startOffset,
              savedRangeRef.current.endOffset,
            );
          }

          // Use document.execCommand for better compatibility with contentEditable
          const success = document.execCommand('insertText', false, emoji.emoji + ' ');
          console.log('insertText success:', success);

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
              console.log('Manual insertion used');
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
      editorRef.current.innerHTML = initialValue || '';
    }
  }, [initialValue]);

  return (
    <Box sx={{ px: 2, pb: 2, width: '500px', height: '520px' }}>
      {/* Toolbar */}
      <Box
        sx={{ mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1, backgroundColor: '#f5f5f5' }}
      >
        {/* Single Row - All Options */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'nowrap',
            overflowX: 'auto',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150, flexShrink: 0 }}>
            <Select
              defaultValue="normal"
              onChange={(e) => setHeader(e.target.value)}
              displayEmpty
              sx={{ fontSize: '12px' }}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="h1">Heading 1</MenuItem>
              <MenuItem value="h2">Heading 2</MenuItem>
              <MenuItem value="h3">Heading 3</MenuItem>
              <MenuItem value="h4">Heading 4</MenuItem>
              <MenuItem value="h5">Heading 5</MenuItem>
              <MenuItem value="h6">Heading 6</MenuItem>
              <MenuItem value="blockquote">Quote</MenuItem>
              <MenuItem value="pre">Code Block</MenuItem>
            </Select>
          </FormControl>

          <ButtonGroup size="small" variant="outlined" sx={{ flexShrink: 0 }}>
            <Button onClick={() => execCommand('bold')} title="Bold">
              <strong>B</strong>
            </Button>
            <Button onClick={() => execCommand('italic')} title="Italic">
              <em>I</em>
            </Button>
            <Button onClick={() => execCommand('underline')} title="Underline">
              <u>U</u>
            </Button>
            <Button onClick={() => execCommand('strikeThrough')} title="Strikethrough">
              <s>S</s>
            </Button>
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined" sx={{ flexShrink: 0 }}>
            <Button onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
              •
            </Button>
            <Button onClick={() => execCommand('insertOrderedList')} title="Numbered List">
              1.
            </Button>
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined" sx={{ flexShrink: 0 }}>
            <Button onClick={insertLink} title="Insert Link">
              🔗
            </Button>
            <Button onClick={handleIconPickerOpen} title="Insert Icon">
              😀
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Editor */}
      <Box
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onBlur={handleContentChange}
        suppressContentEditableWarning={true}
        sx={{
          height: '350px',
          border: '1px solid #ccc',
          borderRadius: 1,
          p: 2,
          overflow: 'auto',
          backgroundColor: 'white',
          fontFamily: 'Arial, sans-serif',
          '&:focus': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        }}
      />

      <br />
      <SaveAndDelete model={noteModel} closeModal={closeModal} submitHandler={submitHandler} />

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
        <EmojiPicker
          onEmojiClick={handleEmojiSelect}
          lazyLoadEmojis={true}
          autoFocusSearch={true}
          previewConfig={{ showPreview: false }}
          emojiStyle={EmojiStyle.NATIVE}
          skinTonesDisabled
        />
      </Popover>
    </Box>
  );
};

export default RichTextNoteEditor;
