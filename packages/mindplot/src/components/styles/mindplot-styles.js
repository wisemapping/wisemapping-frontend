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
  }

  .mindplot-svg-tooltip {
    display: none;
    color: rgb(51, 51, 51);
    text-align: center;
    padding: 1px;
    border-radius: 6px;
    position: absolute;
    z-index: 999;
    background-color: rgb(255, 255, 255);
    animation: fadeIn 0.4s;
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
    background-color: rgb(247, 247, 247);
    border-bottom-color: rgb(235, 235, 235);
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    box-sizing: border-box;
    color: rgb(51, 51, 51);
    cursor: default;
    display: block;
    padding: 8px 14px;
    text-align: left;
    font-family: Arial;
    font-size: small;
}

.mindplot-svg-tooltip-content {
    background-color: rgb(255, 255, 255);
    padding: 6px 4px;
    max-width: 250px;
}

.mindplot-svg-tooltip-content-link {
    padding: 3px 5px;
    overflow: hidden;
    font-size: smaller;
    text-decoration: none;
    font-family: Arial;
    font-size: small;
    color: #428bca;
}

.mindplot-svg-tooltip-content-note {
    text-align: left;
    font-family: Arial;
    font-size: small;
}

.mindplot-svg-tooltip:before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #fff;
    bottom: 100%;
    right: 50%;
    transform: translateX(50%);
    z-index: 5;
  }

  .mindplot-svg-tooltip:after {
    content: "";
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid rgb(247, 247, 247);
    bottom: calc(1px + 100%);
    right: 50%;
    transform: translateX(50%);
  }
`;

export default mindplotStyles;
