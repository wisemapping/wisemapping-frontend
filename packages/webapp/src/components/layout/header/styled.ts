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
        box-shadow: 0 4px 10px 0 rgba(202, 34, 34, 0.05), 0 5px 30px 0 rgba(0, 0, 0, 0.05);
    }

    &::after {
        background: linear-gradient(white, rgba(255, 255, 255, 0.3));
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
    background: white;
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
`;
