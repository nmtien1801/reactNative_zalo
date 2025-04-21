import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import profileReducer from "./profileSlice";
import roomChatReducer from "./roomChatSlice";
import chatReducer from "./chatSlice";
import permissionReducer from "./permissionSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    roomChat: roomChatReducer,
    profile: profileReducer,
    permission: permissionReducer,
  },
});
