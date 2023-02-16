import { css } from '@emotion/react';

export const recaptchaContainerStyle = css({
  paddingTop: '10px',
  // override captcha size, without this the component is not shown horizontally centered
  '& div div div': {
    width: '100% !important',
    height: '100% !important',
  },
});
