import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import BaseDialog from '../base-dialog';
import { useStyles } from './style';
import Alert from '@mui/material/Alert';
import { useFetchMapById } from '../../../../redux/clientSlice';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {
  Designer,
  TextExporterFactory,
  ImageExporterFactory,
  Exporter,
  Mindmap,
  SizeType,
} from '@wisemapping/editor';
import { fetchMindmap } from '../../../editor-page/PersistenceManagerUtils';

import Checkbox from '@mui/material/Checkbox';

type ExportFormat = 'svg' | 'jpg' | 'png' | 'txt' | 'mm' | 'wxml' | 'md';
type ExportGroup = 'image' | 'document' | 'mindmap-tool';

type ExportDialogProps = {
  mapId: number;
  enableImgExport: boolean;
  svgXml?: string;
  onClose: () => void;
};

const ExportDialog = ({
  mapId,
  onClose,
  enableImgExport,
}: ExportDialogProps): React.ReactElement => {
  const intl = useIntl();
  const [submit, setSubmit] = React.useState<boolean>(false);
  const { data: map } = useFetchMapById(mapId);

  const [exportGroup, setExportGroup] = React.useState<ExportGroup>(
    enableImgExport ? 'image' : 'document',
  );
  const [exportFormat, setExportFormat] = React.useState<ExportFormat>(
    enableImgExport ? 'svg' : 'txt',
  );

  const [zoomToFit, setZoomToFit] = React.useState<boolean>(true);

  const classes = useStyles();

  const handleOnExportFormatChange = (event) => {
    setExportFormat(event.target.value);
  };

  const handleOnGroupChange = (event) => {
    const value: ExportGroup = event.target.value;
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

  const handleOnSubmit = (): void => {
    setSubmit(true);
  };

  const handleOnZoomToFit = (): void => {
    setZoomToFit(!zoomToFit);
  };

  const exporter = async (formatType: ExportFormat): Promise<string> => {
    let svgElement: Element | null = null;
    let size: SizeType;
    let mindmap: Mindmap;

    const designer: Designer = globalThis.designer;
    // exporting from editor toolbar action
    if (designer != null) {
      // Depending on the type of export. It will require differt POST.
      const workspace = designer.getWorkSpace();
      svgElement = workspace.getSVGElement();
      size = { width: window.innerWidth, height: window.innerHeight };
      mindmap = designer.getMindmap();
    }
    // exporting from map list
    else {
      mindmap = await fetchMindmap(mapId);
    }

    let exporter: Exporter;
    switch (formatType) {
      case 'png':
      case 'jpg':
      case 'svg': {
        exporter = ImageExporterFactory.create(
          formatType,
          svgElement,
          size.width,
          size.height,
          zoomToFit,
        );
        break;
      }
      case 'wxml':
      case 'mm':
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

    return exporter.exportAndEncode();
  };

  useEffect(() => {
    if (submit) {
      exporter(exportFormat)
        .then((url: string) => {
          // Create hidden anchor to force download ...
          const anchor: HTMLAnchorElement = document.createElement('a');
          anchor.style.display = 'display: none';
          anchor.download = `${map?.title}.${exportFormat}`;
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
    }
  }, [submit]);

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
              defaultMessage="Exporting to Image (SVG,PNG,JPEG,PDF) is only available  in the editor toolbar."
            />
          </Alert>
        )}
        <FormControl component="fieldset">
          <RadioGroup name="export" value={exportGroup} onChange={handleOnGroupChange}>
            <FormControl>
              <FormControlLabel
                css={classes.label}
                value="image"
                disabled={!enableImgExport}
                control={<Radio color="primary" />}
                label={intl.formatMessage({
                  id: 'export.image',
                  defaultMessage:
                    'Image: Get a graphic representation of your map including all colors and shapes.',
                })}
                color="secondary"
                style={{ fontSize: '9px' }}
              />
              {exportGroup == 'image' && (
                <>
                  <Select
                    onChange={handleOnExportFormatChange}
                    variant="outlined"
                    value={exportFormat}
                    css={classes.select}
                  >
                    <MenuItem value="svg" css={classes.menu}>
                      Scalable Vector Graphics (SVG)
                    </MenuItem>
                    <MenuItem value="png" css={classes.menu}>
                      Portable Network Graphics (PNG)
                    </MenuItem>
                    <MenuItem value="jpg" css={classes.menu}>
                      JPEG Image (JPEG)
                    </MenuItem>
                  </Select>
                  <FormControlLabel
                    css={classes.select}
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
              <FormControlLabel
                css={classes.label}
                value="document"
                control={<Radio color="primary" />}
                label={intl.formatMessage({
                  id: 'export.document-label',
                  defaultMessage:
                    'Document: Export your mindmap in a self-contained document ready to share',
                })}
                color="secondary"
              />
              {exportGroup == 'document' && (
                <Select
                  onChange={handleOnExportFormatChange}
                  variant="outlined"
                  value={exportFormat}
                  css={classes.select}
                >
                  <MenuItem css={classes.select} value="txt">
                    Plain Text File (TXT)
                  </MenuItem>
                  <MenuItem css={classes.select} value="md">
                    Markdown (MD)
                  </MenuItem>
                  {/* <MenuItem className={classes.select} value="xls">
                                        Microsoft Excel (XLS)
                                    </MenuItem> */}
                </Select>
              )}
            </FormControl>

            <FormControl>
              <FormControlLabel
                css={classes.label}
                value="mindmap-tool"
                control={<Radio color="primary" />}
                label={intl.formatMessage({
                  id: 'export.document',
                  defaultMessage:
                    'Mindmap Tools: Export your mindmap in thirdparty mindmap tool formats',
                })}
                color="secondary"
              />
              {exportGroup == 'mindmap-tool' && (
                <Select
                  onChange={handleOnExportFormatChange}
                  variant="outlined"
                  css={classes.select}
                  value={exportFormat}
                >
                  <MenuItem css={classes.select} value="wxml">
                    WiseMapping (WXML)
                  </MenuItem>
                  <MenuItem css={classes.select} value="mm">
                    Freemind 1.0.1 (MM)
                  </MenuItem>
                  {/* <MenuItem className={classes.select} value="mmap">
                                        MindManager (MMAP)
                                    </MenuItem> */}
                </Select>
              )}
            </FormControl>
          </RadioGroup>
        </FormControl>
      </BaseDialog>
    </div>
  );
};

export default ExportDialog;
