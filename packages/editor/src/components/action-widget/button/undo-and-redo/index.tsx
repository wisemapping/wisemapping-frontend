import React, { useEffect, useState } from 'react';
import ActionConfig from '../../../../classes/action-config';
import { ToolbarMenuItem } from '../../../toolbar/Toolbar';

const UndoAndRedo = (props: {
  configuration: ActionConfig;
  disabledCondition: (event) => boolean;
}) => {
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    const handleUpdate: any = (event) => {
      if (props.disabledCondition(event)) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    };
    designer.addEvent('modelUpdate', handleUpdate);
    return () => {
      designer.removeEvent('modelUpdate', handleUpdate);
    };
  }, []);

  return (
    <ToolbarMenuItem
      configuration={{
        ...props.configuration,
        disabled: () => disabled,
      }}
    ></ToolbarMenuItem>
  );
};
export default UndoAndRedo;
