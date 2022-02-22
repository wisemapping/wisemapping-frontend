import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./rootReducer";

export interface EditorState {
    hotkeysEnabled: boolean;
}

const initialState: EditorState = {
    hotkeysEnabled: true,
};

export const editorSlice = createSlice({
    name: 'editor',
    initialState: initialState,
    reducers: {
        disableHotkeys(state) {
            state.hotkeysEnabled = false;
        },
        enableHotkeys(state) {
            state.hotkeysEnabled = true;
        },
    },
});

export const hotkeys = (state: RootState): boolean => {
    return state.editor.hotkeysEnabled;
};

export const { disableHotkeys, enableHotkeys } = editorSlice.actions;
export default editorSlice.reducer;