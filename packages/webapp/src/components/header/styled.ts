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

/* Review ....*/
.header-middle {
    grid-column-start: 2;
}

.header-area-right1 {
    grid-column-start: 3;
}

.header-area-right2 {
    grid-column-start: 4;
}
`;

export const StyledDiv  = styled.nav`
background: white;
height: 74px;
padding: 10px;
position: sticky;
top: 0px;
margin-top: -16px;
z-index: 3;

display: grid;
white-space: nowrap;
grid-template-columns: 150px 1fr 130px 160px 50px;
`

export const Logo  = styled.span`
grid-column-start: 1;
margin-left: 50px;
margin-top: 5px;

.header-logo img {
    height: 50px;
}

.header-logo a {
    padding: 0px;
}
`