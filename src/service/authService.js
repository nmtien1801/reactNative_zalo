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
<<<<<<< HEAD
}
=======
};
>>>>>>> efd88a4c37eb2a37cfec15487b23592e41a68cd4

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

<<<<<<< HEAD
=======
const verifyEmailService = (email) => {
  return customizeAxios.post("/verifyEmail", { email });
};

const logoutUserService = () => {
  return customizeAxios.post("/logout");
};

>>>>>>> efd88a4c37eb2a37cfec15487b23592e41a68cd4
export {
  handleLoginApi,
  doGetAccountService,
  registerService,
  sendCodeService,
  resetPasswordService,
<<<<<<< HEAD
  changePasswordService
=======
  changePasswordService,
  verifyEmailService,
  logoutUserService
>>>>>>> efd88a4c37eb2a37cfec15487b23592e41a68cd4
};
