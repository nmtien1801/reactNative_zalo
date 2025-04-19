import customizeAxios from "../component/customizeAxios";

const getRoomChatByPhoneService = (phone) => {
    return customizeAxios.get(
        `/roomChat/${phone}`
    );
};


export { getRoomChatByPhoneService };
