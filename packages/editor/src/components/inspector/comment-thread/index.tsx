import React, { ReactElement, useState, useEffect, useCallback } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import CommentIcon from '@mui/icons-material/Comment';
import {
  CommentContainer,
  CommentHeader,
  CommentList,
  CommentItem,
  CommentAuthorRow,
  CommentAuthor,
  CommentTime,
  CommentBody,
  CommentInputContainer,
  CommentEmpty,
} from './style';

export interface Comment {
  id: number | string;
  mindmapId: number | string;
  topicId: string;
  authorId: number;
  authorName?: string;
  body: string;
  createdAt: number;
}

export interface CommentThreadProps {
  mapId?: number | string;
  topicId?: string;
  readOnly?: boolean;
  currentUserId?: number;
  fetchComments?: (mapId: number | string, topicId: string) => Promise<Comment[]>;
  createComment?: (mapId: number | string, topicId: string, body: string) => Promise<Comment>;
  deleteComment?: (mapId: number | string, commentId: number | string) => Promise<void>;
}

export const CommentThread = ({
  mapId,
  topicId,
  readOnly = false,
  currentUserId,
  fetchComments,
  createComment,
  deleteComment,
}: CommentThreadProps): ReactElement => {
  const intl = useIntl();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentBody, setNewCommentBody] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const loadComments = useCallback(async () => {
    if (!mapId || !topicId || !fetchComments) return;
    try {
      setLoading(true);
      const res = await fetchComments(mapId, topicId);
      setComments(res);
    } catch {
      // Ignore or handle error gracefully
    } finally {
      setLoading(false);
    }
  }, [mapId, topicId, fetchComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handlePost = async () => {
    if (!newCommentBody.trim() || !mapId || !topicId || !createComment) return;
    try {
      const created = await createComment(mapId, topicId, newCommentBody.trim());
      setComments((prev) => [...prev, created]);
      setNewCommentBody('');
    } catch {
      // Error handling
    }
  };

  const handleDelete = async (commentId: number | string) => {
    if (!mapId || !deleteComment) return;
    try {
      await deleteComment(mapId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // Error handling
    }
  };

  const formatTime = (timestamp: number): string => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <CommentContainer>
      <CommentHeader>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CommentIcon fontSize="small" />
          <FormattedMessage id="editor.comments.title" defaultMessage="Topic Comments" />
        </span>
        {topicId && <span style={{ fontSize: 11, opacity: 0.6 }}>#{topicId}</span>}
      </CommentHeader>

      <CommentList>
        {comments.length === 0 && !loading && (
          <CommentEmpty>
            <FormattedMessage
              id="editor.comments.empty"
              defaultMessage="No comments on this topic yet. Start a discussion below."
            />
          </CommentEmpty>
        )}
        {comments.map((comment) => (
          <CommentItem key={comment.id}>
            <CommentAuthorRow>
              <CommentAuthor>{comment.authorName || `User #${comment.authorId}`}</CommentAuthor>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CommentTime>{formatTime(comment.createdAt)}</CommentTime>
                {!readOnly &&
                  (currentUserId === comment.authorId || !currentUserId) &&
                  deleteComment && (
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(comment.id)}
                      sx={{ padding: '2px', opacity: 0.7 }}
                      title={intl.formatMessage({
                        id: 'editor.comments.delete',
                        defaultMessage: 'Delete comment',
                      })}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  )}
              </span>
            </CommentAuthorRow>
            <CommentBody>{comment.body}</CommentBody>
          </CommentItem>
        ))}
      </CommentList>

      {!readOnly && (
        <CommentInputContainer>
          <TextField
            size="small"
            multiline
            minRows={2}
            maxRows={4}
            value={newCommentBody}
            onChange={(e) => setNewCommentBody(e.target.value)}
            placeholder={intl.formatMessage({
              id: 'editor.comments.placeholder',
              defaultMessage: 'Write a comment...',
            })}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handlePost();
              }
            }}
          />
          <Button
            variant="contained"
            size="small"
            endIcon={<SendIcon />}
            disabled={!newCommentBody.trim()}
            onClick={handlePost}
            sx={{ alignSelf: 'flex-end', borderRadius: '16px', textTransform: 'none' }}
          >
            <FormattedMessage id="editor.comments.send" defaultMessage="Post" />
          </Button>
        </CommentInputContainer>
      )}
    </CommentContainer>
  );
};

export default CommentThread;
