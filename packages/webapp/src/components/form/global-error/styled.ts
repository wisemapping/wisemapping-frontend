import { withStyles } from "@material-ui/core";
import { Alert } from "@material-ui/lab";


export const StyledAlert = withStyles({
    root:
    {
        width: '300px',
        margin:'0 auto'
    }
})(Alert);

export default StyledAlert;