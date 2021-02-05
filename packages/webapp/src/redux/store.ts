
import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';

// Create Service object...
const store = configureStore({
  reducer: {
    client: clientReducer
  }
});

export default store;