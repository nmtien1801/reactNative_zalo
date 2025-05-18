import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import SearchHeader from "../../component/Header";
import { getConversations } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

const TopTab = createMaterialTopTabNavigator();

export default function ContactsTabs({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const conversationRedux = useSelector((state) => state.chat.conversations);
  const user = useSelector((state) => state.auth.user);
  const socketRef = route.params.socketRef;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    dispatch(getConversations(user._id));
  }, []);

  useEffect(() => {
    if (conversationRedux) {
      let _conversations = conversationRedux.map((item) => {
        return {
          _id: item.receiver._id,
          username: item.receiver.username,
          message: item.message,
          time: item.time,
          avatar: item.avatar,
          type: item.type,
          phone: item.receiver.phone,
          members: item.members,
          role: item.role,
          permission: item.receiver.permission,
        };
      });

      setConversations(_conversations);
    }
  }, [conversationRedux]);

  // action socket
  useEffect(() => {
    socketRef.current.on("user-list", (usersList) => {
      setOnlineUsers(usersList);
    });

    // accept friend
    socketRef.current.on("RES_ACCEPT_FRIEND", async () => {
      dispatch(getConversations(user._id));
    });

    // delete friend
    socketRef.current.on("RES_DELETE_FRIEND", async () => {
      dispatch(getConversations(user._id));
    });

    // remove member group
    socketRef.current.on("RES_REMOVE_MEMBER", async () => {
      dispatch(getConversations(user._id));
    });

    // add member group
    socketRef.current.on("RES_ADD_GROUP", (data) => {
      dispatch(getConversations(user._id));
    });
  }, []);

  const handleFriendClick = (item) => {
    navigation.navigate("InboxScreen", {
      item,
      socketRef,
      onlineUsers,
      conversations,
    });
  };

  const FriendItem = ({ friend }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
      }}
      onPress={() => handleFriendClick(friend)}
    >
      <Image
        source={friend.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <Text style={{ flex: 1, fontSize: 16 }}>{friend.username}</Text>
    </TouchableOpacity>
  );

  const FriendsScreen = () => {
    let friends = conversations.filter((friend) => friend.type === 1);

    return (
      <FlatList
        style={{ flex: 1, backgroundColor: "#fff" }}
        ListHeaderComponent={() => (
          <>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                padding: 10,
                alignItems: "center",
                borderBottomWidth: 1,
                borderColor: "#ddd",
              }}
              onPress={() =>
                navigation.navigate("FriendRequest", { socketRef })
              }
            >
              <Icon
                name="person-add-outline"
                size={24}
                color="#2196F3"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16 }}>Lời mời kết bạn (1)</Text>
            </TouchableOpacity>

            <Text style={{ margin: 10, fontSize: 18, fontWeight: "bold" }}>
              Danh sách bạn bè
            </Text>
          </>
        )}
        data={friends}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <FriendItem friend={item} />}
      />
    );
  };

  const GroupItem = ({ group }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
      }}
      onPress={() => handleFriendClick(group)}
    >
      <Image
        source={group.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {group.username}
        </Text>
        <Text style={{ fontSize: 14, color: "gray" }}>
          {group.members.length} thành viên
        </Text>
      </View>
    </TouchableOpacity>
  );

  const GroupsScreen = () => {
    let friends = conversations.filter((friend) => friend.type === 2);

    return (
      <FlatList
        ListHeaderComponent={() => (
          <>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                padding: 10,
                alignItems: "center",
                borderBottomWidth: 1,
                borderColor: "#ddd",
              }}
              onPress={() =>
                navigation.navigate("FriendRequest", { socketRef })
              }
            >
              <Icon
                name="person-add-outline"
                size={24}
                color="#2196F3"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16 }}>Lời mời tham gia nhóm (1)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                padding: 10,
                alignItems: "center",
                borderBottomWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Icon
                name="person-add-outline"
                size={24}
                color="#2196F3"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16 }}>Tạo nhóm mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                padding: 10,
                alignItems: "center",
                borderColor: "#ddd",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ margin: 10, fontSize: 18, fontWeight: "bold" }}>
                Nhóm đang tham gia(4)
              </Text>
              <TouchableOpacity>
                <Icon name="funnel-outline" size={24} color="#2196F3" />
              </TouchableOpacity>
            </TouchableOpacity>
          </>
        )}
        style={{ flex: 1, backgroundColor: "#fff" }}
        data={friends}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <GroupItem group={item} />}
      />
    );
  };

  return (
    <View>
      <SearchHeader option={"contact"} />

      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#2196F3",
          tabBarInactiveTintColor: "gray",
          tabBarIndicatorStyle: { backgroundColor: "#2196F3" },
        }}
      >
        <TopTab.Screen name="Bạn bè" component={FriendsScreen} />
        <TopTab.Screen name="Nhóm" component={GroupsScreen} />
      </TopTab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({});
