import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// Create Service object...
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
export default store;
