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

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { ImportError, Importer, TextImporterFactory } from '@wisemapping/editor';
import React, { useContext, useEffect } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation } from '@tanstack/react-query';
import { ErrorInfo } from '../../../../classes/client';
import Input from '../../../form/input';
import BaseDialog from '../base-dialog';
import { ClientContext } from '../../../../classes/provider/client-context';

export type ImportModel = {
  title: string;
  description?: string;
  contentType?: string;
  content?: null | string;
};

export type CreateProps = {
  onClose: () => void;
};

type ErrorFile = {
  error: boolean;
  message: string;
};

const defaultModel: ImportModel = { title: '', description: '' };
const ImportDialog = ({ onClose }: CreateProps): React.ReactElement => {
  const client = useContext(ClientContext);
  const [model, setModel] = React.useState<ImportModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();
  const [errorFile, setErrorFile] = React.useState<ErrorFile>({ error: false, message: '' });
  // Counts the files picked: a read or import started for an earlier file is stale and ignored.
  const fileRequest = React.useRef(0);
  // A file is read asynchronously: its read needs what the user has typed by then, not what the
  // form held when the file was picked.
  const latestModel = React.useRef(model);
  useEffect(() => {
    latestModel.current = model;
  }, [model]);
  // The title last suggested from a file name: the next file replaces it, a typed title is kept.
  const suggestedTitle = React.useRef('');
  const intl = useIntl();

  const mutation = useMutation<number, ErrorInfo, ImportModel>({
    mutationFn: (model: ImportModel) => {
      return client.importMap(model);
    },
    onSuccess: (mapId: number) => {
      window.location.href = `/c/maps/${mapId}/edit`;
    },
    onError: (error) => {
      setError(error);
    },
  });

  const handleOnClose = (): void => {
    onClose();
    setModel(defaultModel);
    setError(undefined);
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(undefined);
    // Nothing to save until a file has been imported.
    if (errorFile.error || !model.content) {
      return;
    }
    mutation.mutate(model);
  };

  const showFileError = (message: string): void => {
    setErrorFile({
      error: true,
      message: intl.formatMessage(
        {
          id: 'import.error-file',
          defaultMessage: 'Import error {error}',
        },
        {
          error: message,
        },
      ),
    });
  };

  // An ImportError explains why the file can not be imported. Anything else is unexpected.
  const showImportError = (e: unknown): void => {
    if (!(e instanceof ImportError)) {
      console.error('Unexpected error importing the map:', e);
    }
    showFileError(e instanceof Error ? e.message : String(e));
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof ImportModel]: value });
  };

  const handleOnFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // A cancelled picker can fire a change with no file in it.
    const file = event?.target?.files?.[0];
    const reader = new FileReader();

    if (file) {
      const extensionFile = file.name.split('.').pop()?.toLowerCase();
      const request = ++fileRequest.current;
      const isStale = () => request !== fileRequest.current;
      // The previous file is no longer the one to save, even before this one is read.
      setModel((current) => ({ ...current, content: undefined }));

      // Closure to capture the file information.
      reader.onload = (event) => {
        if (isStale()) {
          return;
        }
        setErrorFile({ error: false, message: '' });

        // Forget the previous file and suggest its name as the title, unless the user typed one.
        // The updates are functional (never a mutation of `model`) so that what the user types
        // meanwhile is kept.
        const { title: typedTitle, description } = latestModel.current;
        const keepTitle = typedTitle !== '' && typedTitle !== suggestedTitle.current;
        const title = keepTitle ? typedTitle : file.name.split('.')[0];
        if (!keepTitle) {
          suggestedTitle.current = title;
        }
        setModel((current) => ({ ...current, title, content: undefined }));

        const extensionAccept = ['wxml', 'mm', 'mmx', 'xmind', 'mmap', 'opml'];

        if (!extensionFile || !extensionAccept.includes(extensionFile)) {
          setErrorFile({
            error: true,
            message: intl.formatMessage({
              id: 'import.error-unsupported-file',
              defaultMessage:
                'The file type is not supported. You can import WiseMapping, FreeMind, Freeplane, XMind, MindManager, and OPML maps.',
            }),
          });
          return;
        }

        const contentType =
          extensionFile === 'xmind' ? 'application/vnd.xmind.workbook' : 'application/xml';
        setModel((current) => ({ ...current, contentType }));

        const fileContent = event?.target?.result;
        let mapContent: string | ArrayBuffer;
        if (typeof fileContent === 'string') {
          mapContent = fileContent;
        } else if (fileContent instanceof ArrayBuffer) {
          mapContent = fileContent;
        } else {
          mapContent = '';
        }

        try {
          const importer: Importer = TextImporterFactory.create(extensionFile, mapContent);

          // A file that can not be imported rejects with an ImportError: show it, never save it.
          importer
            .import(title, description)
            .then((content) => {
              if (!isStale()) {
                setModel((current) => ({ ...current, content }));
              }
            })
            .catch((e: unknown) => {
              if (!isStale()) {
                showImportError(e);
              }
            });
        } catch (e) {
          showImportError(e);
        }
      };

      // XMind and MindManager (.mmap) files are ZIP archives.
      if (extensionFile === 'xmind' || extensionFile === 'mmap') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        onSubmit={handleOnSubmit}
        error={error}
        isLoading={mutation.isPending}
        title={intl.formatMessage({
          id: 'import.title',
          defaultMessage: 'Import existing mindmap',
        })}
        description={intl.formatMessage({
          id: 'import.description',
          defaultMessage:
            'You can import WiseMapping, FreeMind, Freeplane, XMind, MindManager, and OPML maps to your list of maps. Select the file you want to import.',
        })}
        submitButton={intl.formatMessage({ id: 'import.button', defaultMessage: 'Create' })}
      >
        {errorFile.error && (
          <Alert severity="error">
            <p>{errorFile.message}</p>
          </Alert>
        )}
        <FormControl fullWidth={true}>
          <input
            accept=".wxml,.mm,.mmx,.xmind,.mmap,.opml"
            id="contained-button-file"
            type="file"
            required={true}
            style={{ display: 'none' }}
            onChange={handleOnFileChange}
          />

          <Input
            name="title"
            type="text"
            label={intl.formatMessage({
              id: 'action.rename-name-placeholder',
              defaultMessage: 'Name',
            })}
            value={model.title}
            onChange={handleOnChange}
            error={error}
            fullWidth={true}
          />

          <Input
            name="description"
            type="text"
            label={intl.formatMessage({
              id: 'action.rename-description-placeholder',
              defaultMessage: 'Description',
            })}
            value={model.description}
            onChange={handleOnChange}
            required={false}
            fullWidth={true}
          />

          <label htmlFor="contained-button-file">
            <Button
              variant="outlined"
              color="primary"
              component="span"
              style={{ margin: '10px 5px', width: '100%' }}
            >
              <FormattedMessage id="maps.choose-file" defaultMessage="Choose a file" />
            </Button>
          </label>
        </FormControl>
      </BaseDialog>
    </div>
  );
};

export default ImportDialog;
