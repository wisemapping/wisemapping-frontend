import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ToolbarActionType } from './components/toolbar';
import Popover from '@mui/material/Popover';

import { IntlProvider } from 'react-intl';
import {
  $notify,
  PersistenceManager,
  DesignerOptionsBuilder,
  Designer,
  DesignerKeyboard,
  EditorRenderMode,
  MindplotWebComponentInterface,
  Mindmap,
  MockPersistenceManager,
  LocalStorageManager,
  RESTPersistenceManager,
  TextExporterFactory,
  ImageExporterFactory,
  Exporter,
  Importer,
  TextImporterFactory,
  MindplotWebComponent,
} from '@wisemapping/mindplot';
import './global-styled.css';
import I18nMsg from './classes/i18n-msg';
import { useMuiWidgetManager } from './components/menu/useMuiWidgetManager';
import Toolbar, { horizontalPosition, Appbar, configurationBuilder } from './components/toolbar';
import { theme as defaultEditorTheme } from './theme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { Theme } from '@mui/material/styles';
import { Notifier } from './components/footer/styled';
import Footer from './components/footer';

declare global {
  // used in mindplot
  var designer: Designer;
  var accountEmail: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['mindplot-component']: MindplotWebComponentInterface;
    }
  }
}

export type EditorOptions = {
  mode: EditorRenderMode;
  locale: string;
  zoom?: number;
  locked?: boolean;
  lockedMsg?: string;
  mapTitle: string;
  enableKeyboardEvents: boolean;
};

export {
  PersistenceManager,
  DesignerOptionsBuilder,
  Designer,
  DesignerKeyboard,
  EditorRenderMode,
  Mindmap,
  MockPersistenceManager,
  LocalStorageManager,
  RESTPersistenceManager,
  TextExporterFactory,
  ImageExporterFactory,
  Exporter,
  Importer,
  TextImporterFactory,
};

export type EditorProps = {
  mapId: string;
  options: EditorOptions;
  persistenceManager: PersistenceManager;
  onAction: (action: ToolbarActionType) => void;
  onLoad?: (designer: Designer) => void;
  theme?: Theme;
  accountConfiguration?: React.ReactElement;
};

const Editor = ({
  mapId,
  options,
  persistenceManager,
  onAction,
  onLoad,
  theme,
  accountConfiguration,
}: EditorProps) => {
  const [isMobile, setIsMobile] = useState(undefined);
  const [mindplotComponent, setMindplotComponent]: [MindplotWebComponent | undefined, Function] =
    useState();

  const {
    editMode,
    showOnlyCommonActions,
    showAccessChangeActions,
    showMapEntityActions,
    showMindMapNodesActions,
    showPersistenceActions,
  } = getToolsVisibilityConfiguration(options, isMobile);

  const editorTheme: Theme = theme ? theme : defaultEditorTheme;
  const [toolbarsRerenderSwitch, setToolbarsRerenderSwitch] = useState(0);
  const toolbarConfiguration = useRef([]);
  const mindplotRef = useCallback((node: MindplotWebComponent) => {
    setMindplotComponent(node);
  }, []);

  const [popoverOpen, popoverTarget, widgetManager] = useMuiWidgetManager();

  const onNodeBlurHandler = () => {
    if (!mindplotComponent.getDesigner().getModel().selectedTopic())
      setToolbarsRerenderSwitch(Date.now());
  };

  const onNodeFocusHandler = () => {
    setToolbarsRerenderSwitch(Date.now());
  };

  useEffect(() => {
    if (mindplotComponent === undefined) return;
    // Change page title ...
    document.title = `${options.mapTitle} | WiseMapping `;

    // Load mindmap ...

    const designer = onLoadDesigner(mapId, options, persistenceManager);

    designer.addEvent('onblur', onNodeBlurHandler);

    designer.addEvent('onfocus', onNodeFocusHandler);

    designer.addEvent('modelUpdate', onNodeFocusHandler);

    designer.getWorkSpace().getScreenManager().addEvent('update', onNodeFocusHandler);

    if (editMode) {
      // Register unload save ...
      window.addEventListener('beforeunload', () => {
        mindplotComponent.save(false);
        mindplotComponent.unlockMap();
      });

      // Autosave on a fixed period of time ...
      setInterval(() => {
        mindplotComponent.save(false);
      }, 10000);
    }

    toolbarConfiguration.current = configurationBuilder.buildToolbarCongiruation(designer);
    // Has extended actions been customized ...
    if (onLoad) {
      onLoad(designer);
    }

    mindplotComponent.loadMap(mapId);

    setIsMobile(checkMobile());

    if (options.locked) {
      $notify(options.lockedMsg, false);
    }
  }, [mindplotComponent !== undefined]);

  useEffect(() => {
    if (options.enableKeyboardEvents) {
      DesignerKeyboard.resume();
    } else {
      DesignerKeyboard.pause();
    }
  }, [options.enableKeyboardEvents]);

  const checkMobile = () => {
    const check =
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent.toLowerCase(),
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        navigator.userAgent.toLowerCase().substring(0, 4),
      );
    return check;
  };

  const onLoadDesigner = (
    mapId: string,
    options: EditorOptions,
    persistenceManager: PersistenceManager,
  ): Designer => {
    // Build designer ...
    mindplotComponent.buildDesigner(persistenceManager, widgetManager);
    return mindplotComponent.getDesigner();
  };

  const locale = options.locale;
  const msg = I18nMsg.loadLocaleData(locale);
  const menubarConfiguration = configurationBuilder.buildEditorAppBarConfiguration(
    mindplotComponent?.getDesigner(),
    onAction,
    () => {
      mindplotComponent.save(true);
    },
    showOnlyCommonActions,
    showAccessChangeActions,
    showMapEntityActions,
    showMindMapNodesActions,
    showPersistenceActions,
  );
  if (options.mode !== 'showcase') {
    menubarConfiguration.push({
      render: () => accountConfiguration,
    });
  }

  useEffect(() => {
    return () => {
      mindplotComponent.unlockMap();
    };
  }, []);

  // if the Toolbar is not hidden before the variable 'isMobile' is defined, it appears intermittently when the page loads
  // if the Toolbar is not rendered, Menu.ts cant find buttons for create event listeners
  // so, with this hack the Toolbar is rendered but no visible until the variable 'isMobile' is defined
  return (
    <ThemeProvider theme={editorTheme}>
      <IntlProvider locale={locale} messages={msg}>
        <Appbar configurations={menubarConfiguration} />
        <Popover
          id="popover"
          open={popoverOpen}
          anchorEl={popoverTarget}
          onClose={widgetManager.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {widgetManager.getEditorContent()}
        </Popover>
        {showMindMapNodesActions && (
          <Toolbar
            configurations={toolbarConfiguration.current}
            rerender={toolbarsRerenderSwitch}
          ></Toolbar>
        )}
        <Toolbar
          configurations={configurationBuilder.buildZoomToolbarConfiguration(
            isMobile,
            mindplotComponent?.getDesigner(),
          )}
          position={horizontalPosition}
          rerender={toolbarsRerenderSwitch}
        ></Toolbar>
        <mindplot-component
          ref={mindplotRef}
          id="mindmap-comp"
          mode={options.mode}
          locale={options.locale}
        ></mindplot-component>
        <Notifier id="headerNotifier"></Notifier>
        <Footer editorMode={options.mode} isMobile={isMobile}></Footer>
      </IntlProvider>
    </ThemeProvider>
  );
};
export default Editor;
function getToolsVisibilityConfiguration(options: EditorOptions, isMobile: any) {
  const editMode = options.mode === 'edition-owner' || options.mode === 'edition-editor';
  const showcaseMode = options.mode === 'showcase';
  const showMindMapNodesActions = (editMode || showcaseMode) && !isMobile && !options.locked;
  const showMapEntityActions = editMode && !isMobile;
  const showAccessChangeActions = options.mode === 'edition-owner' && !isMobile;
  const showPersistenceActions = editMode && !isMobile && !options.locked;
  const showOnlyCommonActions = options.mode === 'viewonly' || isMobile;

  return {
    editMode,
    showOnlyCommonActions,
    showAccessChangeActions,
    showMapEntityActions,
    showMindMapNodesActions,
    showPersistenceActions,
  };
}
