import React from 'react';
import BaseDialog from '../base-dialog';
import { SimpleDialogProps } from '..';
import { useIntl } from 'react-intl';
import Client, { ErrorInfo, Label, MapInfo } from '../../../../classes/client';
import { useStyles } from './style';
import { LabelSelector } from '../../maps-list/label-selector';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { activeInstance } from '../../../../redux/clientSlice';


const LabelDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
    const intl = useIntl();
    const classes = useStyles();
    const client: Client = useSelector(activeInstance);
    const queryClient = useQueryClient();

    // TODO: pass down map data instead of using query?
    const { data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', () => {
        return client.fetchAllMaps();
    });

    const map = data.find(m => m.id === mapId);

    const changeLabelMutation = useMutation<void, ErrorInfo, { label: Label, checked: boolean }, number>(
        async ({ label, checked }) => {
            if (!label.id) {
                label.id = await client.createLabel(label.title, label.color);
            }
            if (checked){
                return client.addLabelToMap(label.id, mapId);
            } else {
                return client.deleteLabelFromMap(label.id, mapId);
            }
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('maps');
                queryClient.invalidateQueries('labels');
            },
            onError: (error) => {
                console.error(error);
            }
        }
    );

    const handleChangesInLabels = (label: Label, checked: boolean) => {
        changeLabelMutation.mutate({
            label,
            checked
        });
    };

    return (
        <div>
            <BaseDialog
                onClose={onClose}
                title={intl.formatMessage({
                    id: 'label.title',
                    defaultMessage: 'Add a label',
                })}
                description={intl.formatMessage({
                    id: 'label.description',
                    defaultMessage:
                        'Use labels to organize your maps',
                })}
                PaperProps={{ classes: { root: classes.paper } }}
            >
                <LabelSelector onChange={handleChangesInLabels} maps={[map]} />
            </BaseDialog>
        </div>);
};

export default LabelDialog;
