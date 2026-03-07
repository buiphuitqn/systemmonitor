import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "../features/common/commonSlice";
import Auth from '../reducers/Auth';

export const store = configureStore({
  reducer: {
    auth: Auth, 
    common: commonReducer,
  },
});