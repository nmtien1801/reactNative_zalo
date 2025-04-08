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
export {
  handleLoginApi,
  doGetAccountService,
  registerService,
};
