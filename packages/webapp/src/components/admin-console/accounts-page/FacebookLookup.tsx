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

import React, { ReactElement, useState } from 'react';
import { useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { User } from './types';

type FacebookLookupProps = {
  /** Finds the account of a Facebook user id; rejects when there is none. */
  onLookup: (facebookId: string) => Promise<User>;
  /** Asks to remove the Facebook association of the account found. */
  onRemove: (user: User) => void;
};

/**
 * The Facebook data deletion lookup: finds the account of a Facebook user id. It owns the id
 * field and the lookup result, so that a key re-renders only this lookup, not the accounts page
 * and its filter selects (in development a re-rendered MUI FormControl updates itself from an
 * effect, and characters typed in one burst, as Cypress types them, add up to React's
 * nested-update limit). Give it a new `key` to clear it.
 */
const FacebookLookup = ({ onLookup, onRemove }: FacebookLookupProps): ReactElement => {
  const intl = useIntl();
  const [facebookIdInput, setFacebookIdInput] = useState('');
  const [facebookLookupResult, setFacebookLookupResult] = useState<User | null>(null);
  const [facebookLookupError, setFacebookLookupError] = useState('');
  const [isFacebookLookupLoading, setIsFacebookLookupLoading] = useState(false);

  const handleFacebookLookup = () => {
    const id = facebookIdInput.trim();
    if (!id) return;
    setIsFacebookLookupLoading(true);
    setFacebookLookupResult(null);
    setFacebookLookupError('');
    onLookup(id)
      .then((user) => setFacebookLookupResult(user))
      .catch(() =>
        setFacebookLookupError(
          intl.formatMessage({
            id: 'admin.facebook.lookup-not-found',
            defaultMessage: 'No account found for this Facebook user ID.',
          }),
        ),
      )
      .finally(() => setIsFacebookLookupLoading(false));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        pt: 1,
        pb: 1,
        borderTop: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <TextField
        label="facebookId"
        placeholder="652098797767905"
        value={facebookIdInput}
        onChange={(e) => {
          setFacebookIdInput(e.target.value);
          setFacebookLookupResult(null);
          setFacebookLookupError('');
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleFacebookLookup()}
        size="small"
        sx={{ minWidth: 240, fontFamily: 'monospace' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FacebookIcon fontSize="small" sx={{ color: '#1877F2' }} />
              </InputAdornment>
            ),
            endAdornment: isFacebookLookupLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : null,
          },
        }}
      />
      <Button
        size="small"
        variant="outlined"
        onClick={handleFacebookLookup}
        disabled={!facebookIdInput.trim() || isFacebookLookupLoading}
        sx={{ alignSelf: 'center', borderColor: '#1877F2', color: '#1877F2' }}
      >
        {intl.formatMessage({
          id: 'admin.facebook.lookup-button',
          defaultMessage: 'Find Account',
        })}
      </Button>
      {facebookLookupError && (
        <Alert severity="warning" sx={{ py: 0, alignSelf: 'center' }}>
          {facebookLookupError}
        </Alert>
      )}
      {facebookLookupResult && (
        <Alert
          severity="success"
          sx={{ py: 0, alignSelf: 'center' }}
          action={
            <Button
              size="small"
              color="error"
              startIcon={<LinkOffIcon />}
              onClick={() => onRemove(facebookLookupResult)}
            >
              {intl.formatMessage({
                id: 'admin.facebook.remove',
                defaultMessage: 'Remove',
              })}
            </Button>
          }
        >
          <strong>{facebookLookupResult.fullName}</strong> &lt;
          {facebookLookupResult.email}&gt;
        </Alert>
      )}
    </Box>
  );
};

export default FacebookLookup;
