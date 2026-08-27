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
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Designer, DesignerKeyboard } from '@wisemapping/mindplot';
import { collectSearchableNodes, filterSearchableNodes, SearchableNode } from './findInMapUtils';
import {
  PanelContainer,
  HeaderRow,
  MatchCounter,
  ResultsList,
  ResultItem,
  HighlightedMatch,
  EmptyState,
} from './styled';

type FindInMapPanelProps = {
  designer: Designer;
  closeModal: () => void;
};

const FindInMapPanel = ({ designer, closeModal }: FindInMapPanelProps): ReactElement => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // The map's own keyboard shortcuts (delete, expand, zoom, ...) must not fire
  // while the user is typing a search term.
  useEffect(() => {
    DesignerKeyboard.pause();
    return () => DesignerKeyboard.resume();
  }, []);

  const allNodes: SearchableNode[] = useMemo(
    () => collectSearchableNodes(designer.getMindmap().getCentralTopic()),
    [designer],
  );

  const matches = useMemo(() => filterSearchableNodes(allNodes, query), [allNodes, query]);

  const navigateToMatch = (index: number): void => {
    const match = matches[index];
    if (!match) {
      return;
    }
    setActiveIndex(index);
    const topic = designer.getModel().findTopicById(match.id);
    if (topic) {
      designer.revealNode(topic, true);
      designer.goToNode(topic, true);
    }
  };

  // Jump to (and select) the first match every time the result set changes,
  // mirroring the browser's own find-in-page behavior.
  useEffect(() => {
    navigateToMatch(0);
  }, [matches]);

  const goToOffset = (offset: number): void => {
    if (matches.length === 0) {
      return;
    }
    navigateToMatch((activeIndex + offset + matches.length) % matches.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    switch (event.key) {
      case 'Escape':
        event.stopPropagation();
        closeModal();
        break;
      case 'Enter':
        event.preventDefault();
        goToOffset(event.shiftKey ? -1 : 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        goToOffset(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        goToOffset(-1);
        break;
      default:
        break;
    }
  };

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const hasMatches = matches.length > 0;

  const renderHighlighted = (text: string): ReactElement => {
    const matchStart = text.toLowerCase().indexOf(trimmedQuery.toLowerCase());
    if (matchStart === -1) {
      return <>{text}</>;
    }
    const matchEnd = matchStart + trimmedQuery.length;
    return (
      <>
        {text.slice(0, matchStart)}
        <HighlightedMatch>{text.slice(matchStart, matchEnd)}</HighlightedMatch>
        {text.slice(matchEnd)}
      </>
    );
  };

  return (
    <PanelContainer elevation={8} data-testid="find-in-map-panel">
      <HeaderRow>
        <TextField
          autoFocus
          fullWidth
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={intl.formatMessage({
            id: 'find-in-map.placeholder',
            defaultMessage: 'Find node...',
          })}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setQuery('')}
                    aria-label={intl.formatMessage({
                      id: 'find-in-map.clear',
                      defaultMessage: 'Clear search',
                    })}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      </HeaderRow>
      {hasQuery && (
        <HeaderRow sx={{ justifyContent: 'space-between', mt: 0.5 }}>
          <MatchCounter data-testid="find-in-map-counter">
            {hasMatches
              ? intl.formatMessage(
                  { id: 'find-in-map.match-counter', defaultMessage: '{current} of {total}' },
                  { current: activeIndex + 1, total: matches.length },
                )
              : intl.formatMessage({ id: 'find-in-map.no-results', defaultMessage: 'No matches' })}
          </MatchCounter>
          <Box>
            <IconButton
              size="small"
              disabled={!hasMatches}
              onClick={() => goToOffset(-1)}
              aria-label={intl.formatMessage({
                id: 'find-in-map.previous',
                defaultMessage: 'Previous match',
              })}
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              disabled={!hasMatches}
              onClick={() => goToOffset(1)}
              aria-label={intl.formatMessage({
                id: 'find-in-map.next',
                defaultMessage: 'Next match',
              })}
            >
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>
          </Box>
        </HeaderRow>
      )}
      {hasQuery && (
        <ResultsList data-testid="find-in-map-results">
          {hasMatches ? (
            matches.map((match, index) => (
              <ResultItem
                key={match.id}
                active={index === activeIndex}
                onClick={() => navigateToMatch(index)}
                title={match.text}
              >
                {renderHighlighted(match.text)}
              </ResultItem>
            ))
          ) : (
            <EmptyState>
              <FormattedMessage
                id="find-in-map.empty-state"
                defaultMessage="No node matches “{query}”."
                values={{ query: trimmedQuery }}
              />
            </EmptyState>
          )}
        </ResultsList>
      )}
    </PanelContainer>
  );
};

export default FindInMapPanel;
