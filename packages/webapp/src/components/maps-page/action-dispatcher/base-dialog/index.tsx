import React from 'react'
import { FormattedMessage } from 'react-intl'
import { ErrorInfo } from '../../../../classes/client'
import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from './style'
import GlobalError from '../../../form/global-error'
import DialogContentText from '@material-ui/core/DialogContentText'
import Button from '@material-ui/core/Button'
import { PaperProps } from '@material-ui/core/Paper'

export type DialogProps = {
    onClose: () => void
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
    children: unknown
    error?: ErrorInfo

    title: string
    description?: string

    submitButton?: string
    actionUrl?: string
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
    PaperProps?: Partial<PaperProps>
}

const BaseDialog = (props: DialogProps): React.ReactElement => {
    const { onClose, onSubmit, maxWidth = 'sm', PaperProps } = props

    const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (onSubmit) {
            onSubmit(e)
        }
    }

    const description = props.description ? (
        <DialogContentText>{props.description}</DialogContentText>
    ) : null
    return (
        <div>
            <StyledDialog
                open={true}
                onClose={onClose}
                maxWidth={maxWidth}
                PaperProps={PaperProps}
                fullWidth={true}
            >
                <form autoComplete="off" onSubmit={handleOnSubmit}>
                    <StyledDialogTitle>{props.title}</StyledDialogTitle>

                    <StyledDialogContent>
                        {description}
                        <GlobalError error={props.error} />
                        {props.children}
                    </StyledDialogContent>

                    <StyledDialogActions>
                        <Button type="button" color="primary" size="medium" onClick={onClose}>
                            {onSubmit ? (
                                <FormattedMessage
                                    id="action.cancel-button"
                                    defaultMessage="Cancel"
                                />
                            ) : (
                                <FormattedMessage id="action.close-button" defaultMessage="Close" />
                            )}
                        </Button>
                        {onSubmit && (
                            <Button
                                color="primary"
                                size="medium"
                                variant="contained"
                                type="submit"
                                disableElevation={true}
                            >
                                {props.submitButton}
                            </Button>
                        )}
                    </StyledDialogActions>
                </form>
            </StyledDialog>
        </div>
    )
}

export default BaseDialog
