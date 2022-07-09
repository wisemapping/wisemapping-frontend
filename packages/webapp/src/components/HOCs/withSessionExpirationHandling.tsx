/* eslint-disable react/display-name */
import React, { ComponentType, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Client from '../../classes/client';
import ClientHealthSentinel from '../../classes/client/client-health-sentinel';
import { activeInstance, sessionExpired } from '../../redux/clientSlice';

function withSessionExpirationHandling<T>(Component: ComponentType<T>) {
  return (hocProps: T): React.ReactElement => {
    const client: Client = useSelector(activeInstance);
    const dispatch = useDispatch();

    useEffect(() => {
      if (client) {
        client.onSessionExpired(() => {
          dispatch(sessionExpired());
        });
      } else {
        console.warn('Session expiration wont be handled because could not find client');
      }
    }, []);

    return (
      <>
        <ClientHealthSentinel />
        <Component {...hocProps} />
      </>
    );
  };
}

export default withSessionExpirationHandling;
