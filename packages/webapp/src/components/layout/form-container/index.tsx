import Container from "@material-ui/core/Container";
import withStyles from "@material-ui/core/styles/withStyles";

const FormContainer = withStyles({
    root: {
        padding: '20px 10px 0px 20px',
        maxWidth: '380px',
        textAlign: 'center'
    }
})(Container)

export default FormContainer;