import customizeAxios from "../component/customizeAxios";

const loadMessagesService = (sender, receiver, type) => {
  return customizeAxios.get(`/messages/${sender}/${receiver}/${type}`);
};

const getConversationsService = (sender) => {
  return customizeAxios.get(`/getConversations/${sender}`);
};

const recallMessageService = (id) => {
  return customizeAxios.put(`/messages/recall/${id}`);
};

const deleteMessageForMeService = (id, member) => {
  return customizeAxios.put(`/messages/deleteForMe/${id}`, member);
};

const updatePermissionService = (groupId, newPermission) => {
  return customizeAxios.post(`/updatePermission`, {
    groupId,
    newPermission,
  });
};

const removeMemberFromGroupService = async (groupId, memberId) => {
  try {
    const response = await customizeAxios.delete(
      `/roomChat/${groupId}/members/${memberId}`
    );
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API xóa thành viên:", error);
    return { EC: -1, EM: "Lỗi khi gọi API", DT: null }; // Trả về định dạng mặc định khi lỗi
  }
};

const createConversationGroupService = (nameGroup, avatarGroup, members) => {
  return customizeAxios.post(`/createConversationGroup`, {
    nameGroup,
    avatarGroup,
    members,
  });
};

// Service để giải tán nhóm (chỉ leader)
const dissolveGroupService = async (groupId) => {
  return customizeAxios.delete(`/group/${groupId}/dissolve`);
};

const chatGPTService = async (message) => {
  return customizeAxios.post(`/chatGPT`, {
    message,
  });
};

export {
  loadMessagesService,
  getConversationsService,
  createConversationGroupService,
  recallMessageService,
  deleteMessageForMeService,
  updatePermissionService,
  removeMemberFromGroupService,
  dissolveGroupService,
  chatGPTService,
};
