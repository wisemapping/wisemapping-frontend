import { useState, useRef } from 'react';
import MuiWidgetManager from './MuiWidgetManager';

export const useMuiWidgetManager = (): [boolean, Element | undefined, MuiWidgetManager] => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(undefined);
  const widgetManager = useRef(new MuiWidgetManager(setPopoverOpen, setPopoverTarget));

  return [popoverOpen, popoverTarget, widgetManager.current];
};
