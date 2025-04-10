import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  handleLoginApi,
  doGetAccountService,
  registerService,
  sendCodeService,
  resetPasswordService,
  changePasswordService,
} from "../service/authService";
import { uploadAvatarProfileService } from "../service/profileService";

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
    const response = await registerService({ formData });
    console.log("sss", response);

    return response;
  }
);

export const sendCode = createAsyncThunk(
  "auth/sendCode",
  async (email, thunkAPI) => {
    const response = await sendCodeService(email);

    return response;
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, code, password }, thunkAPI) => {
    const response = await resetPasswordService(email, code, password);
    return response;
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ phone, currentPassword, newPassword }, thunkAPI) => {
    const response = await changePasswordService(
      phone,
      currentPassword,
      newPassword
    );
    return response;
  }
);

export const uploadAvatarProfile = createAsyncThunk(
  "auth/uploadAvatarProfile",
  async ({ phone, avatar }, thunkAPI) => {
    
    let response = await uploadAvatarProfileService(phone, avatar);


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
      .addCase(handleLogin.pending, (state) => {
        state.isLoading = true; // Bắt đầu loading
      })
      .addCase(handleLogin.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.user = action.payload.DT || {};
          state.isLoggedIn = true;
          state.isLoading = false; // Kết thúc loading
        } else {
          alert(action.payload.EM);
        }
      })
      .addCase(handleLogin.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.isLoading = false; // Kết thúc loading
        alert("Đăng nhập không thành công");
      });

    // doGetAccount
    builder
      .addCase(doGetAccount.pending, (state) => {
        state.isLoading = true; // Bắt đầu loading
      })
      .addCase(doGetAccount.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          state.user = action.payload.DT || {};
          console.log("state.user: ", action.payload);

          state.isLoggedIn = true;
          state.isLoading = false; // Kết thúc loading
        }
      })
      .addCase(doGetAccount.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.isLoading = false; // Kết thúc loading
      });

    // register
    builder
      .addCase(register.pending, (state) => {})
      .addCase(register.fulfilled, (state, action) => {})
      .addCase(register.rejected, (state, action) => {});

    // sendCode
    builder
      .addCase(sendCode.pending, (state) => {})
      .addCase(sendCode.fulfilled, (state, action) => {})
      .addCase(sendCode.rejected, (state, action) => {});

    // resetPassword
    builder
      .addCase(resetPassword.pending, (state) => {})
      .addCase(resetPassword.fulfilled, (state, action) => {})
      .addCase(resetPassword.rejected, (state, action) => {});

    // changePassword
    builder
      .addCase(changePassword.pending, (state) => {})
      .addCase(changePassword.fulfilled, (state, action) => {})
      .addCase(changePassword.rejected, (state, action) => {});

    //uploadAvatarProfile
    builder
      .addCase(uploadAvatarProfile.pending, (state) => {})
      .addCase(uploadAvatarProfile.fulfilled, (state, action) => {
        if (action.payload.EC === 0) {
          console.log('action: ', action);
          
          state.user.avatar = action.payload.DT || {};
        }
      })
      .addCase(uploadAvatarProfile.rejected, (state, action) => {});
  },
});

export const {} = authSlice.actions; // đây là action -> chỉ dùng khi trong reducer có reducers:{}

export default authSlice.reducer;
