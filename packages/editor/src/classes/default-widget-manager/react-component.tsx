import React from 'react';
import UrlForm from '../../components/toolbar/component/link-form';
import NoteForm from '../../components/toolbar/component/note-form';

const linkContent = (linkModel, closeModal): React.ReactElement => {
  return <UrlForm closeModal={closeModal} urlModel={linkModel}></UrlForm>;
};

const noteContent = (noteModel, closeModal): React.ReactElement => {
  return <NoteForm closeModal={closeModal} noteModel={noteModel}></NoteForm>;
};

export { linkContent, noteContent };
