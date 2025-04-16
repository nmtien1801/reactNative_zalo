import customizeAxios from "../component/customizeAxios";

const deleteFriendService = async (friendId) => {
    const response = await customizeAxios.post(`/deleteFriend/${friendId}`);
    return response;
}

 const checkFriendShipExistsService = async (friendId) => {
    try {
      const response = await customizeAxios.get(`/checkFriendShip/${friendId}`);
      return response;
    } catch (err) {
      console.error('Service error:', err);
      return null;
    }
  };

export {
    deleteFriendService,
    checkFriendShipExistsService,

};