import { withStyles } from "@material-ui/core";
import { Alert } from "@material-ui/lab";


export const StyledAlert = withStyles({
    root:
    {
        padding: '10px 0px 10px 0px'
    }
})(Alert);

export default StyledAlert;