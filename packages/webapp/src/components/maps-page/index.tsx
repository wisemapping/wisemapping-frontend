import React, { useEffect } from 'react';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { ListItemTextStyled, useStyles } from './style';
import { AccountCircle, AddCircleTwoTone, BlurCircular, CloudUploadTwoTone, DeleteOutlineTwoTone, EmailOutlined, EmojiPeopleOutlined, ExitToAppOutlined, FeedbackOutlined, Help, LabelTwoTone, PolicyOutlined, PublicTwoTone, SettingsApplicationsOutlined, ShareTwoTone, StarRateTwoTone, Translate, TranslateTwoTone } from '@material-ui/icons';
import InboxTwoToneIcon from '@material-ui/icons/InboxTwoTone';
import { Button, Link, ListItemSecondaryAction, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { MapsList } from './maps-list';
import { FormattedMessage } from 'react-intl';
const logoIcon = require('../../images/logo-small.svg')
const poweredByIcon = require('../../images/pwrdby-white.svg')

type FilterType = 'public' | 'all' | 'starred' | 'shared' | 'label' | 'owned'

interface Filter {
    type: FilterType
}

interface LabelFinter extends Filter {
    label: string
}

const MapsPage = (props: any) => {
    const classes = useStyles();
    useEffect(() => {
        document.title = 'Maps | WiseMapping';
    }, []);

    return (
        <div className={classes.root}>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
                variant='outlined'
                elevation={0}
            >
                <Toolbar variant="regular">
                    <Tooltip title="Create a New Map">
                        <Button color="primary" size="medium" variant="contained" type="button"
                            disableElevation={true} startIcon={<AddCircleTwoTone />} className={classes.newMapButton}>
                            New Map
                        </Button>
                    </Tooltip>

                    <Tooltip title="Import from external tools">
                        <Button color="primary" size="medium" variant="outlined" type="button"
                            disableElevation={true} startIcon={<CloudUploadTwoTone />} className={classes.importButton}>
                            Import
                        </Button>
                    </Tooltip>

                    <Tooltip title="Use labels to organize your maps">
                        <Button color="primary" size="medium" variant="outlined" type="button"
                            disableElevation={true} startIcon={<LabelTwoTone />} className={classes.importButton}>
                            Label
                        </Button>
                    </Tooltip>

                    <div className={classes.rightButtonGroup}>
                        <HelpToobarButton />
                        <ProfileToobarButton />
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}>

                <div style={{ padding: "20px 0 20px 15px" }}>
                    <img src={logoIcon} alt="logo" />
                </div>

                <List component="nav">
                    <ListItem button >
                        <ListItemIcon>
                            <InboxTwoToneIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemTextStyled primary="All" />
                    </ListItem>

                    <ListItem button >
                        <ListItemIcon>
                            <BlurCircular color="secondary" />
                        </ListItemIcon>
                        <ListItemTextStyled primary="Owned" />
                    </ListItem>

                    <ListItem button >
                        <ListItemIcon>
                            <StarRateTwoTone color="secondary" />
                        </ListItemIcon>
                        <ListItemTextStyled primary="Starred" />
                    </ListItem>

                    <ListItem button >
                        <ListItemIcon>
                            <ShareTwoTone color="secondary" />
                        </ListItemIcon>
                        <ListItemTextStyled primary="Shared With Me" />
                    </ListItem>

                    <ListItem button >
                        <ListItemIcon>
                            <PublicTwoTone color="secondary" />
                        </ListItemIcon>
                        <ListItemTextStyled primary="Public" />
                    </ListItem>

                    <ListItem button >
                        <ListItemIcon>
                            <LabelTwoTone color="secondary" />
                        </ListItemIcon>
                        <ListItemTextStyled primary="Some label>" />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete">
                                <DeleteOutlineTwoTone color="secondary" />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
                <div style={{ position: 'absolute', bottom: '10px', left: '20px' }}>
                    <Link href="http://www.wisemapping.org/">
                        <img src={poweredByIcon} alt="Powered By WiseMapping" />
                    </Link>
                </div>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <MapsList />
            </main>
        </div>
    );
}

const ProfileToobarButton = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <span>
            <IconButton
                aria-haspopup="true"
                onClick={handleMenu}>
                <AccountCircle fontSize="large" />
            </IconButton >
            <Menu id="appbar-profile"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                getContentAnchorEl={null}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <SettingsApplicationsOutlined fontSize="small" />
                    </ListItemIcon>
                    <FormattedMessage id="menu.account" defaultMessage="Account" />
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="/c/logout">
                        <ListItemIcon>
                            <ExitToAppOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="menu.signout" defaultMessage="Sign Out" />
                    </Link>
                </MenuItem>

            </Menu>
        </span>);
}

const HelpToobarButton = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <span>
            <IconButton
                aria-haspopup="true"
                onClick={handleMenu}>
                <Help />
            </IconButton>
            <Menu id="appbar-profile"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                getContentAnchorEl={null}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="https://www.wisemapping.com/termsofuse.html">
                        <ListItemIcon>
                            <PolicyOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="footer.termsandconditions" defaultMessage="Term And Conditions" />
                    </Link>
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="mailto:team@wisemapping.com">
                        <ListItemIcon>
                            <EmailOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="footer.contactus" defaultMessage="Contact Us" />
                    </Link>
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="feedback@wisemapping.com">
                        <ListItemIcon>
                            <FeedbackOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="footer.feedback" defaultMessage="Feedback" />
                    </Link>
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="https://www.wisemapping.com/aboutus.html">
                        <ListItemIcon>
                            <EmojiPeopleOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="footer.aboutus" defaultMessage="About Us" />
                    </Link>
                </MenuItem>
            </Menu>
        </span>);
}
export default MapsPage;