import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import profileReducer from './profileSlice'
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    profile: profileReducer,
  },
});
