import customizeAxios from "../component/customizeAxios";
import { Platform } from "react-native";

const uploadAvatarService = (formData) => {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return customizeAxios.post(`/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Đảm bảo gửi đúng kiểu Content-Type
      },
    });
  } else {
    return customizeAxios.post(`/upload`, formData);
  }
};

const uploadAvatarProfileService = (phone, avatar) => {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return customizeAxios.post(
      `/uploadAvatarProfile`,
      { phone, avatar },
      {
        headers: {
          "Content-Type": "multipart/form-data", // Đảm bảo gửi đúng kiểu Content-Type
        },
      }
    );
  } else {
    return customizeAxios.post(`/uploadAvatarProfile`, { phone, avatar });
  }
};

const uploadProfileService = (data) => {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return customizeAxios.post(`/uploadProfile`, data, {
      headers: {
        "Content-Type": "multipart/form-data", // Đảm bảo gửi đúng kiểu Content-Type
      },
    });
  } else {
    return customizeAxios.post(`/uploadProfile`, data);
  }
};

export {
  uploadAvatarService,
  uploadAvatarProfileService,
  uploadProfileService,
};
