import { Button } from '@material-ui/core';
import React, { useState, useEffect } from 'react'
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
        <Button color="primary" size="medium" variant="contained" type="submit"
            disableElevation={true} disabled={disabled} 
            style={{width: '350px', height: '53px', padding: '0px 20px', margin: '7px 0px',fontSize: '18px' }} >
            {value}
        </Button>
    );
}

export default SubmitButton;