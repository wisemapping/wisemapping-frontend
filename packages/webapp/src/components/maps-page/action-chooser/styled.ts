import { MenuItem, withStyles } from "@material-ui/core";

export const StyledMenuItem = withStyles({
    root: {
      width: '300px',
      padding: '10px 20px',
      marging: '0px 20px'
    }
  })(MenuItem)
  