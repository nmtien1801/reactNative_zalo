import axios from "axios";
import { Platform } from "react-native";
import customizeAxios from "../component/customizeAxios";

const handleLoginApi = (phoneNumber, password) => {
  return customizeAxios.post(`/login`, { phoneNumber, password });
};

const doGetAccountService = () => {
  return customizeAxios.get("/account");
};

const registerService = (formData) => {
  return customizeAxios.post("/register", formData);
}

const sendCodeService = (email) => {
  return customizeAxios.post("/send-code", {
    email,
  });
};

const resetPasswordService = (email, code, password) => {
  return customizeAxios.post("/reset-password", {
    email,
    code,
    password,
  });
};

const changePasswordService = (phone, currentPassword, newPassword) => {
  return customizeAxios.post("/changePassword", {
    phone,
    currentPassword,
    newPassword,
  });
};

const updateAvatarService = (formData) => {
  return customizeAxios.put("/user/avatar", formData, {
    transformRequest: (data, headers) => {
      // Xóa Content-Type để axios tự động thêm boundary
      delete headers.common['Content-Type'];
      return data;
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};
export {
  handleLoginApi,
  doGetAccountService,
  registerService,
  sendCodeService,
  resetPasswordService,
  changePasswordService,
  updateAvatarService
};
