import customizeAxios from "../component/customizeAxios";

const uploadAvatarService = (formData) => {
  console.log("www: ", formData);

  return customizeAxios.post(`/upload`, formData);
};

const uploadAvatarProfileService = (phone, avatar) => {
  console.log(phone, avatar);

  return customizeAxios.post(`/uploadAvatarProfile`, {phone, avatar} );
};

export { uploadAvatarService, uploadAvatarProfileService };
