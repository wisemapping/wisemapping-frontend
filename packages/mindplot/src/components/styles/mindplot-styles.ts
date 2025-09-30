const mindplotStyles: string = `
  .mindplot-svg-tooltip {
    display: none;
    color: #313131;
    text-align: left;
    padding: 0;
    position: absolute;
    z-index: 999;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    animation: fadeIn 0.25s ease-out;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 300px;
    max-width: 450px;
    overflow: hidden;
    backdrop-filter: blur(8px);
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
    background-color: transparent;
    font-size: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-transform: uppercase;
    padding: 6px 16px 8px 16px;
    text-align: right;
    font-weight: 500;
    letter-spacing: 0.8px;
    color: #999999;
    border-top: 1px solid #f0f0f0;
    margin-top: 8px;
    opacity: 0.8;
}

.mindplot-svg-tooltip-content {
    background-color: #ffffff;
    padding: 20px 20px 12px 20px;
    word-wrap: break-word;
    text-align: left;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    white-space: pre-line;
    color: #2c2c2c;
    border-radius: 12px 12px 0 0;
}

.mindplot-svg-tooltip-content-link {
    display: inline-block;
    padding: 10px 14px;
    margin: 6px 0;
    background: linear-gradient(135deg, #fff8f0 0%, #fef5e7 100%);
    border: 1px solid #ffa800;
    border-radius: 8px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-decoration: none;
    color: #ffa800;
    word-break: break-all;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(255, 168, 0, 0.1);
    position: relative;
    overflow: hidden;
}

.mindplot-svg-tooltip-content-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
}

.mindplot-svg-tooltip-content-link:hover {
    background: linear-gradient(135deg, #ffa800 0%, #e57500 100%);
    color: #ffffff;
    border-color: #e57500;
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 168, 0, 0.3);
}

.mindplot-svg-tooltip-content-link:hover::before {
    left: 100%;
}
`;

export default mindplotStyles;
