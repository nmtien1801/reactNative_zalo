import customizeAxios from "../component/customizeAxios";

const loadMessagesService = (sender, receiver, type, page = 1, limit = 20) => {
  return customizeAxios.get(`/messages/${sender}/${receiver}/${type}?page=${page}&limit=${limit}`);
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

const sendReactionService = (messageId, userId, emoji) => {
  return customizeAxios.post(`/messages/handleReaction`, {
    messageId,
    userId,
    emoji,
  });
};

const getReactionMessageService = (messageId) => {
  return customizeAxios.get(`/messages/${messageId}/reactions/`);
};

// Đánh dấu một tin nhắn là đã đọc
const markMessageAsReadService = (messageId, userId) => {
  return customizeAxios.post(`/mark-read/${messageId}`, { userId });
};

// Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc
const markAllMessagesAsReadService = (conversationId, userId) => {
  return customizeAxios.post(`/mark-all-read/${conversationId}`, { userId });
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
  sendReactionService,
  getReactionMessageService,
  markMessageAsReadService,
  markAllMessagesAsReadService
};
