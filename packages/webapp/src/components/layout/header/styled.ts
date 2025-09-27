import styled from 'styled-components';

export const StyledNav = styled.nav`
  height: 90px;
  position: sticky;
  top: -16px;
  z-index: 1;
  -webkit-backface-visibility: hidden;

  &::before,
  &::after {
    content: '';
    display: block;
    height: 16px;
    position: sticky;
  }

  &::before {
    top: 58px;
  }

  &::after {
    top: 0;
    z-index: 2;
  }

  .header-area-right2 {
    grid-column-start: 3;
    text-align: right;
  }

  .header-area-right1 span,
  .header-area-right2 span {
    font-size: 15px;
  }

  .header-area-content-span {
    grid-column-start: 2;
    grid-column-end: 3;
    text-align: right;
    font-size: 14px;
    padding: 10px;
  }

  @media only screen and (max-width: 600px) {
    .header-area-content-span {
      display: none;
      grid-column-start: 2;
      grid-column-end: 3;
      text-align: right;
      font-size: 14px;
      padding: 10px;
    }
  }
`;

export const StyledDiv = styled.nav`
  height: 74px;
  padding: 10px;
  position: sticky;
  top: 0px;
  margin-top: -16px;
  z-index: 3;

  display: grid;
  white-space: nowrap;
  grid-template-columns: 150px 1fr 160px 20px;
`;

export const Logo = styled.span`
  grid-column-start: 1;
  margin-left: 20px;
  margin-top: 0px;

  .header-logo a {
    padding: 0px;
  }

  img {
    filter: brightness(0.8) contrast(1.1);
    transition: filter 0.2s ease;
  }

  &:hover img {
    filter: brightness(1) contrast(1.2);
  }
`;
