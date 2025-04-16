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

export { loadMessagesService, getConversationsService, createConversationGroupService };
