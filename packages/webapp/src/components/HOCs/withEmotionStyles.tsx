/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { ComponentType } from 'react';

function withEmotionStyles<T>(css) {
  return (Component: ComponentType<T>) => {
    const WithEmotionStyles = (hocProps): React.ReactElement => {
      return <Component {...hocProps} css={{ ...hocProps.paperCss, ...css }} />;
    };
    WithEmotionStyles.displayName = `withEmotionStyles(${getDisplayName(Component)})`;
    return WithEmotionStyles;
  };
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withEmotionStyles;
