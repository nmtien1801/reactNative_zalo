import customizeAxios from "../component/customizeAxios";

const deleteFriendService = async (friendId) => {
    const response = await customizeAxios.post(`/deleteFriend/${friendId}`);
    return response;
}

const checkFriendShipExistsService = async (friendId) => {
    const response = await customizeAxios.get(`/checkFriendShip/${friendId}`);
    return response;
}

const getAllFriendsService = async () => {
    const response = await customizeAxios.get(`/getAllFriends`);
    return response;
}


export {
    deleteFriendService,
    checkFriendShipExistsService,
    getAllFriendsService,

};