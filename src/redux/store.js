import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import profileReducer from './profileSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
  },
});
