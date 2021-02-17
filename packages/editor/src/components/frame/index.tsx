import React from 'react';
import Footer from '../footer';
import TopBar from '../top-bar';
import Canvas from '../canvas';
import { StyledFrame } from './styled';

const Frame = (): React.ReactElement => (
  <StyledFrame>
    <TopBar />
    <Canvas />
    <Footer />
  </StyledFrame>
);

export default Frame;
