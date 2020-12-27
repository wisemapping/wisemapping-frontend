import { TextField, withStyles } from "@material-ui/core";

export const StyledTextField = withStyles({
    root:
    {
        margin: '0 auto',

        '& label.Mui-focused': {
            color: '#f9a826',
        },
        '& .MuiOutlinedInput-root': {
            width: '300px',
            height: '53px',
            borderRadius: '9px',
            fontSize: '16px',
            '& fieldset': {
                border: 'solid 1px #ffcb66',
            },
            '&:hover fieldset': {
                borderColor: '#f9a826',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#f9a826'
            },
        },
    },
})(TextField);
