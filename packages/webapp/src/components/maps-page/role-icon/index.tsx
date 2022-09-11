import React from 'react';

import Tooltip from '@mui/material/Tooltip';
import PersonSharpIcon from '@mui/icons-material/PersonSharp';
import EditSharpIcon from '@mui/icons-material/EditSharp';
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';

import { FormattedMessage } from 'react-intl';
import { Role } from '../../../classes/client';

type RoleIconProps = {
  role: Role;
};

const RoleIcon = ({ role }: RoleIconProps): React.ReactElement => {
  return (
    <span>
      {role == 'owner' && (
        <Tooltip title={<FormattedMessage id="role.owner" defaultMessage="Owner" />} arrow={true}>
          <PersonSharpIcon />
        </Tooltip>
      )}

      {role == 'editor' && (
        <Tooltip title={<FormattedMessage id="role.editor" defaultMessage="Editor" />} arrow={true}>
          <EditSharpIcon />
        </Tooltip>
      )}

      {role == 'viewer' && (
        <Tooltip title={<FormattedMessage id="role.viewer" defaultMessage="Viewer" />} arrow={true}>
          <VisibilitySharpIcon />
        </Tooltip>
      )}
    </span>
  );
};

export default RoleIcon;
