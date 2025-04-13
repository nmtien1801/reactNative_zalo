import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { loadMessages } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";

const InboxScreen = ({ route }) => {
  let receiver = route.params?.item; // click conversation
  let socketRef = route.params?.socketRef;
  let onlineUsers = route.params?.onlineUsers
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const [input, setInput] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [roomData, setRoomData] = useState({
    room: null,
    receiver: null,
  });
  const [allMsg, setAllMsg] = useState([]);

  const sections = [
    {
      id: "members",
      title: "Thành viên",
      icon: "users",
      content: null,
      empty: "Chưa có thành viên nào.",
    },
    {
      id: "files",
      title: "Tệp đã chia sẻ",
      icon: "file-text",
      content: null,
      empty: "Không có tệp nào.",
    },
    {
      id: "links",
      title: "Liên kết đã chia sẻ",
      icon: "link",
      content: null,
      empty: "Không có liên kết nào.",
    },
  ];

  // handleTypeChat
  useEffect(() => {
    let receiverOnline; // lấy socketId của người nhận từ danh sách onlineUsers
    if (receiver.type === 1) {
      handleLoadMessages(receiver._id, receiver.type);
      receiverOnline = onlineUsers.find((u) => u.userId === receiver._id);

      setRoomData({
        ...roomData,
        room: "single",
        receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    } else if (receiver.type === 2) {
      handleLoadMessages(receiver._id, receiver.type);

      receiverOnline = onlineUsers.find((u) =>
        receiver.members.includes(u.userId)
      );

      setRoomData({
        ...roomData,
        room: "group",
        receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    } else {
      handleLoadMessages(receiver._id, receiver.type);
      
      receiverOnline = onlineUsers.find((u) => u.userId === receiver._id);
      setRoomData({
        ...roomData,
        room: "cloud",
        receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    }
  }, []);

  const handleLoadMessages = async (receiver, type) => {
    const res = await dispatch(
      loadMessages({ sender: user._id, receiver: receiver, type: type })
    );

    if (res.payload.EC === 0) {
      setAllMsg(res.payload.DT);
    }
  };

  const sendMessage = () => {
    if (socketRef.current) {
      let sender = { ...user };
      sender.socketId = socketRef.current.id;

      // Lấy socketId của receiver từ danh sách onlineUsers
      const receiverOnline = onlineUsers.find(
        (u) => u.userId === roomData.receiver?._id
      );

      const data = {
        msg: input,
        receiver: {
          ...roomData.receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
        sender,
      };
      console.log("data: ", data);

      socketRef.current.emit("SEND_MSG", data);
    }

    setInput("");
  };

  const convertTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  // action socket
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("RECEIVED_MSG", (data) => {
        console.log("form another users ", data);
        
        setAllMsg((prevState) => [...prevState, data]);
      });

      socketRef.current.on("DELETED_MSG", (data) => {
        setAllMsg((prevState) =>
          prevState.filter((item) => item._id != data.msg._id)
        );
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("MainTabs")}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerText}>{receiver.username}</Text>
            <Text style={styles.activeText}>
              {receiver.type === 3
                ? "Lưu và đồng bộ dữ liệu giữa các thiết bị"
                : "Hoạt động 18 phút trước"}
            </Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="call" size={23} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="videocam" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("PersonOption", { receiver, socketRef, onlineUsers })}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={allMsg}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => {
              setSelectedMessage(item);
              setModalVisible(true);
            }}
          >
            <View
              style={[
                styles.message,
                item.sender._id === user._id
                  ? styles.userMessage
                  : styles.friendMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.msg || ""}</Text>
              <Text style={styles.messageTime}>
                {convertTime(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100); // thử 100ms hoặc tăng lên 200ms nếu cần
        }}
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <FontAwesome5 name="sticky-note" size={24} color="black" />
          <FontAwesome5
            name="smile"
            size={12}
            color="black"
            style={{ marginLeft: -19 }}
          />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="grey"
            value={input}
            onChangeText={(text) => setInput(text)}
          />
        </View>
        {!input.trim() ? (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={styles.iconWrapper}>
              <FontAwesome5 name="ellipsis-h" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconWrapper}>
              <FontAwesome5 name="microphone" size={22} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconWrapper}>
              <FontAwesome5 name="image" size={22} color="gray" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.iconWrapper} onPress={sendMessage}>
            <FontAwesome5 name="paper-plane" size={22} color="blue" />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {/* Tin nhắn được chọn */}
            {selectedMessage && (
              <View style={styles.highlightedMessage}>
                <Text style={styles.messageText}>{selectedMessage.msg}</Text>
                <Text style={styles.messageTime}>
                  {convertTime(selectedMessage.createdAt)}
                </Text>
              </View>
            )}

            {/* Biểu tượng cảm xúc */}
            <View style={styles.reactionBar}>
              {["heart", "thumbs-up", "laugh", "sad-cry", "angry"].map(
                (icon, index) => (
                  <TouchableOpacity key={index} style={styles.emojiButton}>
                    <FontAwesome5 name={icon} size={24} color="red" />
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Menu hành động */}
            <View style={styles.menuOptions}>
              {[
                { name: "Reply", icon: "reply" },
                { name: "Forward", icon: "share" },
                { name: "Save", icon: "save" },
                { name: "Recall", icon: "undo" },
                { name: "Copy", icon: "copy" },
                { name: "Pin", icon: "map-pin" },
                { name: "Remind", icon: "clock" },
                { name: "Select", icon: "check-square" },
                { name: "Delete", icon: "trash" },
              ].map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem}>
                  <FontAwesome5 name={item.icon} size={25} color="black" />
                  <Text style={styles.menuText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#007bff",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row", // Để chứa cả icon
    paddingHorizontal: 10,
    zIndex: 1000, // Giúp header luôn trên cùng
    elevation: 5, // Cho Android
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  activeText: {
    fontSize: 12,
    color: "white",
  },
  iconButton: {
    padding: 5,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 20,
  },
  messagesContainer: {
    paddingTop: 70,
    paddingBottom: 70,
    paddingLeft: 10,
    paddingRight: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
  },
  friendMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  messageText: {
    color: "black",
  },
  messageTime: {
    fontSize: 10,
    color: "gray",
    textAlign: "right",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    gap: 15,
  },

  inputWrapper: {
    flex: 1,
    marginHorizontal: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "black",
  },

  iconWrapper: {
    paddingHorizontal: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    elevation: 10, // Tạo hiệu ứng nổi
  },
  highlightedMessage: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
  reactionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  emojiButton: {
    padding: 8,
  },
  menuOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  menuItem: {
    alignItems: "center",
    padding: 10,
    width: "30%",
  },
  menuText: {
    color: "black",
    fontSize: 14,
    marginTop: 5,
  },
});

export default InboxScreen;
