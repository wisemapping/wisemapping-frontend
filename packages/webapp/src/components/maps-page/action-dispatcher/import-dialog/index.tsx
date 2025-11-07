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
import { Importer, TextImporterFactory } from '@wisemapping/editor';
import React, { useContext } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation } from 'react-query';
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

const defaultModel: ImportModel = { title: '' };
const ImportDialog = ({ onClose }: CreateProps): React.ReactElement => {
  const client = useContext(ClientContext);
  const [model, setModel] = React.useState<ImportModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();
  const [errorFile, setErrorFile] = React.useState<ErrorFile>({ error: false, message: '' });
  const intl = useIntl();

  const mutation = useMutation<number, ErrorInfo, ImportModel>(
    (model: ImportModel) => {
      return client.importMap(model);
    },
    {
      onSuccess: (mapId: number) => {
        window.location.href = `/c/maps/${mapId}/edit`;
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const handleOnClose = (): void => {
    onClose();
    setModel(defaultModel);
    setError(undefined);
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(undefined);
    mutation.mutate(model);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof ImportModel]: value });
  };

  const handleOnFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
    const reader = new FileReader();

    if (files) {
      const file = files[0];
      const extensionFile = file.name.split('.').pop()?.toLowerCase();
      // Closure to capture the file information.
      reader.onload = (event) => {
        // Suggest file name ...
        const fileName = file.name;
        if (fileName) {
          const title = fileName.split('.')[0];
          if (!model.title || 0 === model.title.length) {
            model.title = title;
          }
        }

        const extensionAccept = ['wxml', 'mm', 'mmx', 'xmind', 'mmap', 'opml'];

        if (!extensionFile || !extensionAccept.includes(extensionFile)) {
          setErrorFile({
            error: true,
            message: intl.formatMessage(
              {
                id: 'import.error-file',
                defaultMessage: 'Import error {error}',
              },
              {
                error:
                  'You can import WiseMapping, FreeMind, Freeplane, XMind, MindManager, and OPML maps to your list of maps. Select the file you want to import.',
              },
            ),
          });
        }

        model.contentType =
          extensionFile === 'xmind' ? 'application/vnd.xmind.workbook' : 'application/xml';

        const fileContent = event?.target?.result;
        let mapContent: string | Uint8Array;
        if (typeof fileContent === 'string') {
          mapContent = fileContent;
        } else if (fileContent instanceof ArrayBuffer) {
          mapContent = new Uint8Array(fileContent);
        } else {
          mapContent = '';
        }

        try {
          const importer: Importer = TextImporterFactory.create(
            extensionFile,
            mapContent,
          );

          importer.import(model.title, model.description).then((res) => {
            model.content = res;
            setModel({ ...model });
          });
        } catch (e) {
          if (e instanceof Error) {
            setErrorFile({
              error: true,
              message: intl.formatMessage(
                {
                  id: 'import.error-file',
                  defaultMessage: 'Import error {error}',
                },
                {
                  error: e.message,
                },
              ),
            });
          }
        }
      };

      // Read in the image file as a data URL.
      if (extensionFile === 'xmind') {
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
