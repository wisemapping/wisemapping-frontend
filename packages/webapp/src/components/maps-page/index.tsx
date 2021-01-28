import React, { useEffect } from 'react';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { ListItemTextStyled, useStyles } from './style';
import { AccountCircle, AddTwoTone, BlurCircular, DeleteOutlineTwoTone, LabelTwoTone, PublicTwoTone, PublishTwoTone, ShareTwoTone, StarRateTwoTone, Translate, TranslateTwoTone } from '@material-ui/icons';
import InboxTwoToneIcon from '@material-ui/icons/InboxTwoTone';
import { Button, ListItemSecondaryAction, Tooltip } from '@material-ui/core';
import { MapsList } from './maps-list';

type FilterType = 'public' | 'all' | 'starred' | 'shared' | 'label' | 'owned'

interface Filter {
    type: FilterType
}

interface LabelFinter extends Filter {
    label: string
}

const MapsPage = (props: any) => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(true);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        document.title = 'Maps | WiseMapping';
    }, []);


    return (
        <div className={classes.root}>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}>
                <Toolbar variant="regular">
                    <IconButton color="inherit" onClick={handleDrawerOpen} edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}>
                        <MenuIcon />
                    </IconButton>

                    <Tooltip title="Create a New Map">
                        <Button color="primary" size="medium" variant="contained" type="button"
                            disableElevation={true} startIcon={<AddTwoTone />} className={classes.newMapButton}>
                            New Map
                        </Button>
                    </Tooltip>

                    <Tooltip title="Import from other mindmap tools">
                        <Button color="primary" size="medium" variant="outlined" type="button"
                            disableElevation={true} startIcon={<PublishTwoTone />} className={classes.importButton}>
                            Import
                    </Button>
                    </Tooltip>


                    <div className={classes.rightButtonGroup}>
                        <IconButton
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                        // onClick={handleMenu}
                        >
                            <AccountCircle fontSize="large" />
                        </IconButton>
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
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {<ChevronLeftIcon />}
                    </IconButton>
                </div>
                <Divider />

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
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <MapsList />
            </main>
        </div>
    );
}

export default MapsPage;