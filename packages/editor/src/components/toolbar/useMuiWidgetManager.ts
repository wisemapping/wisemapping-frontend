import { useState, useRef } from 'react';
import DefaultWidgetManager from '../../classes/default-widget-manager';

export const useMuiWidgetManager = (): [boolean, Element | undefined, DefaultWidgetManager] => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(undefined);
  const widgetManager = useRef(new DefaultWidgetManager(setPopoverOpen, setPopoverTarget));

  return [popoverOpen, popoverTarget, widgetManager.current];
};
