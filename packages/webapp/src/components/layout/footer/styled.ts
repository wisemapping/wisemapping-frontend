import styled from 'styled-components';
/* Footer */

export const StyledFooter = styled.footer`
    height: 250px;
    margin-top: 80px;
    padding: 60px 40px 10px 50px;
    background-color: #f9a826;
    display: grid;
    grid-template-columns: 200px 1fr 1fr 3fr;

    & a {
        font-size: 14px;
        color: white;
        word-wrap: nowrap;
    }

    & h4 {
        font-size: 14px;
        color: white;
        word-wrap: nowrap;
        font-weight: 500px;
        margin: 0px;
    }

    & > svg {
        grid-column: 1;
    }

    & div:nth-child(2) {
        grid-column: 2;
    }

    & div:nth-child(3) {
        grid-column: 3;
    }

    & div:nth-child(4) {
        grid-column: 4;
        text-align: right;
        display: inline-block;
        visibility: visible;
    }
`;
