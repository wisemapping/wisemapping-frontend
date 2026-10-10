/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React, { ErrorInfo, ReactElement, useContext, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { useStyles } from './style';
import { MapsList } from './maps-list';
import { createIntl, createIntlCache, FormattedMessage, IntlProvider } from 'react-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '../../classes/client';
import ActionDispatcher from './action-dispatcher';
import { ActionType } from './action-chooser';
import AccountMenu from './account-menu';
import HelpMenu from './help-menu';
import LanguageMenu from './language-menu';
import ThemeToggleButton from '../common/theme-toggle-button';
import AppI18n, { Locales } from '../../classes/app-i18n';
import { useFetchAccount } from '../../classes/middleware';

import MenuIcon from '@mui/icons-material/Menu';
import ArrowRight from '@mui/icons-material/NavigateNext';
import ArrowLeft from '@mui/icons-material/NavigateBefore';
import Box from '@mui/material/Box';

import AddCircleTwoTone from '@mui/icons-material/AddCircleTwoTone';
import CloudUploadTwoTone from '@mui/icons-material/CloudUploadTwoTone';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import PersonOutlineTwoTone from '@mui/icons-material/PersonOutlineTwoTone';
import PublicTwoTone from '@mui/icons-material/PublicTwoTone';
import ScatterPlotTwoTone from '@mui/icons-material/ScatterPlotTwoTone';
import ShareTwoTone from '@mui/icons-material/ShareTwoTone';
import StarTwoTone from '@mui/icons-material/StarTwoTone';
import SmartToyTwoTone from '@mui/icons-material/SmartToyTwoTone';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import LabelDeleteConfirm from './maps-list/label-delete-confirm';
import DrawerNav, { ToolbarButtonInfo } from './drawer-nav';
import { trackMindmapListAction, trackPageView } from '../../utils/analytics';
import { CSSObject, Interpolation, Theme } from '@emotion/react';
import { ClientContext } from '../../classes/provider/client-context';
import { SEOHead } from '../seo';
import { readStorage, writeStorage, removeStorage } from '../../utils/storage';

const CHATGPT_COPILOT_URL =
  'https://chatgpt.com/g/g-6908d77ed7988191bb7a62f29fcf0177-mind-map-copilot';

export type Filter = GenericFilter | LabelFilter;

export interface GenericFilter {
  type: 'public' | 'all' | 'starred' | 'shared' | 'label' | 'owned';
}

export interface LabelFilter {
  type: 'label';
  label: Label;
}

const MapsPage = (): ReactElement => {
  const [filter, setFilter] = React.useState<Filter>({ type: 'all' });
  const client = useContext(ClientContext);
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = React.useState<ActionType | undefined>(undefined);
  const [mindMapCopilotDialogOpen, setMindMapCopilotDialogOpen] = React.useState(false);
  const [labelToDelete, setLabelToDelete] = React.useState<number | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [desktopDrawerOpen, setDesktopDrawerOpen] = React.useState(
    readStorage('desktopDrawerOpen') === 'true',
  );
  const classes = useStyles(desktopDrawerOpen);

  // Get theme-appropriate icon color - match text color
  const getIconColor = () => {
    return undefined; // Use default which matches text color
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDesktopDrawerToggle = () => {
    if (!desktopDrawerOpen) writeStorage('desktopDrawerOpen', 'true');
    else removeStorage('desktopDrawerOpen');
    setDesktopDrawerOpen(!desktopDrawerOpen);
  };

  const handleMindMapCopilotDialogOpen = () => {
    trackMindmapListAction('ai_copilot_dialog_open', 'mindmap_list_ai');
    setMindMapCopilotDialogOpen(true);
  };

  const handleMindMapCopilotDialogClose = () => {
    setMindMapCopilotDialogOpen(false);
  };

  const handleMindMapCopilotDialogContinue = () => {
    trackMindmapListAction('ai_copilot_open', 'mindmap_list_ai');
    setMindMapCopilotDialogOpen(false);
    window.open(CHATGPT_COPILOT_URL, '_blank', 'noopener,noreferrer');
  };
  const account = useFetchAccount();
  // Reload based on user preference ...
  const userLocale = AppI18n.getUserLocale(account?.locale);

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
  }, [intl]);

  // Once per visit: a language change retitles the page but is not a new page view.
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(window.location.pathname, 'Maps List');
  }, []);

  const mutation = useMutation({
    mutationFn: (id: number) => client.deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },
    onError: (error) => {
      console.error(`Unexpected error ${error}`);
    },
  });

  const handleMenuClick = (filter: Filter) => {
    queryClient.invalidateQueries({ queryKey: ['maps'] });
    setFilter(filter);
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  };

  const handleLabelDelete = (id: number) => {
    mutation.mutate(id);
  };

  const { data } = useQuery<unknown, ErrorInfo, Label[]>({
    queryKey: ['labels'],
    queryFn: () => client.fetchLabels(),
  });

  const labels: Label[] = data ? data : [];
  const filterButtons: ToolbarButtonInfo[] = [
    {
      filter: { type: 'all' },
      label: intl.formatMessage({ id: 'maps.nav-all', defaultMessage: 'All' }),
      icon: (
        <ScatterPlotTwoTone
          htmlColor={getIconColor()}
          color={getIconColor() ? undefined : 'secondary'}
        />
      ),
    },
    {
      filter: { type: 'owned' },
      label: intl.formatMessage({ id: 'maps.nav-onwned', defaultMessage: 'My Maps' }),
      icon: (
        <PersonOutlineTwoTone
          htmlColor={getIconColor()}
          color={getIconColor() ? undefined : 'secondary'}
        />
      ),
    },
    {
      filter: { type: 'starred' },
      label: intl.formatMessage({ id: 'maps.nav-starred', defaultMessage: 'Starred' }),
      icon: (
        <StarTwoTone htmlColor={getIconColor()} color={getIconColor() ? undefined : 'secondary'} />
      ),
    },
    {
      filter: { type: 'shared' },
      label: intl.formatMessage({ id: 'maps.nav-shared', defaultMessage: 'Shared with me' }),
      icon: (
        <ShareTwoTone htmlColor={getIconColor()} color={getIconColor() ? undefined : 'secondary'} />
      ),
    },
    {
      filter: { type: 'public' },
      label: intl.formatMessage({ id: 'maps.nav-public', defaultMessage: 'Public' }),
      icon: (
        <PublicTwoTone
          htmlColor={getIconColor()}
          color={getIconColor() ? undefined : 'secondary'}
        />
      ),
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
    <DrawerNav
      account={account}
      drawerOpen={desktopDrawerOpen || mobileDrawerOpen}
      filterButtons={filterButtons}
      activeFilter={filter}
      onFilterClick={handleMenuClick}
      onLabelDelete={setLabelToDelete}
    />
  );

  const container = document !== undefined ? () => document.body : undefined;
  const label: Label | undefined = labels.find((l) => l.id === labelToDelete);
  return (
    <IntlProvider
      locale={userLocale.code}
      defaultLocale={Locales.EN.code}
      messages={userLocale.message}
    >
      <SEOHead
        title={intl.formatMessage({
          id: 'seo.maps.title',
          defaultMessage: 'My Maps | WiseMapping',
        })}
        description={intl.formatMessage({
          id: 'seo.maps.description',
          defaultMessage:
            'Access and manage your mind maps in WiseMapping. Create, edit, share, and collaborate on your visual thinking projects. Organize your ideas with our powerful mind mapping tool.',
        })}
        keywords="my maps, mind maps, visual thinking, collaboration, organize ideas, brainstorming, project management"
        canonicalUrl="/c/maps/"
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'My Maps - WiseMapping',
          description:
            'Access and manage your mind maps in WiseMapping. Create, edit, share, and collaborate on your visual thinking projects.',
          url: 'https://www.wisemapping.com/c/maps/',
          mainEntity: {
            '@type': 'WebApplication',
            name: 'WiseMapping',
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'Web Browser',
          },
        }}
      />
      <div css={classes.root}>
        <AppBar
          position="fixed"
          css={[classes.appBar, classes.appBarShift]}
          variant="outlined"
          elevation={0}
          component="header"
        >
          <Toolbar role="banner">
            <IconButton
              aria-label={intl.formatMessage({
                id: 'common.open-drawer',
                defaultMessage: 'Open drawer',
              })}
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, zIndex: 1300, position: 'relative' }}
              id="open-main-drawer"
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              aria-label={intl.formatMessage({
                id: 'common.open-drawer',
                defaultMessage: 'Open drawer',
              })}
              edge="start"
              onClick={handleDesktopDrawerToggle}
              sx={{
                p: 0,
                mr: 2,
                display: { xs: 'none', sm: 'inherit' },
                zIndex: 1300,
                position: 'relative',
              }}
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
                id: 'maps.copilot-tooltip',
                defaultMessage: 'Start a mindmap with ChatGPT-powered AI Copilot',
              })}
            >
              <Button
                color="primary"
                size="medium"
                variant="outlined"
                type="button"
                disableElevation={true}
                startIcon={<SmartToyTwoTone />}
                css={classes.copilotButton}
                onClick={handleMindMapCopilotDialogOpen}
              >
                <span className="message">
                  <FormattedMessage id="maps.copilot-button" defaultMessage="AI Copilot" />
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
            <Dialog
              open={mindMapCopilotDialogOpen}
              onClose={handleMindMapCopilotDialogClose}
              aria-labelledby="mindmap-copilot-dialog-title"
              aria-describedby="mindmap-copilot-dialog-description"
            >
              <DialogTitle id="mindmap-copilot-dialog-title">
                <FormattedMessage
                  id="maps.copilot-dialog.title"
                  defaultMessage="ChatGPT-powered Mindmap Copilot"
                />
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="mindmap-copilot-dialog-description">
                  <FormattedMessage
                    id="maps.copilot-dialog.description"
                    defaultMessage="ChatGPT-powered AI Copilot is a brainstorming assistant that turns your prompts into structured mind maps. We'll open it in a new tab so you can expand ideas, generate topics, and bring the best ones back to WiseMapping."
                  />
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  onClick={handleMindMapCopilotDialogContinue}
                  variant="contained"
                  color="primary"
                >
                  <FormattedMessage
                    id="maps.copilot-dialog.continue"
                    defaultMessage="Open Copilot"
                  />
                </Button>
              </DialogActions>
            </Dialog>

            <div css={classes.rightButtonGroup as Interpolation<Theme>}>
              <ThemeToggleButton />
              <LanguageMenu />
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
        <main css={classes.content} role="main">
          <div css={classes.toolbar} />
          <section
            aria-label={intl.formatMessage({ id: 'common.maps-list', defaultMessage: 'Maps list' })}
          >
            <MapsList filter={filter} />
          </section>
        </main>

        {/* Floating Help Button */}
        <Box
          sx={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <HelpMenu />
        </Box>
      </div>
      {label && labelToDelete != null && (
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

export default MapsPage;
