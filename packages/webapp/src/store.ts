
import { configureStore } from '@reduxjs/toolkit';
import mapsListReducer from './reducers/mapsListSlice';

  // Create Service object...
  const store = configureStore({
    reducer: {
      mapsList: mapsListReducer
    }
  });

  export default store;