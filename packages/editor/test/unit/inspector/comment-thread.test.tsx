/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CommentThread, { Comment } from '../../../src/components/inspector/comment-thread';

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage || '',
  }),
  FormattedMessage: ({ defaultMessage }: { defaultMessage?: string }) => <span>{defaultMessage}</span>,
  IntlProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('CommentThread Component', () => {
  const mockComments: Comment[] = [
    {
      id: 1,
      mindmapId: 10,
      topicId: 'topic-1',
      authorId: 100,
      authorName: 'Alice',
      body: 'First comment on this topic',
      createdAt: Date.now() - 60000,
    },
    {
      id: 2,
      mindmapId: 10,
      topicId: 'topic-1',
      authorId: 101,
      authorName: 'Bob',
      body: 'Second comment here',
      createdAt: Date.now(),
    },
  ];

  it('renders comments list when provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue(mockComments);

    renderWithProviders(
      <CommentThread
        mapId={10}
        topicId="topic-1"
        fetchComments={fetchMock}
      />,
    );

    expect(screen.getByText('Topic Comments')).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('First comment on this topic')).toBeDefined();
      expect(screen.getByText('Second comment here')).toBeDefined();
    });
  });

  it('renders empty state when no comments exist', async () => {
    const fetchMock = jest.fn().mockResolvedValue([]);

    renderWithProviders(
      <CommentThread
        mapId={10}
        topicId="topic-1"
        fetchComments={fetchMock}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No comments on this topic yet/i),
      ).toBeDefined();
    });
  });

  it('posts a new comment when submit button is clicked', async () => {
    const fetchMock = jest.fn().mockResolvedValue([]);
    const createMock = jest.fn().mockImplementation((mapId, topicId, body) =>
      Promise.resolve({
        id: 3,
        mindmapId: mapId,
        topicId,
        authorId: 100,
        authorName: 'Me',
        body,
        createdAt: Date.now(),
      }),
    );

    renderWithProviders(
      <CommentThread
        mapId={10}
        topicId="topic-1"
        fetchComments={fetchMock}
        createComment={createMock}
      />,
    );

    const input = screen.getByPlaceholderText(/Write a comment.../i);
    fireEvent.change(input, { target: { value: 'Brand new comment' } });

    const postBtn = screen.getByRole('button', { name: /Post/i });
    expect(postBtn.hasAttribute('disabled')).toBeFalsy();

    fireEvent.click(postBtn);

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith(10, 'topic-1', 'Brand new comment');
      expect(screen.getByText('Brand new comment')).toBeDefined();
    });
  });

  it('hides input when readOnly is true', () => {
    renderWithProviders(
      <CommentThread
        mapId={10}
        topicId="topic-1"
        readOnly={true}
      />,
    );

    expect(screen.queryByPlaceholderText(/Write a comment.../i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Post/i })).toBeNull();
  });
});
