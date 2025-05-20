import customizeAxios from "../component/customizeAxios";

const getAllPermissionService = async () => {
  const response = await customizeAxios.get(`/getAllPermission`);
  return response;
};

const updateDeputyService = async (members) => {
  const response = await customizeAxios.post(`/updateDeputy`, { members });
  return response;
};

const transLeaderService = async (groupId, newLeaderId) => {
  const response = await customizeAxios.post(`/transLeader`, {
    groupId,
    newLeaderId,
  });
  return response;
};

export { getAllPermissionService, updateDeputyService, transLeaderService };
