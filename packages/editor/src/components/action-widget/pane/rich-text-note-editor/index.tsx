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
import { useTheme } from '@mui/material/styles';
import React, { ReactElement, useState, useCallback, useRef, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import NodeProperty from '../../../../classes/model/node-property';
import SaveAndDelete from '../save-and-delete';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';

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
  const [characterCount, setCharacterCount] = useState(initialValue.length);
  const MAX_CHARACTERS = 10000;
  const theme = useTheme();

  const submitHandler = useCallback(() => {
    closeModal();
    if (noteModel.setValue) {
      noteModel.setValue(content);
    }
  }, [closeModal, noteModel, content]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;

      // Get plain text length for character count validation
      const textContent = editorRef.current.textContent || '';

      // Update character count
      setCharacterCount(textContent.length);

      // Prevent exceeding character limit
      if (textContent.length > MAX_CHARACTERS) {
        // Truncate content to stay within limit
        const truncatedText = textContent.substring(0, MAX_CHARACTERS);

        // Create a temporary element to convert plain text back to HTML
        const tempDiv = document.createElement('div');
        tempDiv.textContent = truncatedText;
        const truncatedHtml = tempDiv.innerHTML;

        // Update the editor content
        editorRef.current.innerHTML = truncatedHtml;
        setContent(truncatedHtml);
        setCharacterCount(MAX_CHARACTERS);

        // Position cursor at the end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        setContent(newContent);
      }
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      const textContent = editorRef.current.textContent || '';
      setCharacterCount(textContent.length);
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
      // Auto-focus the editor when it opens
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 100);
    }
  }, [initialValue]);

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
    <Box
      sx={{
        pl: 0,
        pr: 0,
        pb: 0.375,
        width: '650px',
        height: '470px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 4px 12px rgba(255, 255, 255, 0.1)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          m: 0,
          p: 0,
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${theme.palette.divider}`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          backgroundColor: theme.palette.background.default,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 2px 4px rgba(255, 255, 255, 0.05)'
              : '0 2px 4px rgba(0, 0, 0, 0.05)',
        }}
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
              sx={{
                fontSize: '14px',
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                },
                '&.Mui-focused': {
                  borderColor: theme.palette.divider,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.text.secondary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                },
              }}
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
            </Select>
          </FormControl>

          <ButtonGroup size="small" variant="outlined" sx={{ flexShrink: 0 }}>
            <Button
              onClick={insertLink}
              title="Insert Link"
              sx={{
                minWidth: '36px',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              🔗
            </Button>
            <Button
              onClick={handleIconPickerOpen}
              title="Insert Icon"
              sx={{
                minWidth: '36px',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              😀
            </Button>
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined" sx={{ flexShrink: 0 }}>
            <Button
              onClick={() => execCommand('bold')}
              title="Bold"
              sx={{
                minWidth: '36px',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <strong>B</strong>
            </Button>
            <Button
              onClick={() => execCommand('italic')}
              title="Italic"
              sx={{
                minWidth: '36px',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <em>I</em>
            </Button>
            <Button
              onClick={() => execCommand('underline')}
              title="Underline"
              sx={{
                minWidth: '36px',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <u>U</u>
            </Button>
            <Button
              onClick={() => execCommand('strikeThrough')}
              title="Strikethrough"
              sx={{
                minWidth: '36px',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <s>S</s>
            </Button>
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined" sx={{ flexShrink: 0 }}>
            <Button
              onClick={() => execCommand('insertUnorderedList')}
              title="Bullet List"
              sx={{
                minWidth: '36px',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              •
            </Button>
            <Button
              onClick={() => execCommand('insertOrderedList')}
              title="Numbered List"
              sx={{
                minWidth: '36px',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              1.
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Editor */}
      <Box
        sx={{
          position: 'relative',
          height: '350px',
          border: `1px solid ${theme.palette.divider}`,
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === 'dark'
              ? 'inset 0 1px 3px rgba(255, 255, 255, 0.1)'
              : 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onBlur={handleContentChange}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
          suppressContentEditableWarning={true}
          sx={{
            height: '100%',
            p: 2.5,
            overflow: 'auto',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? '#606060' : '#c1c1c1',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#707070' : '#a8a8a8',
              },
            },
          }}
        />
      </Box>

      {/* Character Counter and Save/Delete Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
        }}
      >
        {/* Character Counter */}
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

        {/* Save and Delete Buttons */}
        <SaveAndDelete model={noteModel} closeModal={closeModal} submitHandler={submitHandler} />
      </Box>

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
          theme={theme.palette.mode === 'dark' ? Theme.DARK : Theme.LIGHT}
        />
      </Popover>
    </Box>
  );
};

export default RichTextNoteEditor;
