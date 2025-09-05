/// <reference types="@welldone-software/why-did-you-render" />

import React from 'react';

if (process.env.NODE_ENV === 'development') {
  import('@welldone-software/why-did-you-render').then((whyDidYouRender) => {
    import('react-redux/lib').then((reactRedux) => {
      whyDidYouRender.default(React, {
        trackAllPureComponents: true,
        trackHooks: true,
        trackExtraHooks: [[reactRedux, 'useSelector']],
      });
    });
  });
}
