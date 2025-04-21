import customizeAxios from "../component/customizeAxios";

const getAllPermissionService = async () => {
  const response = await customizeAxios.get(`/getAllPermission`);
  return response;
};

export { getAllPermissionService };
