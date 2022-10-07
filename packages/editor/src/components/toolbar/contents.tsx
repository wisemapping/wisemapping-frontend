import React from 'react';
import { NoteForm, UrlForm } from './toolbarCustomComponents';

const linkContent = (linkModel, closeModal): React.ReactElement => {
  return <UrlForm closeModal={closeModal} urlModel={linkModel}></UrlForm>;
};

const noteContent = (noteModel, closeModal): React.ReactElement => {
  return <NoteForm closeModal={closeModal} noteModel={noteModel}></NoteForm>;
};

export { linkContent, noteContent };
