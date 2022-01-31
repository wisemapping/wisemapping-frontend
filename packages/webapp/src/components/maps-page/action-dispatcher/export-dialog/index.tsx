import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import BaseDialog from '../base-dialog';
import { useStyles } from './style';
import Alert from '@material-ui/lab/Alert';
import { fetchMapById } from '../../../../redux/clientSlice';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Designer, TextExporterFactory, ImageExporterFactory, Exporter, Mindmap, LocalStorageManager } from '@wisemapping/mindplot';

type ExportFormat = 'svg' | 'jpg' | 'png' | 'txt' | 'mm' | 'wxml' | 'xls' | 'md';
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
    enableImgExport
}: ExportDialogProps): React.ReactElement => {
    const intl = useIntl();
    const [submit, setSubmit] = React.useState<boolean>(false);
    const { map } = fetchMapById(mapId);

    const [exportGroup, setExportGroup] = React.useState<ExportGroup>(
        enableImgExport ? 'image' : 'document'
    );
    const [exportFormat, setExportFormat] = React.useState<ExportFormat>(
        enableImgExport ? 'svg' : 'xls'
    );
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

    const exporter = (formatType: ExportFormat): Promise<string> => {
        let svgElement: Element | null = null;
        let size;
        let mindmap: Mindmap;

        const designer: Designer = global.designer;
        if (designer != null) {
            // Depending on the type of export. It will require differt POST.
            const workspace = designer.getWorkSpace();
            svgElement = workspace.getSVGElement();
            size = workspace.getSize();
            mindmap = designer.getMindmap();
        } else {
            // Load mindmap ...
            const persistence = new LocalStorageManager(
                `/c/restful/maps/{id}/document/xml`,
                true
            );
            mindmap = persistence.load(mapId.toString());
        }

        let exporter: Exporter;
        switch (formatType) {
            case 'png':
            case 'jpg':
            case 'svg': {
                exporter = ImageExporterFactory.create(formatType, mindmap, svgElement, size.width, size.height);
                break;
            }
            case 'wxml':
            case 'md':
            case 'txt': {
                exporter = TextExporterFactory.create(formatType, mindmap);
                break;
            }
            default:
                throw new Error('Unsupported encoding');
        }

        return exporter.export();
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
                }).catch((fail) => {
                    console.log("Unexpected error during export:" + fail);
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
                description={intl.formatMessage({ id: 'export.desc', defaultMessage: 'Export this map in the format that you want and start using it in your presentations or sharing by email' })}
                submitButton={intl.formatMessage({ id: 'export.title', defaultMessage: 'Export' })}
            >
                {
                    !enableImgExport &&
                    <Alert severity="info">
                        <FormattedMessage
                            id="export.warning"
                            defaultMessage="Exporting to Image (SVG,PNG,JPEG,PDF) is only available  in the editor toolbar."
                        />
                    </Alert>
                }
                <FormControl component="fieldset">
                    <RadioGroup name="export" value={exportGroup} onChange={handleOnGroupChange}>
                        <FormControl>
                            <FormControlLabel
                                className={classes.label}
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
                                <Select
                                    onChange={handleOnExportFormatChange}
                                    variant="outlined"
                                    value={exportFormat}
                                    className={classes.label}
                                >
                                    <MenuItem value="svg" className={classes.menu}>
                                        Scalable Vector Graphics (SVG)
                                    </MenuItem>
                                    <MenuItem value="png" className={classes.menu}>
                                        Portable Network Graphics (PNG)
                                    </MenuItem>
                                    <MenuItem value="jpg" className={classes.menu}>
                                        JPEG Image (JPEG)
                                    </MenuItem>
                                </Select>
                            )}
                        </FormControl>

                        <FormControl>
                            <FormControlLabel
                                className={classes.label}
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
                                    className={classes.select}
                                >
                                    <MenuItem className={classes.select} value="xls">
                                        Microsoft Excel (XLS)
                                    </MenuItem>
                                    <MenuItem className={classes.select} value="txt">
                                        Plain Text File (TXT)
                                    </MenuItem>
                                    <MenuItem className={classes.select} value="md">
                                        Markdown (MD)
                                    </MenuItem>
                                </Select>
                            )}
                        </FormControl>

                        <FormControl>
                            <FormControlLabel
                                className={classes.label}
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
                                    className={classes.select}
                                    value={exportFormat}
                                >
                                    <MenuItem className={classes.select} value="wxml">
                                        WiseMapping (WXML)
                                    </MenuItem>
                                    <MenuItem className={classes.select} value="mm">
                                        Freemind 1.0.1 (MM)
                                    </MenuItem>
                                    <MenuItem className={classes.select} value="mmap">
                                        MindManager (MMAP)
                                    </MenuItem>
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
