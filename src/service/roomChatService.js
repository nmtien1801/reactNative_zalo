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


// Thêm thành viên vào nhóm
const addMembersToRoomChatService = async (roomId, members) => {
  const response = await customizeAxios.post(`/roomChat/${roomId}/members`, {
    members,
  });
  return response;
};

export {
  getRoomChatByPhoneService,
  getRoomChatMembersService,
  getAllMemberGroupService,
  getMemberByPhoneService,
  addMembersToRoomChatService,
};
