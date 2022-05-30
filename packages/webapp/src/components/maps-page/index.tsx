import React, { ErrorInfo, ReactElement, useEffect } from 'react';
import clsx from 'clsx';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import { useStyles } from './style';
import { MapsList } from './maps-list';
import { createIntl, createIntlCache, FormattedMessage, IntlProvider } from 'react-intl';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { activeInstance } from '../../redux/clientSlice';
import { useSelector } from 'react-redux';
import Client, { Label } from '../../classes/client';
import ActionDispatcher from './action-dispatcher';
import { ActionType } from './action-chooser';
import AccountMenu from './account-menu';
import HelpMenu from './help-menu';
import LanguageMenu from './language-menu';
import AppI18n, { Locales } from '../../classes/app-i18n';

import ListItemIcon from '@mui/material/ListItemIcon';

import AddCircleTwoTone from '@mui/icons-material/AddCircleTwoTone';
import CloudUploadTwoTone from '@mui/icons-material/CloudUploadTwoTone';
import DeleteOutlineTwoTone from '@mui/icons-material/DeleteOutlineTwoTone';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import PersonOutlineTwoTone from '@mui/icons-material/PersonOutlineTwoTone';
import PublicTwoTone from '@mui/icons-material/PublicTwoTone';
import ScatterPlotTwoTone from '@mui/icons-material/ScatterPlotTwoTone';
import ShareTwoTone from '@mui/icons-material/ShareTwoTone';
import StarTwoTone from '@mui/icons-material/StarTwoTone';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';

import logoIcon from './logo-small.svg';
import poweredByIcon from './pwrdby-white.svg';
import LabelDeleteConfirm from './maps-list/label-delete-confirm';
import ReactGA from 'react-ga4';
import { withStyles } from '@mui/styles';


export type Filter = GenericFilter | LabelFilter;

export interface GenericFilter {
    type: 'public' | 'all' | 'starred' | 'shared' | 'label' | 'owned';
}

export interface LabelFilter {
    type: 'label';
    label: Label;
}

interface ToolbarButtonInfo {
    filter: GenericFilter | LabelFilter;
    label: string;
    icon: React.ReactElement;
}

const MapsPage = (): ReactElement => {
    const classes = useStyles();
    const [filter, setFilter] = React.useState<Filter>({ type: 'all' });
    const client: Client = useSelector(activeInstance);
    const queryClient = useQueryClient();
    const [activeDialog, setActiveDialog] = React.useState<ActionType | undefined>(undefined);
    const [labelToDelete, setLabelToDelete] = React.useState<number | null>(null);
    // Reload based on user preference ...
    const userLocale = AppI18n.getUserLocale();

    const cache = createIntlCache();
    const intl = createIntl({
        defaultLocale: userLocale.code,
        locale: Locales.EN.code,
        messages: userLocale.message
    }, cache)

    useEffect(() => {
        document.title = intl.formatMessage({
            id: 'maps.page-title',
            defaultMessage: 'My Maps | WiseMapping',
        });
        ReactGA.send({ hitType: 'pageview', page: window.location.pathname, title: 'Maps list' });
    }, []);

    const mutation = useMutation((id: number) => client.deleteLabel(id), {
        onSuccess: () => {
            queryClient.invalidateQueries('labels');
            queryClient.invalidateQueries('maps');
        },
        onError: (error) => {
            console.error(`Unexpected error ${error}`);
        },
    });

    const handleMenuClick = (filter: Filter) => {
        queryClient.invalidateQueries('maps');
        setFilter(filter);
    };

    const handleLabelDelete = (id: number) => {
        mutation.mutate(id);
    };

    const { data } = useQuery<unknown, ErrorInfo, Label[]>('labels', () => {
        return client.fetchLabels();
    });

    const labels: Label[] = data ? data : [];
    const filterButtons: ToolbarButtonInfo[] = [
        {
            filter: { type: 'all' },
            label: intl.formatMessage({ id: 'maps.nav-all', defaultMessage: 'All' }),
            icon: <ScatterPlotTwoTone color="secondary" />,
        },
        {
            filter: { type: 'owned' },
            label: intl.formatMessage({ id: 'maps.nav-onwned', defaultMessage: 'Owned' }),
            icon: <PersonOutlineTwoTone color="secondary" />,
        },
        {
            filter: { type: 'starred' },
            label: intl.formatMessage({ id: 'maps.nav-starred', defaultMessage: 'Starred' }),
            icon: <StarTwoTone color="secondary" />,
        },
        {
            filter: { type: 'shared' },
            label: intl.formatMessage({ id: 'maps.nav-shared', defaultMessage: 'Shared with me' }),
            icon: <ShareTwoTone color="secondary" />,
        },
        {
            filter: { type: 'public' },
            label: intl.formatMessage({ id: 'maps.nav-public', defaultMessage: 'Public' }),
            icon: <PublicTwoTone color="secondary" />,
        },
    ];

    labels.forEach((l) =>
        filterButtons.push({
            filter: { type: 'label', label: l },
            label: l.title,
            icon: <LabelTwoTone style={{ color: l.color ? l.color : 'inherit' }} />,
        })
    );

    return (
        <IntlProvider
            locale={userLocale.code}
            defaultLocale={Locales.EN.code}
            messages={userLocale.message}
        >
            <div className={classes.root}>
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar, {
                        [classes.appBarShift]: open,
                    })}
                    variant="outlined"
                    elevation={0}
                >
                    <Toolbar>
                        <Tooltip
                            arrow={true}
                            title={intl.formatMessage({
                                id: 'maps.create-tooltip',
                                defaultMessage: 'Create a new mindmap',
                            })}
                        >
                            <Button
                                color="primary"
                                data-testid="create"
                                size="medium"
                                variant="contained"
                                type="button"
                                disableElevation={true}
                                startIcon={<AddCircleTwoTone />}
                                className={classes.newMapButton}
                                onClick={() => setActiveDialog('create')}
                            >
                                <FormattedMessage id="action.new" defaultMessage="New map" />
                            </Button>
                        </Tooltip>

                        <Tooltip
                            arrow={true}
                            title={intl.formatMessage({
                                id: 'maps.import-desc',
                                defaultMessage: 'Import from other tools',
                            })}
                        >
                            <Button
                                color="primary"
                                size="medium"
                                variant="outlined"
                                type="button"
                                disableElevation={true}
                                startIcon={<CloudUploadTwoTone />}
                                className={classes.importButton}
                                onClick={() => setActiveDialog('import')}
                            >
                                <FormattedMessage id="action.import" defaultMessage="Import" />
                            </Button>
                        </Tooltip>
                        <ActionDispatcher
                            action={activeDialog}
                            onClose={() => setActiveDialog(undefined)}
                            mapsId={[]}
                            fromEditor
                        />

                        <div className={classes.rightButtonGroup}>
                            <LanguageMenu />
                            <HelpMenu />
                            <AccountMenu />
                        </div>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    className={clsx(classes.drawer, {
                        [classes.drawerOpen]: open,
                    })}
                    classes={{
                        paper: clsx({
                            [classes.drawerOpen]: open,
                        }),
                    }}
                >
                    <div style={{ padding: '20px 0 20px 15px' }} key="logo">
                        <img src={logoIcon} alt="logo" />
                    </div>

                    <List component="nav">
                        {filterButtons.map((buttonInfo) => {
                            return (
                                <StyleListItem
                                    icon={buttonInfo.icon}
                                    label={buttonInfo.label}
                                    filter={buttonInfo.filter}
                                    active={filter}
                                    onClick={handleMenuClick}
                                    onDelete={setLabelToDelete}
                                    key={`${buttonInfo.filter.type}:${buttonInfo.label}`}
                                />
                            );
                        })}
                    </List>

                    <div
                        style={{ position: 'absolute', bottom: '10px', left: '20px' }}
                        key="power-by"
                    >
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
            {labelToDelete && <LabelDeleteConfirm
                onClose={() => setLabelToDelete(null)}
                onConfirm={() => {
                    handleLabelDelete(labelToDelete);
                    setLabelToDelete(null);
                }}
                label={labels.find(l => l.id === labelToDelete)}
            />}
        </IntlProvider>
    );
};

interface ListItemProps {
    icon: React.ReactElement;
    label: string;
    filter: Filter;
    active?: Filter;
    onClick: (filter: Filter) => void;
    onDelete?: (id: number) => void;
}

// https://stackoverflow.com/questions/61486061/how-to-set-selected-and-hover-color-of-listitem-in-mui
const CustomListItem = withStyles({
    root: {
        "&$selected": {
            backgroundColor: "rgb(210, 140, 5)",
            color: "white",
            "& .MuiListItemIcon-root": {
                color: "white"
            }
        },
        "&$selected:hover": {
            backgroundColor: "rgb(210, 140, 5)",
            color: "white",
            "& .MuiListItemIcon-root": {
                color: "white"
            }
        },
    },
    selected: {}
})(ListItemButton);

const StyleListItem = (props: ListItemProps) => {
    const icon = props.icon;
    const label = props.label;
    const filter = props.filter;
    const activeFilter = props.active;
    const onClick = props.onClick;
    const onDeleteLabel = props.onDelete;
    const isSelected =
        activeFilter &&
        activeFilter.type == filter.type &&
        (activeFilter.type != 'label' ||
            (activeFilter as LabelFilter).label == (filter as LabelFilter).label);
    const handleOnClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, filter: Filter) => {
        event.stopPropagation();
        onClick(filter);
    };

    const handleOnDelete = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        filter: Filter
    ) => {
        event.stopPropagation();
        if (!onDeleteLabel) {
            throw 'Illegal state exeption';
        }
        onDeleteLabel((filter as LabelFilter).label.id);
    };

    return (
        <CustomListItem selected={isSelected} onClick={(e) => handleOnClick(e, filter)}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText style={{ color: 'white' }} primary={label} />
            {filter.type == 'label' && (
                <ListItemSecondaryAction>
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleOnDelete(e, filter)}
                        size="large">
                        <DeleteOutlineTwoTone color="secondary" />
                    </IconButton>
                </ListItemSecondaryAction>
            )}
        </CustomListItem>
    );
};

export default MapsPage;
