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

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import BaseDialog from '../base-dialog';
import {
  FormatOption,
  FormatSelect,
  GroupLabel,
  ImageFormatOption,
  ZoomToFitLabel,
} from './styled';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Designer,
  TextExporterFactory,
  ImageExporterFactory,
  Exporter,
  Mindmap,
  SizeType,
} from '@wisemapping/editor';
import type { ThemeType } from '@wisemapping/mindplot';
import { fetchMindmap } from '../../../editor-page/PersistenceManagerUtils';

import Checkbox from '@mui/material/Checkbox';
import { useFetchMapMetadata } from '../../../../classes/middleware';
import { trackExport } from '../../../../utils/analytics';

type ExportFormat = 'svg' | 'jpg' | 'png' | 'pdf' | 'txt' | 'mm' | 'mmx' | 'wxml' | 'md';

// The extension of the downloaded file. mmx is only the id of the Freeplane format: Freeplane maps
// are .mm files, as FreeMind ones.
const fileExtension = (format: ExportFormat): string => (format === 'mmx' ? 'mm' : format);
type ExportGroup = 'image' | 'document' | 'mindmap-tool';

type ExportDialogProps = {
  mapId: number;
  enableImgExport: boolean;
  svgXml?: string;
  /** The designer of the editor the dialog was opened from; none from the map list. */
  designer?: Designer | undefined;
  onClose: () => void;
};

const ExportDialog = ({
  mapId,
  onClose,
  enableImgExport,
  designer,
}: ExportDialogProps): React.ReactElement => {
  const intl = useIntl();
  const { data: mapMetadata } = useFetchMapMetadata(mapId);

  const [exportGroup, setExportGroup] = React.useState<ExportGroup>(
    enableImgExport ? 'image' : 'document',
  );
  const [exportFormat, setExportFormat] = React.useState<ExportFormat>(
    enableImgExport ? 'svg' : 'txt',
  );

  const [zoomToFit, setZoomToFit] = React.useState<boolean>(true);
  const exportTheme: ThemeType = 'prism';

  const handleOnExportFormatChange = (event: SelectChangeEvent<ExportFormat>) => {
    setExportFormat(event.target.value);
  };

  const handleOnGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as ExportGroup;
    setExportGroup(value);

    let defaultFormat: ExportFormat;
    switch (value) {
      case 'document':
        defaultFormat = 'txt';
        break;
      case 'image':
        defaultFormat = 'svg';
        break;
      case 'mindmap-tool':
        defaultFormat = 'wxml';
        break;
    }
    setExportFormat(defaultFormat);
  };

  const handleOnClose = (): void => {
    onClose();
  };

  const handleOnZoomToFit = (): void => {
    setZoomToFit(!zoomToFit);
  };

  const exporter = async (formatType: ExportFormat): Promise<string> => {
    // exporting from editor toolbar action
    if (designer !== undefined) {
      // The export is rendered in the export theme on the live canvas, so put the
      // map's own theme back once it is done (or failed): the editor saves this model.
      const originalTheme = designer.getMindmap().getTheme();
      const swapTheme = originalTheme !== exportTheme;
      try {
        if (swapTheme) {
          designer.applyTheme(exportTheme);
        }
        return await exportFromDesigner(designer, formatType);
      } finally {
        if (swapTheme) {
          designer.applyTheme(originalTheme);
        }
      }
    }

    // exporting from map list: a fresh copy of the map, so it can take the export theme.
    const mindmap = await fetchMindmap(mapId);
    if (mindmap.getTheme() !== exportTheme) {
      mindmap.setTheme(exportTheme);
    }
    return createExporter(formatType, mindmap).exportAndEncode();
  };

  const exportFromDesigner = (current: Designer, formatType: ExportFormat): Promise<string> => {
    const svgElement = current.getWorkSpace().getSVGElement();
    const size: SizeType = { width: window.innerWidth, height: window.innerHeight };

    // Resolve the canvas background color applied by the Designer so exports
    // include it (SVG, PNG, JPEG, PDF). Designer sets the style on the SVG's
    // grandparent element (see Canvas.setBackgroundStyle). Read after
    // applyTheme so the color matches the export theme.
    let backgroundColor = '#ffffff';
    const canvasContainer = svgElement?.parentElement?.parentElement;
    if (canvasContainer) {
      const resolved = window.getComputedStyle(canvasContainer).backgroundColor;
      if (resolved && resolved !== 'rgba(0, 0, 0, 0)' && resolved !== 'transparent') {
        backgroundColor = resolved;
      }
    }

    return createExporter(
      formatType,
      current.getMindmap(),
      svgElement,
      size,
      backgroundColor,
    ).exportAndEncode();
  };

  const createExporter = (
    formatType: ExportFormat,
    mindmap: Mindmap,
    svgElement?: Element,
    size?: SizeType,
    backgroundColor = '#ffffff',
  ): Exporter => {
    let exporter: Exporter;
    switch (formatType) {
      case 'png':
      case 'jpg':
      case 'svg':
      case 'pdf': {
        exporter = ImageExporterFactory.create(
          formatType,
          svgElement!,
          size!.width,
          size!.height,
          zoomToFit,
          backgroundColor,
        );
        break;
      }
      case 'wxml':
      case 'mm':
      case 'mmx':
      case 'md':
      case 'txt': {
        exporter = TextExporterFactory.create(formatType, mindmap);
        break;
      }
      default: {
        const exhaustiveCheck: never = formatType;
        throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
      }
    }

    return exporter;
  };

  const handleOnSubmit = (): void => {
    exporter(exportFormat)
      .then((url: string) => {
        // Track specific export format in Google Analytics
        trackExport(exportFormat, exportGroup);

        // Create hidden anchor to force download ...
        const anchor: HTMLAnchorElement = document.createElement('a');
        anchor.style.display = 'display: none';
        anchor.download = `${mapMetadata?.title ?? 'mindmap'}.${fileExtension(exportFormat)}`;
        anchor.href = url;
        document.body.appendChild(anchor);

        // Trigger click ...
        anchor.click();

        // Clean up ...
        URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
      })
      .catch((fail) => {
        console.error('Unexpected error during export:' + fail);
      });

    onClose();
  };

  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        onSubmit={handleOnSubmit}
        title={intl.formatMessage({ id: 'export.title', defaultMessage: 'Export' })}
        description={intl.formatMessage({
          id: 'export.desc',
          defaultMessage:
            'Export this map in the format that you want and start using it in your presentations or sharing by email',
        })}
        submitButton={intl.formatMessage({ id: 'export.title', defaultMessage: 'Export' })}
      >
        {!enableImgExport && (
          <Alert severity="info">
            <FormattedMessage
              id="export.warning"
              defaultMessage="Exporting to Image (SVG,PNG,JPEG,PDF) is only available in the editor toolbar."
            />
          </Alert>
        )}
        <FormControl component="fieldset">
          <RadioGroup name="export" value={exportGroup} onChange={handleOnGroupChange}>
            <FormControl>
              <GroupLabel
                value="image"
                disabled={!enableImgExport}
                control={<Radio color="primary" />}
                label={intl.formatMessage({
                  id: 'export.image',
                  defaultMessage:
                    'Image (SVG, PNG, JPEG, PDF): Get a graphic representation of your map including all colors and shapes.',
                })}
                color="secondary"
                sx={{ fontSize: '9px' }}
              />
              {exportGroup == 'image' && (
                <>
                  <FormatSelect
                    onChange={handleOnExportFormatChange}
                    variant="outlined"
                    value={exportFormat}
                  >
                    <ImageFormatOption value="svg">
                      Scalable Vector Graphics (SVG)
                    </ImageFormatOption>
                    <ImageFormatOption value="png">
                      Portable Network Graphics (PNG)
                    </ImageFormatOption>
                    <ImageFormatOption value="jpg">JPEG Image (JPEG)</ImageFormatOption>
                    <ImageFormatOption value="pdf">
                      Portable Document Format (PDF)
                    </ImageFormatOption>
                  </FormatSelect>
                  <ZoomToFitLabel
                    control={<Checkbox checked={zoomToFit} onChange={handleOnZoomToFit} />}
                    label={intl.formatMessage({
                      id: 'export.img-center',
                      defaultMessage: 'Center and zoom to fit',
                    })}
                  />
                </>
              )}
            </FormControl>

            <FormControl>
              <GroupLabel
                value="document"
                control={<Radio color="primary" />}
                label={intl.formatMessage({
                  id: 'export.document-label',
                  defaultMessage:
                    'Document (TXT, MD): Export your mindmap in a self-contained document ready to share',
                })}
                color="secondary"
              />
              {exportGroup == 'document' && (
                <FormatSelect
                  onChange={handleOnExportFormatChange}
                  variant="outlined"
                  value={exportFormat}
                >
                  <FormatOption value="txt">Plain Text File (TXT)</FormatOption>
                  <FormatOption value="md">Markdown (MD)</FormatOption>
                  {/* <FormatOption value="xls">
                                        Microsoft Excel (XLS)
                                    </FormatOption> */}
                </FormatSelect>
              )}
            </FormControl>

            <FormControl>
              <GroupLabel
                value="mindmap-tool"
                control={<Radio color="primary" />}
                label={intl.formatMessage({
                  id: 'export.document',
                  defaultMessage:
                    'Mindmap Tools (WXML, MM): Export your mindmap in thirdparty mindmap tool formats',
                })}
                color="secondary"
              />
              {exportGroup == 'mindmap-tool' && (
                <FormatSelect
                  onChange={handleOnExportFormatChange}
                  variant="outlined"
                  value={exportFormat}
                >
                  <FormatOption value="wxml">WiseMapping (WXML)</FormatOption>
                  <FormatOption value="mm">Freemind 1.0.1 (MM)</FormatOption>
                  <FormatOption value="mmx">Freeplane (MM)</FormatOption>
                  {/* <FormatOption value="mmap">
                                        MindManager (MMAP)
                                    </FormatOption> */}
                </FormatSelect>
              )}
            </FormControl>
          </RadioGroup>
        </FormControl>
      </BaseDialog>
    </div>
  );
};

export default ExportDialog;
