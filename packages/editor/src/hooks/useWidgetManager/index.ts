import DefaultWidgetManager from '../../classes/default-widget-manager';

export const useWidgetManager = (): {
  popoverOpen: boolean;
  setPopoverOpen: (arg: boolean) => void;
  popoverTarget: Element;
  widgetManager: DefaultWidgetManager;
} => {
  const [popoverOpen, setPopoverOpen, popoverTarget, widgetManager] =
    DefaultWidgetManager.useCreate();

  return { popoverOpen, setPopoverOpen, popoverTarget, widgetManager };
};
