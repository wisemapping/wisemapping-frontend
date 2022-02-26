import { combineReducers } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import editorReducer from './editorSlice';

const rootReducer = combineReducers({
    client: clientReducer,
    editor: editorReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;