import customizeAxios from "../component/customizeAxios";

const deleteFriendService = async (friendId) => {
  const response = await customizeAxios.post(`/deleteFriend/${friendId}`);
  return response;
};

const checkFriendShipExistsService = async (friendId) => {
  try {
    const response = await customizeAxios.get(`/checkFriendShip/${friendId}`);
    return response;
  } catch (err) {
    console.error("Service error:", err);
    return null;
  }
};

const getFriendListService = async () => {
  try {
    const response = await customizeAxios.get(`/friends`);
    return response;
  } catch (err) {
    console.error("Service error:", err);
    return null;
  }
};
const getAllFriendsService = async () => {
  const response = await customizeAxios.get(`/getAllFriends`);
  return response;
};

export {
  deleteFriendService,
  checkFriendShipExistsService,
  getFriendListService,
  getAllFriendsService,
};
