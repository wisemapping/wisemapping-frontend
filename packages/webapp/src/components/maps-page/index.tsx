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
import { AcUnitTwoTone, AddCircleTwoTone, CloudUploadTwoTone, DeleteOutlineTwoTone, LabelTwoTone, PersonOutlineTwoTone, PublicTwoTone, ShareTwoTone, StarTwoTone } from '@material-ui/icons';
import { Button, Link, ListItemSecondaryAction, ListItemText, Tooltip } from '@material-ui/core';
import { MapsList } from './maps-list';
import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { activeInstance } from '../../redux/clientSlice';
import { useSelector } from 'react-redux';
import Client, { Label } from '../../client';
import ActionDispatcher from './action-dispatcher';
import { ActionType } from './action-chooser';
import AccountMenu from './account-menu';
import ClientHealthSentinel from '../../client/client-health-sentinel';
import HelpMenu from '../help-menu';

const logoIcon = require('../../images/logo-small.svg');
const poweredByIcon = require('../../images/pwrdby-white.svg');

export type Filter = GenericFilter | LabelFilter;

export interface GenericFilter {
    type: 'public' | 'all' | 'starred' | 'shared' | 'label' | 'owned';
}

export interface LabelFilter {
    type: 'label',
    label: Label
}

interface ToolbarButtonInfo {
    filter: GenericFilter | LabelFilter,
    label: string
    icon: any;
}

const MapsPage = () => {
    const classes = useStyles();
    const [filter, setFilter] = React.useState<Filter>({ type: 'all' });
    const client: Client = useSelector(activeInstance);
    const queryClient = useQueryClient();
    const [activeDialog, setActiveDialog] = React.useState<ActionType | undefined>(undefined);
    const intl = useIntl();

    useEffect(() => {
        document.title = 'Maps | WiseMapping';
    }, []);

    const mutation = useMutation(
        (id: number) => client.deleteLabel(id),
        {
            onSuccess: () => queryClient.invalidateQueries('labels')
        }
    );

    const handleMenuClick = (filter: Filter) => {
        queryClient.invalidateQueries('maps');
        setFilter(filter);
    };

    const handleLabelDelete = (id: number) => {
        mutation.mutate(id);
    };

    const { data } = useQuery<unknown, ErrorInfo, Label[]>('labels', async () => {
        return await client.fetchLabels();
    });

    const labels: Label[] = data ? data : [];
    const filterButtons: ToolbarButtonInfo[] = [{
        filter: { type: 'all' },
        label: 'All',
        icon: <AcUnitTwoTone color="secondary" />
    }, {
        filter: { type: 'owned' },
        label: 'Owned',
        icon: <PersonOutlineTwoTone color="secondary" />

    }, {
        filter: { type: 'starred' },
        label: 'Starred',
        icon: <StarTwoTone color="secondary" />

    }, {
        filter: { type: 'shared' },
        label: 'Shared with me',
        icon: <ShareTwoTone color="secondary" />
    }, {
        filter: { type: 'public' },
        label: 'Public',
        icon: <PublicTwoTone color="secondary" />
    }];

    labels.forEach(l => filterButtons.push({
        filter: { type: 'label', label: l },
        label: l.title,
        icon: <LabelTwoTone style={{ color: l.color ? l.color : 'inherit' }} />
    }))

    return (
        <div className={classes.root}>
            <ClientHealthSentinel />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
                variant='outlined'
                elevation={0}>

                <Toolbar>
                    <Tooltip title={intl.formatMessage({ id: 'maps.create-tooltip', defaultMessage: 'Create a New Map' })}>
                        <Button color="primary"
                            size="medium"
                            variant="contained"
                            type="button"
                            disableElevation={true}
                            startIcon={<AddCircleTwoTone />}
                            className={classes.newMapButton}
                            onClick={() => setActiveDialog('create')}>
                            <FormattedMessage id="action.new" defaultMessage="New Map" />
                        </Button>
                    </Tooltip>

                    <Tooltip title={intl.formatMessage({ id: 'maps.import-desc', defaultMessage: 'Import from other tools' })}>
                        <Button
                            color="primary"
                            size="medium"
                            variant="outlined"
                            type="button"
                            disableElevation={true}
                            startIcon={<CloudUploadTwoTone />}
                            className={classes.importButton}
                            onClick={() => setActiveDialog('import')}>
                            <FormattedMessage id="action.import" defaultMessage="Import" />
                        </Button>
                    </Tooltip>
                    <ActionDispatcher action={activeDialog} onClose={() => setActiveDialog(undefined)} mapsId={[]} />

                    <div className={classes.rightButtonGroup}>
                        <HelpMenu />
                        <AccountMenu />
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
                    {filterButtons.map(buttonInfo => {
                        return (<StyleListItem
                            icon={buttonInfo.icon}
                            label={buttonInfo.label}
                            filter={buttonInfo.filter}
                            active={filter}
                            onClick={handleMenuClick}
                            onDelete={handleLabelDelete}
                            key={`${buttonInfo.filter.type}:${(buttonInfo.filter as LabelFilter).label}`}
                        />)
                    }
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
    onDelete?: (id: number) => void;
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
        onDeleteLabel((filter as LabelFilter).label.id);
    }

    return (
        <ListItem button
            selected={isSelected}
            onClick={e => handleOnClick(e, filter)}>
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            <ListItemText style={{ color: 'white' }} primary={label} />
            {filter.type == 'label' &&
                <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={e => handleOnDelete(e, filter)}>
                        <DeleteOutlineTwoTone color="secondary" />
                    </IconButton>
                </ListItemSecondaryAction>
            }
        </ListItem>
    );
}

export default MapsPage;