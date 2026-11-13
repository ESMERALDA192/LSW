import { configureStore } from '@reduxjs/toolkit';
import institutesReducer from '../slices/institutesSlice.js';
export default configureStore({ reducer: { institutesReducer } });
