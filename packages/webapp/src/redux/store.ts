import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// Create Service object...
const store = configureStore({
    reducer: rootReducer,
});

export default store;
