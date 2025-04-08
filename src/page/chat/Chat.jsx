import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { Search, UserPlus, Users } from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
// import io from "socket.io-client";

import ChatPerson from "./ChatPerson";
import ChatGroup from "./ChatGroup";
import ChatCloud from "./ChatCloud";

import { loadMessages, getConversations } from "../../redux/chatSlice";

export default function Chat() {
  const dispatch = useDispatch();
  const socketRef = useRef();

  const [allMsg, setAllMsg] = useState([]);
  const user = useSelector((state) => state.auth.userInfo);
  const conversationRedux = useSelector((state) => state.chat.conversations);
  const [isConnect, setIsConnect] = useState(false);
  const [selected, setSelected] = useState(0);
  const [roomData, setRoomData] = useState({ room: null, receiver: null });
  const [typeChatRoom, setTypeChatRoom] = useState("cloud");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [conversations, setConversations] = useState([
    {
      _id: 1,
      username: "Cloud",
      message: "[Thông báo] Giới thiệu về Trường Kha...",
      time: "26/07/24",
      avatar: "/cloud.jpg",
      type: 3,
    },
  ]);

  // useEffect(() => {
  //   const socket = io.connect(process.env.EXPO_PUBLIC_BACKEND_URL);
  //   socketRef.current = socket;

  //   socket.on("connect", () => setIsConnect(true));
  //   socket.on("disconnect", () => setIsConnect(false));

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    if (isConnect) {
      socketRef.current.emit("register", user._id);

      socketRef.current.on("user-list", (usersList) => {
        setOnlineUsers(usersList);
      });

      socketRef.current.on("RECEIVED_MSG", (data) => {
        setAllMsg((prev) => [...prev, data]);
      });

      socketRef.current.on("DELETED_MSG", (data) => {
        setAllMsg((prev) => prev.filter((msg) => msg._id !== data.msg._id));
      });
    }
  }, [isConnect]);

  const handleSendMsg = (msg) => {
    if (socketRef.current.connected) {
      const sender = { ...user, socketId: socketRef.current.id };
      const receiverOnline = onlineUsers.find(
        (u) => u.userId === roomData.receiver?._id
      );

      const data = {
        msg,
        receiver: {
          ...roomData.receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
        sender,
      };

      socketRef.current.emit("SEND_MSG", data);
    }
  };

  const handleTypeChat = (type, receiver) => {
    console.log("Type:", type, "Receiver:", receiver);
    let receiverOnline;
    if (type === 1) {
      setTypeChatRoom("single");
      handleLoadMessages(receiver._id, receiver.type);
      receiverOnline = onlineUsers.find((u) => u.userId === receiver._id);
      setRoomData({
        room: "single",
        receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    } else if (type === 2) {
      setTypeChatRoom("group");
      handleLoadMessages(receiver._id, receiver.type);
      receiverOnline = onlineUsers.find((u) =>
        receiver.members.includes(u.userId)
      );
      setRoomData({
        room: "group",
        receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    } else {
      setTypeChatRoom("cloud");
      handleLoadMessages(receiver._id, receiver.type);
      setRoomData({ room: "cloud", receiver: user });
    }
  };

  const handleLoadMessages = async (receiverId, type) => {
    const res = await dispatch(
      loadMessages({ sender: user._id, receiver: receiverId, type })
    );
    if (res.payload.EC === 0) {
      setAllMsg(res.payload.DT);
    }
  };

  useEffect(() => {
    dispatch(getConversations(user._id));
  }, []);

  useEffect(() => {
    console.log("conversationRedux:", conversationRedux);
    if (conversationRedux) {
      const _conversations = conversationRedux.map((item) => ({
        _id: item.receiver._id,
        username: item.receiver.username,
        message: item.message,
        time: item.time,
        avatar: item.avatar,
        type: item.type,
        phone: item.receiver.phone,
        members: item.receiver.members,
      }));
      setConversations(_conversations);
    }
  }, [conversationRedux]);
  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.iconBtn}>
            <Search size={18} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <UserPlus size={18} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Users size={18} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {["Tất cả", "Chưa đọc"].map((label, index) => (
            <TouchableOpacity key={index} onPress={() => setSelected(index)}>
              <Text
                style={[
                  styles.tabItem,
                  selected === index && styles.tabItemSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.chatList}>
          {conversations.map((chat) => (
            <TouchableOpacity
              key={chat._id}
              style={styles.chatItem}
              onPress={() => handleTypeChat(chat.type, chat)}
            >
              <Image
                source={{ uri: chat.avatar || "https://via.placeholder.com/48" }}
                style={styles.avatar}
              />
              <View style={styles.chatText}>
                <Text numberOfLines={1} style={styles.username}>
                  {chat.username}
                </Text>
                <Text numberOfLines={1} style={styles.lastMsg}>
                  {chat.message}
                </Text>
              </View>
              <Text style={styles.timeText}>{chat.time}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main chat content */}

      <View style={styles.chatContent}>
        {console.log("Room Data:", roomData, "Type Chat Room:", typeChatRoom)}
        {roomData.room ? (
          typeChatRoom === "group" ? (
            <ChatGroup
              roomData={roomData}
              handleSendMsg={handleSendMsg}
              allMsg={allMsg}
              user={user}
              socketRef={socketRef}
            />
          ) : typeChatRoom === "single" ? (
            <ChatPerson
              roomData={roomData}
              handleSendMsg={handleSendMsg}
              allMsg={allMsg}
              user={user}
              socketRef={socketRef}
            />
          ) : (
            <ChatCloud
              roomData={roomData}
              handleSendMsg={handleSendMsg}
              allMsg={allMsg}
              user={user}
            />
          )
        ) : (
          <Text style={styles.welcomeText}>Chào mừng bạn đến với chúng tôi</Text>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", height: "100%" },
  sidebar: { width: 280, backgroundColor: "#fff", borderRightWidth: 1, borderColor: "#ccc" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 6,
  },
  input: {
    flex: 1,
    height: 36,
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    borderRadius: 4,
    color: "#000",
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  tabItem: {
    fontSize: 14,
    color: "#000",
  },
  tabItemSelected: {
    color: "#0d6efd",
    textDecorationLine: "underline",
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatText: {
    flex: 1,
    marginLeft: 8,
  },
  username: {
    fontWeight: "bold",
    color: "#000",
  },
  lastMsg: {
    color: "#888",
    fontSize: 12,
  },
  timeText: {
    fontSize: 11,
    color: "#999",
    marginLeft: 4,
  },
  chatContent: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  welcomeText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
});
