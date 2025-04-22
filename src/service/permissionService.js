import customizeAxios from "../component/customizeAxios";

const getAllPermissionService = async () => {
  const response = await customizeAxios.get(`/getAllPermission`);
  return response;
};

const updateDeputyService = async (members) => {
  const response = await customizeAxios.post(`/updateDeputy`, { members });
  return response;
};

export { getAllPermissionService, updateDeputyService };
