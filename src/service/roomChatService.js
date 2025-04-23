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

const getRoomChatMembersService = async (roomId) => {
  try {
    const response = await customizeAxios.get(`/roomChat/${roomId}/members`);
    return response;
  } catch (error) {
    console.error("Error fetching room chat members:", error);
    throw error;
  }
};

// Thêm service mới để gọi API getRoomChatByUsername
const getRoomChatByUsernameService = (username) => {
  return customizeAxios.get(
      `/api/roomChat/${username}`
  );
};

export {
  getRoomChatByPhoneService,
  getRoomChatMembersService,
  getAllMemberGroupService,
  getMemberByPhoneService,
  getRoomChatByUsernameService
};
