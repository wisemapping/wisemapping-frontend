import React from 'react';
import TopicLink from '../../components/action-widget/pane/topic-link';
import TopicNote from '../../components/action-widget/pane/topic-note';

const linkContent = (linkModel, closeModal): React.ReactElement => {
  return <TopicLink closeModal={closeModal} urlModel={linkModel}></TopicLink>;
};

const noteContent = (noteModel, closeModal): React.ReactElement => {
  return <TopicNote closeModal={closeModal} noteModel={noteModel}></TopicNote>;
};

export { linkContent, noteContent };
