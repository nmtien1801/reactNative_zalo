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
 return customizeAxios.post(`/uploadAvatarProfile`, { phone, avatar });
};

const uploadProfileService = (data) => {
  return customizeAxios.post(`/uploadProfile`, data);
};

const uploadAvatarGroupService = (groupId, avatar) => {
  console.log(groupId, avatar);

  return customizeAxios.post(`/uploadAvatarGroup`, { groupId, avatar });
};

export {
  uploadAvatarService,
  uploadAvatarProfileService,
  uploadProfileService,
  uploadAvatarGroupService,
};
