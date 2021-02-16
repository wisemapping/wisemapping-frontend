import { withStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";


export const StyledAlert = withStyles({
    root:
    {
        padding: '10px 15px',
        margin: '5px 0px '
    }
})(Alert);

export default StyledAlert;