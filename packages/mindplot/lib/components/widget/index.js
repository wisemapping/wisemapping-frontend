const colorPalettePanel = require('./ColorPalettePanel').default;
const floatingTip = require('./FloatingTip').default;
const fontFamilyPanel = require('./FontFamilyPanel').default;
const fontSizePanel = require('./FontSizePanel').default;
const iconPanel = require('./IconPanel').default;
const imenu = require('./IMenu').default;
const keyboardShortcutTooltip = require('./KeyboardShortcutTooltip').default;
const linkEditor = require('./LinkEditor').default;
const linkIconTooltip = require('./LinkIconTooltip').default;
const listToolbarPanel = require('./ListToolbarPanel').default;
const menu = require('./Menu').default;
const modalDialogNotifier = require('./ModalDialogNotifier');
const noteEditor = require('./NoteEditor');
const toolbarItem = require('./ToolbarItem');
const toolbarNotifier = require('./ToolbarNotifier');
const toolbarPanelItem = require('./ToolbarPaneItem');
const topicShapePanel = require('./TopicShapePanel');

export const Widgets = {
    ColorPalettePanel: colorPalettePanel,
    FloatingTip: floatingTip,
    FontFamilyPanel: fontFamilyPanel,
    FontSizePanel: fontSizePanel,
    IconPanel: iconPanel,
    Imenu: imenu,
    KeyboardShortcutTooltip: keyboardShortcutTooltip,
    LinkEditor: linkEditor,
    LinkIconTooltip: linkIconTooltip,
    ListToolbarPanel: listToolbarPanel,
    Menu: menu,
    ModalDialogNotifier: modalDialogNotifier,
    NoteEditor: noteEditor,
    ToolbarItem: toolbarItem,
    ToolbarNotifier: toolbarNotifier,
    ToolbarPaneItem: toolbarPanelItem,
    TopicShapePanel: topicShapePanel,
};
