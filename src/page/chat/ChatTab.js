import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import SearchHeader from "../../component/Header";
import { getConversations } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";

import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = height * 0.1;
const AVATAR_SIZE = ITEM_HEIGHT * 0.6;

const ChatTab = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [onlineUsers, setOnlineUsers] = useState([]);

  const user = useSelector((state) => state.auth.user);
  const conversationRedux = useSelector((state) => state.chat.conversations);
  const socketRef = route.params.socketRef;

  const [conversations, setConversations] = useState([
    {
      _id: 1,
      username: "Cloud",
      message: "[Thông báo] Giới thiệu về Trường Kha...",
      time: "26/07/24",
      avatar: require("../../../assets/man.png"),
      type: 3,
    },
  ]);

  const convertTime = (time) => {
    const now = Date.now();
    const past = Number(time);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days === 1) return "Hôm qua";

    const date = new Date(past);
    return date.toLocaleDateString("vi-VN");
  };

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
      setOnlineUsers(usersList); // Lưu danh sách user online
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

    // create group
    socketRef.current.on("RES_CREATE_GROUP", (data) => {
      dispatch(getConversations(user._id));
    });

    // Dissolve Group
    socketRef.current.on("RES_DISSOLVE_GROUP", (data) => {
      dispatch(getConversations(user._id));
      navigation.navigate('MainTabs', {
        socketRef
      });
    });

    // add member group
    socketRef.current.on("RES_ADD_GROUP", (data) => {
      dispatch(getConversations(user._id));
    });

    // update avatar
    socketRef.current.on("RES_UPDATE_AVATAR", (data) => {
      dispatch(getConversations(user._id));
    });

    // update deputy
    socketRef.current.on("RES_UPDATE_DEPUTY", (data) => { 
      dispatch(getConversations(user._id));
    });

    // transfer leader
    socketRef.current.on("RES_TRANS_LEADER", (data) => {
      dispatch(getConversations(user._id));
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <SearchHeader
        option={"chatTab"}
        socketRef={socketRef}
        onlineUsers={onlineUsers}
      />
      {/* Chat List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              backgroundColor: "white",
              marginBottom: 2,
              height: ITEM_HEIGHT,
            }}
            onPress={() =>
              navigation.navigate("InboxScreen", {
                item,
                socketRef,
                onlineUsers,
                conversations,
              })
            }
          >
            <Image
              source={{ uri: item.avatar }}
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                marginRight: 15,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {item.username}
              </Text>
              <Text style={{ color: "gray" }}>{item.message}</Text>
            </View>
            {item.time ? (
              <Text style={{ color: "gray" }}>{convertTime(item.time)}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default ChatTab;
