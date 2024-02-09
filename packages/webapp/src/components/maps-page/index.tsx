/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React, { ErrorInfo, ReactElement, useEffect } from 'react';
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
import MenuIcon from '@mui/icons-material/Menu';
import ArrowRight from '@mui/icons-material/NavigateNext';
import ArrowLeft from '@mui/icons-material/NavigateBefore';

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
import { CSSObject, Interpolation, Theme } from '@emotion/react';
import withEmotionStyles from '../HOCs/withEmotionStyles';
import { useNavigate } from 'react-router-dom';

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
  const [filter, setFilter] = React.useState<Filter>({ type: 'all' });
  const client: Client = useSelector(activeInstance);
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = React.useState<ActionType | undefined>(undefined);
  const [labelToDelete, setLabelToDelete] = React.useState<number | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [desktopDrawerOpen, setDesktopDrawerOpen] = React.useState(
    localStorage.getItem('desktopDrawerOpen') === 'true',
  );
  const classes = useStyles(desktopDrawerOpen);
  const navigate = useNavigate();

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDesktopDrawerToggle = () => {
    if (!desktopDrawerOpen) localStorage.setItem('desktopDrawerOpen', 'true');
    else localStorage.removeItem('desktopDrawerOpen');
    setDesktopDrawerOpen(!desktopDrawerOpen);
  };
  // Reload based on user preference ...
  const userLocale = AppI18n.getUserLocale();

  const cache = createIntlCache();
  const intl = createIntl(
    {
      defaultLocale: userLocale.code,
      locale: Locales.EN.code,
      messages: userLocale.message,
    },
    cache,
  );

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'maps.page-title',
      defaultMessage: 'My Maps | WiseMapping',
    });
    window.scrollTo(0, 0);
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname, title: 'Maps List' });
  }, []);

  useEffect(() => {
    if (client) {
      client.onSessionExpired(() => {
        navigate('/c/login');
      });
    } else {
      console.warn('Session expiration wont be handled because could not find client');
    }
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
    mobileDrawerOpen && setMobileDrawerOpen(false);
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
    }),
  );

  const drawerItemsList = (
    <>
      <div style={{ padding: '20px 0 20px 16px' }} key="logo">
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
        className="poweredByIcon"
        style={{ position: 'absolute', bottom: '10px', left: '20px' }}
        key="power-by"
      >
        <Link href="http://www.wisemapping.org/">
          <img src={poweredByIcon} alt="Powered By WiseMapping" />
        </Link>
      </div>
    </>
  );

  const container = document !== undefined ? () => document.body : undefined;
  const label = labels.find((l) => l.id === labelToDelete);
  return (
    <IntlProvider
      locale={userLocale.code}
      defaultLocale={Locales.EN.code}
      messages={userLocale.message}
    >
      <div css={classes.root}>
        <AppBar
          position="fixed"
          css={[classes.appBar, classes.appBarShift]}
          variant="outlined"
          elevation={0}
        >
          <Toolbar>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
              id="open-main-drawer"
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDesktopDrawerToggle}
              sx={{ p: 0, mr: 2, display: { xs: 'none', sm: 'inherit' } }}
              id="open-desktop-drawer"
            >
              {!desktopDrawerOpen && <ArrowRight />}
              {desktopDrawerOpen && <ArrowLeft />}
            </IconButton>
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
                css={classes.newMapButton}
                onClick={() => setActiveDialog('create')}
              >
                <span className="message">
                  <FormattedMessage id="action.new" defaultMessage="New map" />
                </span>
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
                css={classes.importButton}
                onClick={() => setActiveDialog('import')}
              >
                <span className="message">
                  <FormattedMessage id="action.import" defaultMessage="Import" />
                </span>
              </Button>
            </Tooltip>
            <ActionDispatcher
              action={activeDialog}
              onClose={() => setActiveDialog(undefined)}
              mapsId={[]}
              fromEditor
            />

            <div css={classes.rightButtonGroup as Interpolation<Theme>}>
              <LanguageMenu />
              <HelpMenu />
              <AccountMenu />
            </div>
          </Toolbar>
        </AppBar>
        <Drawer
          container={container}
          variant={'temporary'}
          open={mobileDrawerOpen}
          onClose={handleMobileDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          css={[classes.mobileDrawer, { '& .MuiPaper-root': classes.drawerOpen }]}
        >
          {drawerItemsList}
        </Drawer>
        <Drawer
          variant="permanent"
          css={[
            classes.drawer as CSSObject,
            classes.drawerOpen,
            { '& .MuiPaper-root': classes.drawerOpen },
          ]}
        >
          {drawerItemsList}
        </Drawer>
        <main css={classes.content}>
          <div css={classes.toolbar} />
          <MapsList filter={filter} />
        </main>
      </div>
      {label && labelToDelete && (
        <LabelDeleteConfirm
          onClose={() => setLabelToDelete(null)}
          onConfirm={() => {
            handleLabelDelete(labelToDelete);
            setLabelToDelete(null);
          }}
          label={label}
        />
      )}
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
const CustomListItem = withEmotionStyles({
  '&.Mui-selected': {
    backgroundColor: 'rgb(210, 140, 5)',
    color: 'white',
    '& .MuiListItemIcon-root': {
      color: 'white',
    },
  },
  '&.Mui-selected:hover': {
    backgroundColor: 'rgb(210, 140, 5)',
    color: 'white',
    '& .MuiListItemIcon-root': {
      color: 'white',
    },
  },
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
    filter: Filter,
  ) => {
    event.stopPropagation();
    if (!onDeleteLabel) {
      throw 'Illegal state exeption';
    }
    onDeleteLabel((filter as LabelFilter).label.id);
  };

  return (
    <CustomListItem selected={isSelected} onClick={(e) => handleOnClick(e, filter)}>
      <Tooltip title={label} disableInteractive>
        <ListItemIcon>{icon}</ListItemIcon>
      </Tooltip>
      <ListItemText style={{ color: 'white' }} primary={label} />
      {filter.type == 'label' && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={(e) => handleOnDelete(e, filter)}
            size="large"
          >
            <DeleteOutlineTwoTone color="secondary" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </CustomListItem>
  );
};

export default MapsPage;
