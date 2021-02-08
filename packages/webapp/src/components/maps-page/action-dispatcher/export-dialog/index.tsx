import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { fetchMapById, SimpleDialogProps } from "..";
import BaseDialog from "../base-dialog";
import { FormControl, FormControlLabel, Radio, RadioGroup, Tooltip } from "@material-ui/core";


const ExportDialog = (props: SimpleDialogProps) => {
    const intl = useIntl();
    const { mapId, onClose } = props;
    const [submit, setSubmit] = React.useState<boolean>(false);
    const [formExportRef, setExportFormRef] = React.useState<any>(); // @Todo: review
    const [formTransformtRef, setTransformFormRef] = React.useState<any>(); // @Todo: review

    const [exportFormat, setExportFormat] = React.useState('mm');
    const handleChange = (event) => {
        setExportFormat(event.target.value);
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
            if (exportFormat == 'pdf' || exportFormat == "svg" || exportFormat == "image") {
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
                <FormControl component="fieldset" >
                    <RadioGroup name="export" value={exportFormat} onChange={handleChange}>


                        {/* SVG Based .... */}
                        <Tooltip title="Image" placement="right">
                            <FormControlLabel value="image" control={<Radio color="primary" />} label="Image" color="secondary" />
                        </Tooltip>


                        {/* Non - SVG .... */}
                        <Tooltip title="FREEMIND_EXPORT_FORMAT_09" placement="right">
                            <FormControlLabel value="mm" control={<Radio color="primary" />} label="FREEMIND_EXPORT_FORMAT_09" color="secondary" />
                        </Tooltip>

                        <Tooltip title="MINDJET_EXPORT_FORMAT" placement="right">
                            <FormControlLabel value="mmap" control={<Radio color="primary" />} label="MINDJET_EXPORT_FORMAT" color="secondary" />
                        </Tooltip>

                        <Tooltip title="WISEMAPPING_EXPORT_FORMAT" placement="right">
                            <FormControlLabel value="wxml" control={<Radio color="primary" />} label="WISEMAPPING_EXPORT_FORMAT" color="secondary" />
                        </Tooltip>

                        <Tooltip title="TXT_EXPORT_FORMAT" placement="right">
                            <FormControlLabel value="txt" control={<Radio color="primary" />} label="TXT_EXPORT_FORMAT" color="secondary" />
                        </Tooltip>

                        <Tooltip title="XLS_EXPORT_FORMAT" placement="right">
                            <FormControlLabel value="xls" control={<Radio color="primary" />} label="XLS_EXPORT_FORMAT" color="secondary" />
                        </Tooltip>

                        <Tooltip title="OPEN_OFFICE_EXPORT_FORMAT" placement="right">
                            <FormControlLabel value="odt" control={<Radio color="primary" />} label="OPEN_OFFICE_EXPORT_FORMAT" color="secondary" />
                        </Tooltip>

                    </RadioGroup>
                </FormControl>
            </BaseDialog>

            {/* Hidden form for the purpose of summit */}
            <form action={`/c/restful/maps/${mapId}.${exportFormat}`} ref={setExportFormRef} method="GET">
                <input name="download" type="hidden" value={exportFormat} />
                <input name="filename" type="hidden" value={map?.title} />
            </form>

            <form action={`/c/restful/transform.${exportFormat}`} ref={formTransformtRef} method="POST">
                <input name="download" type="hidden" value={exportFormat} />
                <input name="filename" type="hidden" value={map?.title} />
                <input name="svgXml" id="svgXml" value="" type="hidden" />
            </form>
        </div>
    );
}


export default ExportDialog;