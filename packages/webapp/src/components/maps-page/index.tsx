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
import { MapsList } from './maps-list';
import { ListItemTextStyled, useStyles } from './style';
import { AddTwoTone, BlurCircular, DeleteOutlineTwoTone, LabelTwoTone, PublicTwoTone, ShareTwoTone, StarRateTwoTone } from '@material-ui/icons';
import InboxTwoToneIcon from '@material-ui/icons/InboxTwoTone';
import { Button, ListItemSecondaryAction } from '@material-ui/core';

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
                    <Toolbar>
                            <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            className={clsx(classes.menuButton, {
                                [classes.hide]: open,
                            })}>
                            <MenuIcon />
                        </IconButton>

                        <Button color="primary" size="medium" variant="contained" type="button" 
                        disableElevation={true} startIcon={<AddTwoTone />}>
                            New Map
                        </Button>
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