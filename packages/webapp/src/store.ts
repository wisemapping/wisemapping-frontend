
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import serviceReducer from './reducers/serviceSlice';

// Create Service object...
const store = configureStore({
  reducer: {
    service: serviceReducer
  }
});

export default store;