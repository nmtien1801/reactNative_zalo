import customizeAxios from "../component/customizeAxios";

const getRoomChatByPhoneService = (phone) => {
    return customizeAxios.get(
        `/api/roomChat/${phone}`
    );
};

// Thêm service mới để gọi API getRoomChatByUsername
const getRoomChatByUsernameService = (username) => {
    return customizeAxios.get(
        `/api/roomChat/${username}`
    );
};

export { 
    getRoomChatByPhoneService,
    getRoomChatByUsernameService,
};