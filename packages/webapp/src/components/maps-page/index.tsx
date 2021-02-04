import React, { ErrorInfo, useEffect } from 'react';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { useStyles } from './style';
import { AccountCircle, AddCircleTwoTone, CloudUploadTwoTone, DeleteOutlineTwoTone, EmailOutlined, EmojiPeopleOutlined, ExitToAppOutlined, FeedbackOutlined, Help, PolicyOutlined, PublicTwoTone, SettingsApplicationsOutlined } from '@material-ui/icons';
import { Button, Link, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { MapsList } from './maps-list';
import { FormattedMessage } from 'react-intl';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { activeInstance } from '../../reducers/serviceSlice';
import { useSelector } from 'react-redux';
import Client from '../../client';
import ActionDispatcher from './action-dispatcher';
import { ActionType } from './action-chooser';

const logoIcon = require('../../images/logo-small.svg');
const poweredByIcon = require('../../images/pwrdby-white.svg');

export type Filter = GenericFilter | LabelFilter;

export interface GenericFilter {
    type: 'public' | 'all' | 'starred' | 'shared' | 'label' | 'owned';
}

export interface LabelFilter {
    type: 'label',
    label: string
}

interface ToolbarButtonInfo {
    filter: GenericFilter | LabelFilter,
    label: string
}

const MapsPage = () => {
    const classes = useStyles();
    const [filter, setFilter] = React.useState<Filter>({ type: 'all' });
    const client: Client = useSelector(activeInstance);
    const queryClient = useQueryClient();
    const [activeDialog, setActiveDialog] = React.useState<ActionType | undefined>(undefined);


    useEffect(() => {
        document.title = 'Maps | WiseMapping';
    }, []);


    const mutation = useMutation(
        (label: string) => client.deleteLabel(label),
        {
            onSuccess: () => queryClient.invalidateQueries('labels')
        }
    );

    const handleMenuClick = (filter: Filter) => {
        // Force reload ...
        queryClient.invalidateQueries('maps');
        setFilter(filter);
    };

    const handleLabelDelete = (label: string) => {
        mutation.mutate(label);
    };

    const { data } = useQuery<unknown, ErrorInfo, string[]>('labels', async () => {
        return await client.fetchLabels();
    });

    const labels: string[] = data ? data : [];
    const filterButtons: ToolbarButtonInfo[] = [{
        filter: { type: 'all' },
        label: 'All'
    }, {
        filter: { type: 'owned' },
        label: 'Owned'
    }, {
        filter: { type: 'starred' },
        label: 'Starred'
    }, {
        filter: { type: 'shared' },
        label: 'Shared with me'
    }, {
        filter: { type: 'public' },
        label: 'Public'
    }];

    labels.forEach(l => filterButtons.push({ filter: { type: 'label', label: l }, label: l }))


    return (
        <div className={classes.root}>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
                variant='outlined'
                elevation={0}>

                <Toolbar>
                    <Tooltip title="Create a New Map">
                        <Button color="primary"
                            size="medium"
                            variant="contained"
                            type="button"
                            disableElevation={true}
                            startIcon={<AddCircleTwoTone />}
                            className={classes.newMapButton}
                            onClick={e => setActiveDialog('create')}>
                            <FormattedMessage id="action.new" defaultMessage="New Map" />
                        </Button>
                    </Tooltip>

                    <Tooltip title="Import from external tools">
                        <Button color="primary" size="medium" variant="outlined" type="button"
                            disableElevation={true} startIcon={<CloudUploadTwoTone />} className={classes.importButton}>
                            <FormattedMessage id="action.import" defaultMessage="Import" />
                        </Button>
                    </Tooltip>
                    <ActionDispatcher action={activeDialog} onClose={() => setActiveDialog(undefined)} mapId={-1} />

                    <div className={classes.rightButtonGroup}>
                        <HelpToobarButton />
                        <ProfileToobarButton />
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open
                    }),
                }}>

                <div style={{ padding: "20px 0 20px 15px" }}>
                    <img src={logoIcon} alt="logo" />
                </div>

                <List component="nav">
                    {filterButtons.map(buttonInfo => (<StyleListItem
                        icon={<PublicTwoTone color="secondary" />}
                        label={buttonInfo.label}
                        filter={buttonInfo.filter}
                        active={filter}
                        onClick={handleMenuClick}
                        onDelete={handleLabelDelete}
                        key={`${buttonInfo.filter.type}:${(buttonInfo.filter as LabelFilter).label}`}
                    />)
                    )}
                </List>

                <div style={{ position: 'absolute', bottom: '10px', left: '20px' }}>
                    <Link href="http://www.wisemapping.org/">
                        <img src={poweredByIcon} alt="Powered By WiseMapping" />
                    </Link>
                </div>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <MapsList filter={filter} />
            </main>
        </div>
    );
}

interface ListItemProps {
    icon: any,
    label: string,
    filter: Filter,
    active?: Filter
    onClick: (filter: Filter) => void;
    onDelete?: (label: string) => void;
}

const StyleListItem = (props: ListItemProps) => {
    const icon = props.icon;
    const label = props.label;
    const filter = props.filter;
    const activeFilter = props.active;
    const onClick = props.onClick;
    const onDeleteLabel = props.onDelete;
    const isSelected = activeFilter
        && (activeFilter.type == filter.type)
        && (activeFilter.type != 'label' || ((activeFilter as LabelFilter).label == (filter as LabelFilter).label));


    const handleOnClick = (event: any, filter: Filter) => {
        event.stopPropagation();
        onClick(filter);
    }

    const handleOnDelete = (event: any, filter: Filter) => {
        event.stopPropagation();
        if (!onDeleteLabel) {
            throw "Illegal state exeption";
        }
        onDeleteLabel((filter as LabelFilter).label);
    }

    return (
        <ListItem button
            selected={isSelected}
            onClick={e => handleOnClick(e, filter)}>
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            <ListItemText style={{ color: 'white' }} primary={label} />
            {filter.type == 'label' ?
                (<ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={e => handleOnDelete(e, filter)}>
                        <DeleteOutlineTwoTone color="secondary" />
                    </IconButton>
                </ListItemSecondaryAction>) : null}
        </ListItem>
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
            <Tooltip title="Paulo Veiga <pveiga@gmail.com>">
                <Button
                    aria-haspopup="true"
                    onClick={handleMenu}>
                    <AccountCircle fontSize="large" />
                Paulo Veiga
            </Button >
            </Tooltip>
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
                    <Link color="textSecondary" href="https://www.wisemapping.com/termsofuse.html" target="help">
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
                    <Link color="textSecondary" href="mailto:feedback@wisemapping.com">
                        <ListItemIcon>
                            <FeedbackOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="footer.feedback" defaultMessage="Feedback" />
                    </Link>
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="https://www.wisemapping.com/aboutus.html" target="help">
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