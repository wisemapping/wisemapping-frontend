import React, { useState, useEffect} from 'react'
import { useIntl } from 'react-intl'

type SubmitButton = {
    value: string;
    disabled?: boolean;
}
const SubmitButton = (props: SubmitButton) => {
    const [disabled, setDisabled] = useState(props.disabled ? true : false);
    const intl = useIntl();

    let valueTxt = props.value;
    if (disabled) {
        valueTxt = intl.formatMessage({ id: "common.wait", defaultMessage: "Please wait ..." });
    }
    const [value, setValue] = useState(valueTxt);
    return (
        <input type="submit" disabled={disabled} value={value} />
    );
}

export default SubmitButton;