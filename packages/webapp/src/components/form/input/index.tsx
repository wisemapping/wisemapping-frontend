import { FormControl, TextField } from "@material-ui/core";
import React, { ChangeEvent } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { ErrorInfo } from "../../../services/Service";
import { StyledTextField } from "./styles";

type InputProps = {
    name: string;
    error?: ErrorInfo;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    label: MessageDescriptor;
    required?: boolean;
    type: string;
    value?: string
    autoComplete?: string;
}

const Input = (props: InputProps) => {

    const intl = useIntl();
    const error: ErrorInfo | undefined = props?.error;
    const name = props.name;
    const value = props.value;
    const onChange = props.onChange ? props.onChange : () => { };
    const fieldError = error?.fields?.get(name);
    const required = props.required != undefined ? props.required : true;

    return (
        <FormControl margin="normal" required={required} fullWidth>
            <StyledTextField name={name} type={props.type} label={intl.formatMessage(props.label)}
                value={value} onChange={onChange}
                error={Boolean(fieldError)} helperText={fieldError}
                variant="outlined" required={required} />
        </FormControl>
    );
}
export default Input;