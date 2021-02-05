import { TextField } from "@material-ui/core";
import React, { ChangeEvent } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { ErrorInfo } from "../../../client";

type InputProps = {
    name: string;
    error?: ErrorInfo;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    label: string;
    required?: boolean;
    type: string;
    value?: string
    autoComplete?: string;
    fullWidth?: boolean
}

const Input = (props: InputProps) => {

    const intl = useIntl();
    const error: ErrorInfo | undefined = props?.error;
    const name = props.name;
    const value = props.value;
    const onChange = props.onChange ? props.onChange : () => { };
    const fieldError = error?.fields?.[name];
    const required = props.required != undefined ? props.required : true;
    const fullWidth = props.fullWidth != undefined ? props.required : true;

    return (
        <TextField name={name} type={props.type} label={props.label}
            value={value} onChange={onChange}
            error={Boolean(fieldError)} helperText={fieldError}
            variant="outlined" required={required} fullWidth={fullWidth} margin="dense"/>

    );
}
export default Input;