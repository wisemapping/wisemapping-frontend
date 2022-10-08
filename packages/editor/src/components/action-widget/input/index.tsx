import TextField, { TextFieldProps } from '@mui/material/TextField';
import DesignerKeyboard from '@wisemapping/mindplot/src/components/DesignerKeyboard';
import React, { useEffect } from 'react';

/**
 *
 * @param props text field props.
 * @returns wrapped mui TextField, that disable mindplot keyboard events on focus and enable it on blur
 */
const Input = (props: TextFieldProps) => {
  useEffect(() => {
    return () => DesignerKeyboard.resume();
  }, []);
  return (
    <TextField
      {...props}
      onFocus={(e) => {
        DesignerKeyboard.pause();
        props.onFocus && props.onFocus(e);
      }}
      onBlur={(e) => {
        DesignerKeyboard.resume();
        props.onBlur && props.onBlur(e);
      }}
    ></TextField>
  );
};
export default Input;
