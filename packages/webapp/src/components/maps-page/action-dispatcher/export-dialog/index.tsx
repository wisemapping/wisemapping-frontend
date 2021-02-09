import React, { useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { fetchMapById, SimpleDialogProps } from "..";
import BaseDialog from "../base-dialog";
import { FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Select, Tooltip, Typography } from "@material-ui/core";
import { useStyles } from './style';
import { Alert } from "@material-ui/lab";

type ExportFormat = 'pdf' | 'svg' | 'jpeg' | 'png' | 'txt' | 'mm' | 'wxml';
type ExportGroup = 'image' | 'document' | 'mindmap-tool';

type ExportDialogProps = {
    mapId: number,
    enableImgExport: boolean,
    onClose: () => void,
}

const ExportDialog = (props: ExportDialogProps) => {
    const intl = useIntl();
    const { mapId, onClose, enableImgExport } = props;
    const [submit, setSubmit] = React.useState<boolean>(false);
    const [formExportRef, setExportFormRef] = React.useState<any>();
    const [formTransformtRef, setTransformFormRef] = React.useState<any>();
    const [exportGroup, setExportGroup] = React.useState<ExportGroup>(enableImgExport ? 'image' : 'document');
    const [exportFormat, setExportFormat] = React.useState<ExportFormat>(enableImgExport ? 'svg' : 'pdf');
    const classes = useStyles();


    const handleOnExportFormatChange = (event) => {
        setExportFormat(event.target.value);
    };

    const handleOnGroupChange = (event) => {
        setExportGroup(event.target.value);
    };

    const handleOnClose = (): void => {
        onClose();
    };

    const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        setSubmit(true);
    }

    useEffect(() => {
        if (submit) {
            // Depending on the type of export. It will require differt POST.
            if (exportFormat == 'pdf' || exportFormat == "svg" || exportFormat == "jpeg" || exportFormat == "png") {
                formTransformtRef.submit();
            } else {

                formExportRef.submit();
            }
            onClose();
        }
    }, [submit]);

    const { map } = fetchMapById(mapId);
    return (
        <div>
            <BaseDialog
                onClose={handleOnClose}
                onSubmit={handleOnSubmit}
                title={intl.formatMessage({ id: "export.title", defaultMessage: "Export" })}
                description={"Export this map in the format that you want and start using it in your presentations or sharing by email"}
                submitButton={intl.formatMessage({ id: "export.title", defaultMessage: "Export" })} >

                <Alert severity="info">
                    <FormattedMessage id="export.warning" defaultMessage="Exporting to Image (SVG,PNG,JPEG )is available only in the editor toolbar." />
                </Alert>

                <FormControl component="fieldset" >
                    <RadioGroup name="export" value={exportGroup} onChange={handleOnGroupChange}>
                        <FormControl>
                            <FormControlLabel
                                className={classes.label}
                                value="image"
                                disabled={!enableImgExport}
                                control={<Radio color="primary" />}
                                label={intl.formatMessage({ id: "export.image", defaultMessage: "Image: Get a graphic representation of your map including all colors and shapes." })}
                                color="secondary"
                                style={{ fontSize: '9px' }} />
                            {(exportGroup == 'image') &&
                                (<Select
                                    onChange={handleOnExportFormatChange}
                                    variant="outlined"
                                    className={classes.label}>
                                    <MenuItem value="svg" className={classes.menu}>Scalable Vector Graphics (SVG)</MenuItem>
                                    <MenuItem value="png" className={classes.menu}>Portable Network Graphics (PNG)</MenuItem>
                                    <MenuItem value="jpeg" className={classes.menu}>JPEG Image (JPEG)</MenuItem>
                                </Select>)
                            }
                        </FormControl>

                        <FormControl>
                            <FormControlLabel
                                className={classes.label}
                                value="document"
                                control={<Radio color="primary" />}
                                label={intl.formatMessage({ id: "export.document", defaultMessage: "Document: Export your mindmap in a self-contained document ready to share" })}
                                color="secondary" />
                            {exportGroup == 'document' &&
                                (<Select onChange={handleOnExportFormatChange}
                                    variant="outlined"
                                    className={classes.select}
                                >
                                    <MenuItem className={classes.select} value="pdf">Portable Document Format (PDF)</MenuItem>
                                    <MenuItem className={classes.select} value="txt">Plain Text File (TXT)</MenuItem>
                                    <MenuItem className={classes.select} value="xls">Microsoft Excel (XLS)</MenuItem>
                                </Select>)
                            }
                        </FormControl>

                        <FormControl>
                            <FormControlLabel
                                className={classes.label}
                                value="mindmap-tool"
                                control={<Radio color="primary" />}
                                label={intl.formatMessage({ id: "export.document", defaultMessage: "Mindmap Tools: Export your mindmap in thirdparty mindmap tool formats" })}
                                color="secondary" />
                            {exportGroup == 'mindmap-tool' &&
                                (<Select
                                    onChange={handleOnExportFormatChange}
                                    variant="outlined"
                                    className={classes.select}
                                >
                                    <MenuItem className={classes.select} value="wxml">WiseMapping (WXML)</MenuItem>
                                    <MenuItem className={classes.select} value="mm">Freemind 1.0.1 (MM)</MenuItem>
                                    <MenuItem className={classes.select} value="mmap">MindManager (MMAP)</MenuItem>
                                </Select>)
                            }
                        </FormControl>
                    </RadioGroup>
                </FormControl>
            </BaseDialog>

            {/* Hidden form for the purpose of summit */}
            <form action={`/c/restful/maps/${mapId}.${exportFormat}`} ref={setExportFormRef} method="GET">
                <input name="download" type="hidden" value={exportFormat} />
                <input name="filename" type="hidden" value={map?.title} />
            </form>

            <form action={`/c/restful/transform.${exportFormat}`} ref={setTransformFormRef} method="POST">
                <input name="download" type="hidden" value={exportFormat} />
                <input name="filename" type="hidden" value={map?.title} />
                <input name="svgXml" id="svgXml" value="" type="hidden" />
            </form>
        </div>
    );
}


export default ExportDialog;