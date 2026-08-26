import styled from 'styled-components';
import { Theme } from '@mui/material/styles';

interface ThemedProps {
  theme?: Theme;
}

export const CommentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  gap: 12px;
  box-sizing: border-box;
  font-family: inherit;
`;

export const CommentHeader = styled.div<ThemedProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme?.palette?.text?.primary || '#1c1917'};
`;

export const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  max-height: 280px;
`;

export const CommentItem = styled.div<ThemedProps>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
  border: 1px solid
    ${({ theme }) =>
      theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
`;

export const CommentAuthorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
`;

export const CommentAuthor = styled.span<ThemedProps>`
  font-weight: 600;
  color: ${({ theme }) => theme?.palette?.text?.primary || '#1c1917'};
`;

export const CommentTime = styled.span<ThemedProps>`
  font-size: 11px;
  color: ${({ theme }) => theme?.palette?.text?.secondary || '#78716c'};
`;

export const CommentBody = styled.div<ThemedProps>`
  font-size: 13px;
  color: ${({ theme }) => theme?.palette?.text?.primary || '#1c1917'};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const CommentInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
`;

export const CommentEmpty = styled.div<ThemedProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  font-size: 13px;
  color: ${({ theme }) => theme?.palette?.text?.secondary || '#78716c'};
  text-align: center;
`;
