import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { handleLoginApi, doGetAccountService , registerService} from "../service/authService";

const initialState = {
  user: {}, // user info nào login(hs - teacher)
  isLoggedIn: false, // kiểm tra xem đã login chưa -> chặn nếu chưa login
  isLoading: false,
  isError: false,
};

// action -> export
export const handleLogin = createAsyncThunk(
  "auth/handleLogin",
  async ({ phoneNumber, password }, thunkAPI) => {
    const response = await handleLoginApi(phoneNumber, password); 
    return response;
  }
);

export const doGetAccount = createAsyncThunk(
  "auth/doGetAccount",
  async (thunkAPI) => {
    const response = await doGetAccountService();
    return response;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (formData, thunkAPI) => {
    const response = await registerService({formData});
    console.log("response", response);

    return response;
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
          state.isLoggedIn = true;
        } else state.isLoggedIn = false;
      })
      .addCase(handleLogin.rejected, (state, action) => {});

    // doGetAccount
    builder
      .addCase(doGetAccount.pending, (state) => {})
      .addCase(doGetAccount.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.user = action.payload.DT || {};
          state.isLoggedIn = true;
        }
      })
      .addCase(doGetAccount.rejected, (state, action) => {});

    // register
    builder
      .addCase(register.pending, (state) => {})
      .addCase(register.fulfilled, (state, action) => {})
      .addCase(register.rejected, (state, action) => {});
  },
});

export const {} = authSlice.actions; // đây là action -> chỉ dùng khi trong reducer có reducers:{}

export default authSlice.reducer;
