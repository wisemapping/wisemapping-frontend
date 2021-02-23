import React from 'react';

import Tooltip from '@material-ui/core/Tooltip';
import PersonSharpIcon from '@material-ui/icons/PersonSharp';
import EditSharpIcon from '@material-ui/icons/EditSharp';
import VisibilitySharpIcon from '@material-ui/icons/VisibilitySharp';

import { FormattedMessage } from 'react-intl';
import { Role } from '../../../classes/client';

type RoleIconProps = {
    role: Role;
};

const RoleIcon = ({ role }: RoleIconProps): React.ReactElement => {
    return (
        <span>
            {role == 'owner' && (
                <Tooltip
                    title={<FormattedMessage id="role.owner" defaultMessage="Onwer" />}
                    arrow={true}
                >
                    <PersonSharpIcon />
                </Tooltip>
            )}

            {role == 'editor' && (
                <Tooltip
                    title={<FormattedMessage id="role.editor" defaultMessage="Editor" />}
                    arrow={true}
                >
                    <EditSharpIcon />
                </Tooltip>
            )}

            {role == 'viewer' && (
                <Tooltip
                    title={<FormattedMessage id="role.viewer" defaultMessage="Viewer" />}
                    arrow={true}
                >
                    <VisibilitySharpIcon />
                </Tooltip>
            )}
        </span>
    );
};

export default RoleIcon;
