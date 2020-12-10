import styled from 'styled-components';

const PageContent = styled.div`
max-width: 1024px;
min-height: 400px;
margin: auto;
padding-top: 100px;
grid-area: content;
text-align: center;

& p {
    color: black;
    font-size: 18px;
    margin: 10px 0px 30px 0px;
}

& h1 {
    color: #f9a826;
    font-size: 30px;
}`

export default PageContent;