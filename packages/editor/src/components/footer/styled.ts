import styled from 'styled-components';
import { times } from '../../size';
import LogoTextBlackSvg from '../../../images/logo-text-black.svg';

export const StyledFooter = styled.div`
    height: ${times(10)};
    width: 100%;
    border: 1px solid black;
`;

export const StyledLogo = styled.div`
    position: fixed;
    left: 20px;
    bottom: 10px;
    background: url(${LogoTextBlackSvg}) no-repeat;
    width: 90px;
    height: 40px;
`;

export const Notifier = styled.div`
    border: 1px solid rgb(241, 163, 39);
    background-color: rgb(252, 235, 192);
    border-radius: 3px;
    position: fixed;
    padding: 5px 9px;
    color: back;
    white-space: nowrap;
    margin-top: 5px;
    display: none;
    bottom: 10px;
`;
