import React from 'react';
import { NoteForm, UrlForm } from '../toolbar/toolbarCustomComponents';

function linkContent(linkModel, closeModal): React.ReactElement {
  return <UrlForm closeModal={closeModal} urlModel={linkModel}></UrlForm>;
}

function noteContent(noteModel, closeModal): React.ReactElement {
  return <NoteForm closeModal={closeModal} noteModel={noteModel}></NoteForm>;
}

export { linkContent, noteContent };
