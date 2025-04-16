import customizeAxios from "../component/customizeAxios";

const loadMessagesService = (sender, receiver, type) => {
  return customizeAxios.get(
    `/messages/${sender}/${receiver}/${type}`
  );
};


const getConversationsService = (sender) => {
  return customizeAxios.get(
    `/getConversations/${sender}`
  );
};

const createConversationGroupService = (data) => {
  return customizeAxios.post(
    `/createConversationGroup`, data);
}

const recallMessageService = (id) => {
  return customizeAxios.put(`/messages/recall/${id}`);
};

const deleteMessageForMeService = (id, userId) => {
  return customizeAxios.put(`/messages/deleteForMe/${id}`, { userId });
};

export { loadMessagesService, getConversationsService, createConversationGroupService, recallMessageService, deleteMessageForMeService };
