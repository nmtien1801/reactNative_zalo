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

import io from "socket.io-client";

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
        };
      });

      setConversations(_conversations);
    }
  }, [conversationRedux]);

  // connect docket -> cmd(IPv4 Address): ipconfig
  const IPv4 = "192.168.1.10"; // Địa chỉ IP của máy chủ Socket.IO
  useEffect(() => {
    const socket = io.connect(`http://${IPv4}:8080`);

    socketRef.current = socket;
    socket.on("connect", () => setIsConnect(true));
    socket.off("disconnect", () => setIsConnect(false));
  }, []);

  // action socket
  useEffect(() => {
    socketRef.current.emit("register", user._id);

    socketRef.current.on("user-list", (usersList) => {
      setOnlineUsers(usersList); // Lưu danh sách user online
    });

    return () => socketRef.current.disconnect();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <SearchHeader
        option="chatTab"
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
              source={item.avatar}
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
              <Text style={{ color: "gray" }}>{item.time}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default ChatTab;
