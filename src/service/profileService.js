import customizeAxios from "../component/customizeAxios";

const uploadAvatarService = (formData) => {
  return customizeAxios.post(`/upload`, formData);
};

const uploadAvatarProfileService = (phone, avatar) => {
  return customizeAxios.post(`/uploadAvatarProfile`, {phone, avatar} );
};

export { uploadAvatarService, uploadAvatarProfileService };
