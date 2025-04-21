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

const createConversationGroupService = (nameGroup, avatarGroup, members) => {
  return customizeAxios.post(`/createConversationGroup`, {
    nameGroup,
    avatarGroup,
    members,
  });
};

export {
  loadMessagesService,
  getConversationsService,
  createConversationGroupService,
  recallMessageService,
  deleteMessageForMeService,
};
