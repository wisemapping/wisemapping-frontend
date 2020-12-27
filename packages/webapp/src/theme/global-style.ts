import { TextField, withStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import styled, { createGlobalStyle } from 'styled-components';


const GlobalStyle = createGlobalStyle`
  
@import url('https://fonts.googleapis.com/css?family=Montserrat:100,300,400,700,900');
* {
    box-sizing: border-box;
}

body {
    font: 1.2em Montserrat, arial, sans-serif;
    margin: 0px;
}

a {
    text-decoration: none;
    transition: background-color 0.3s ease;
}

/* Buttons */

.button-style1,
.button-style2,
.button-style3 {
    font-size: 16px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    white-space: nowrap;
    padding-top: 10px;
}

.button-style1 a,
.button-style2 a,
.button-style3 a {
    padding: 10px 30px 10px 30px;
    transition: background-color 0.3s ease;
    border-radius: 9px;
}

.button-style1 a {
    color: #f9a826;
    background-color: white;
    border: solid 1px #f9a826;
}

.button-style1 a:hover {
    color: white;
    background-color: rgba(255, 168, 0, 0.6);
    border: 0px;
}

.button-style2 a {
    color: #ffa800;
    background-color: white;
    border: solid 1px rgba(255, 168, 0, 0.6);
}

.button-style2 a:hover {
    color: white;
    border: solid 1px white;
    background-color: rgba(243, 220, 174, 0.6);
}

.button-style3 a {
    color: white;
    background-color: #ffa800;
    font-weight: 600;
}

.button-style3 a:hover {
    color: #ffa800;
    background-color: white;
    border: solid 1px #ffa800;
    font-weight: 600;
}

`;
const PageContent = styled.div`
max-width: 800px;
min-height: 400px;
margin: 10px auto;
text-align:center;
padding: 20px 10px 20px 10px;

/* Form Styles Section */

& input[type=checkbox] {
    border: solid 1px #f9a826;
    background-color: #f9a826;
}

& input[type=submit],
& input[type=button] {
    width: 300px;
    height: 53px;
    padding: 0px 20px;
    margin: 10px 20px;
    font-size: 20px;
    font-weight: 600;
    border-radius: 9px;
    border: 0px;
    background-color: rgba(255, 168, 0, 0.6);
    color: white;
}

& input[type=submit]:hover {
    background-color: #f9a826;
}

& label {
    font-size:15px;
}

& input:placeholder {
    color: grey;
}

& h1,
& h2 {
    font-stretch: normal;
    font-style: normal;
    line-height: 1.2;
    letter-spacing: normal;
}

& h1 {
    font-size: 36px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #f9a826;
}

& a {
    font-size: 15px;
    color: #f9a826;
}
`;


export { GlobalStyle, PageContent };