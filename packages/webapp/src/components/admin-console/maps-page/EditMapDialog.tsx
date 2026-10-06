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

import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import MemoTextField from '../shared/MemoTextField';

export interface MapFormData {
  title: string;
  description: string;
  public: boolean;
  isLocked: boolean;
}

// Shared, so that the memoised fields keep the same props from one key to the next.
const fieldSx = { mb: 2 };

type EditMapDialogProps = {
  open: boolean;
  /** The form's starting values, read when the dialog mounts: give it a new `key` to reset it. */
  initialData: MapFormData;
  isPending: boolean;
  onClose: () => void;
  /** Called with a valid form; resolves to the message to show when saving it failed. */
  onSubmit: (data: MapFormData) => Promise<string | undefined>;
};

/**
 * The admin's edit map dialog. It owns the form, so that a key re-renders this dialog and not
 * the maps page, and its fields are memoised, so that a key re-renders only the field typed in
 * (see MemoTextField).
 */
const EditMapDialog = ({
  open,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: EditMapDialogProps): ReactElement => {
  const intl = useIntl();
  const [formData, setFormData] = useState<MapFormData>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((current) => ({ ...current, title: e.target.value })),
    [],
  );
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((current) => ({ ...current, description: e.target.value })),
    [],
  );

  // The visibility and lock selects do not take part in typing.
  const selects = useMemo(
    () => (
      <Box
        sx={{
          display: 'flex',
          gap: 2,
        }}
      >
        <FormControl fullWidth>
          <InputLabel>Public Access</InputLabel>
          <Select
            value={formData.public ? 'public' : 'private'}
            label={intl.formatMessage({
              id: 'admin.public-access',
              defaultMessage: 'Public Access',
            })}
            onChange={(e) =>
              setFormData((current) => ({ ...current, public: e.target.value === 'public' }))
            }
          >
            <MenuItem value="private">Private</MenuItem>
            <MenuItem value="public">Public</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Lock Status</InputLabel>
          <Select
            value={formData.isLocked ? 'locked' : 'unlocked'}
            label={intl.formatMessage({
              id: 'admin.lock-status',
              defaultMessage: 'Lock Status',
            })}
            onChange={(e) =>
              setFormData((current) => ({ ...current, isLocked: e.target.value === 'locked' }))
            }
          >
            <MenuItem value="unlocked">Unlocked</MenuItem>
            <MenuItem value="locked">Locked</MenuItem>
          </Select>
        </FormControl>
      </Box>
    ),
    [formData.public, formData.isLocked, intl],
  );

  const handleSave = async () => {
    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const failure = await onSubmit(formData);
    if (failure) {
      setFormErrors({ general: failure });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {intl.formatMessage({
          id: 'admin.maps.edit-title',
          defaultMessage: 'Edit Map',
        })}
      </DialogTitle>
      <DialogContent>
        {formErrors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formErrors.general}
          </Alert>
        )}

        <MemoTextField
          autoFocus
          margin="dense"
          label={intl.formatMessage({
            id: 'admin.maps.title',
            defaultMessage: 'Title',
          })}
          fullWidth
          variant="outlined"
          value={formData.title}
          onChange={handleTitleChange}
          error={!!formErrors.title}
          helperText={formErrors.title}
          sx={fieldSx}
        />

        <MemoTextField
          margin="dense"
          label={intl.formatMessage({
            id: 'admin.maps.description',
            defaultMessage: 'Description',
          })}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.description}
          onChange={handleDescriptionChange}
          sx={fieldSx}
        />

        {selects}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {intl.formatMessage({
            id: 'common.cancel',
            defaultMessage: 'Cancel',
          })}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isPending}>
          {isPending ? (
            <CircularProgress size={20} />
          ) : (
            intl.formatMessage({
              id: 'common.save',
              defaultMessage: 'Save',
            })
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMapDialog;
