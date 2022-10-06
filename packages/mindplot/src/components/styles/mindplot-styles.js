const mindplotStyles = `

  div#mindplot {
    position: relative;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
    overflow: hidden;
    opacity: 1;
    background-color: #f2f2f2;
    background-image: linear-gradient(#ebe9e7 1px, transparent 1px),
    linear-gradient(to right, #ebe9e7 1px, #f2f2f2 1px);
    background-size: 50px 50px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .mindplot-svg-tooltip {
    display: none;
    color: rgb(51, 51, 51);
    text-align: center;
    padding: 1px;
    position: absolute;
    z-index: 999;
    background-color: rgb(255, 255, 255);
    animation: fadeIn 0.4s;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12);
  }

  .fade-in {
    animation: fadeIn ease 0.4s;
    -webkit-animation: fadeIn ease 0.4s;
    -moz-animation: fadeIn ease 0.4s;
    -o-animation: fadeIn ease 0.4s;
    -ms-animation: fadeIn ease 0.4s;
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @-moz-keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @-webkit-keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @-o-keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @-ms-keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

.mindplot-svg-tooltip-title {
    background-color: #fff;
    font-size: small;
    font-family: sans;
    text-transform: uppercase;
    padding: 8px 14px;
    text-align: left;
    font-family: sans-serif;
    font-weight: bold;
    min-width: 200px;
    background-color: rgba(0, 0, 0, 0.04);
}

.mindplot-svg-tooltip-content {
    background-color: rgb(255, 255, 255);
    padding: 6px 4px;
    max-width: 300px;
    word-wrap: break-word;
    text-align: left;
    font-size: small;
    font-family: sans-serif;
    white-space: pre-line
}

.mindplot-svg-tooltip-content-link {
    padding: 3px 5px;
    overflow: hidden;
    font-size: smaller;
    text-decoration: none;
    color: #428bca;
}
`;

export default mindplotStyles;
