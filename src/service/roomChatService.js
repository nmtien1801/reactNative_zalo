import customizeAxios from "../component/customizeAxios";

const getRoomChatByPhoneService = (phone) => {
  return customizeAxios.get(`/roomChat/${phone}`);
};

const getAllMemberGroupService = (groupId) => {
  return customizeAxios.get(`/getAllMemberGroup/${groupId}`);
};

const getMemberByPhoneService = (phone, groupId) => {
  return customizeAxios.post(`/getMemberByPhone/${phone}`, { groupId });
};

export {
  getRoomChatByPhoneService,
  getAllMemberGroupService,
  getMemberByPhoneService,
};
