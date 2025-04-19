import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import {
  acceptFriendRequestService,
  getFriendRequestsService,
  rejectFriendRequestService,
} from "../../service/friendRequestService";

const FriendRequest = ({socketRef}) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const userInfo = useSelector((state) => state.auth.userInfo);
  const userId = userInfo ? userInfo.id : null;

  const fetchFriendRequests = async () => {
    const response = await getFriendRequestsService();
    console.log("res  ", response);

    setFriendRequests(response.DT);

    // action socket
    // add friend
    // socketRef.current.on("RES_ADD_FRIEND", async () => {
    //   const response = await getFriendRequestsService();
    //   setFriendRequests(response.DT);
    // });
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequestService(requestId);
      fetchFriendRequests();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFriendRequestService(requestId);
      fetchFriendRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.username}</Text>
        <Text style={styles.date}>{item.sent_at}</Text>
        <Text style={styles.message}>{item.content}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleRejectRequest(item._id)}
          >
            <Text style={styles.rejectText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item._id)}
          >
            <Text style={styles.acceptText}>Đồng ý</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Lời mời đã nhận ({friendRequests.length})
      </Text>
      <FlatList
        data={friendRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  date: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },
  message: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#eee",
  },
  acceptButton: {
    backgroundColor: "#007bff",
  },
  rejectText: {
    color: "#333",
  },
  acceptText: {
    color: "#fff",
  },
});

export default FriendRequest;
