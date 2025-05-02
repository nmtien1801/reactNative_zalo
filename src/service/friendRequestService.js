import customizeAxios from "../component/customizeAxios";

const getFriendRequestsService = async () => {
    const response = await customizeAxios.get(`/getFriendRequests`);
    return response;
}

const acceptFriendRequestService = async (requestId) => {
    const response = await customizeAxios.post(`/acceptFriendRequest/${requestId}`);
    return response;
}

const sendRequestFriendService = async (data) => {
    const response = await customizeAxios.post(`/sendRequestFriend`, data);
    return response;
}

const rejectFriendRequestService = async (requestId) => {
    const response = await customizeAxios.post(`/rejectFriendRequest/${requestId}`);
    return response;
}

const getFriendRequestByFromUserAndToUserService = async (fromUserId) => {
    const response = await customizeAxios.get(`/getFriendRequestByFromUserAndToUser/${fromUserId}`);
    return response;
}

const cancelFriendRequestService = async (requestId) => {
    const response = await customizeAxios.post(`/cancelFriendRequest/${requestId}`);
    return response;
}


export {
    getFriendRequestsService,
    acceptFriendRequestService,
    sendRequestFriendService,
    rejectFriendRequestService,
    getFriendRequestByFromUserAndToUserService,
    cancelFriendRequestService
};
    