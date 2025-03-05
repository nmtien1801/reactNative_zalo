import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { handleLoginApi } from "../service/authService";

const initialState = {
  user: {}, // user info nào login(hs - teacher)
  isLogin: false, // kiểm tra xem đã login chưa -> chặn nếu chưa login
  isLoading: false,
  isError: false,
};

// action -> export
export const handleLogin = createAsyncThunk(
  "auth/handleLogin",
  async ({ phoneNumber, password }, thunkAPI) => {
    const response = await handleLoginApi(phoneNumber, password); // Đảm bảo hàm được gọi đúng cách
    return response.data;
  }
);

// đây là reducer
const authSlice = createSlice({
  name: "auth",
  initialState,

  // dùng api mới sử dụng extraReducers
  // 3 trạng thái của api: pending, fulfilled, rejected
  extraReducers: (builder) => {
    // handleLogin
    builder
      .addCase(handleLogin.pending, (state) => {})
      .addCase(handleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.DT || {};
        if (action.payload.EC === 0) {
          state.isLogin = true;
        } else state.isLogin = false;

        // state.token = action.payload.token;
        // localStorage.setItem("learning_App", action.payload.DT.access_token); // Lưu token vào localStorage
      })
      .addCase(handleLogin.rejected, (state, action) => {});
  },
});

export const {} = authSlice.actions; // đây là action -> chỉ dùng khi trong reducer có reducers:{}

export default authSlice.reducer;
