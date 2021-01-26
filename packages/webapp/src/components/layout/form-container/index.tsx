import { Container, withStyles } from "@material-ui/core";

const FormContainer = withStyles({
    root: {
        padding: '20px 10px 0px 20px',
        maxWidth: '380px',
        textAlign: 'center'
    }
})(Container)

export default FormContainer;