import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome5";

const InboxScreen = () => {
  const [messages, setMessages] = useState([
    { text: "Ông ôn gì chưa chỉ tui với.", time: "19:19", sender: "user" },
    { text: "Tôi cũng như ông thôi", time: "20:19", sender: "friend" },
    { text: "Hỏi ông Khang ý", time: "20:19", sender: "friend" },
    { text: "Chắc chắn 10 điểm", time: "20:19", sender: "friend" },
    { text: "Ông chụp giúp tui cái bài yêu cầu về đồ thị trạng thái với lực.", time: "16:05", sender: "user" },
    { text: "Tối nhờ ông Khang giải hết cái đề thầy gửi", time: "17:25", sender: "friend" },
    { text: "Chứ giờ tôi chưa ôn bài :)))", time: "17:25", sender: "friend" },
    { text: "Oke ông", time: "17:55", sender: "user" },
    { text: "Oke ông", time: "17:55", sender: "user" },
    { text: "Oke ông", time: "17:55", sender: "user" }, 

  ]);
  const [input, setInput] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, time: "Now", sender: "user" }]);
      setInput("");
    }
  };
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ width: "55%" }}>
          <Text style={styles.headerText}>Nguyễn Thế Lực</Text>
          <Text style={styles.activeText}>Hoạt động 18 phút trước</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="call" size={23} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="videocam" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Danh sách tin nhắn */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => {
              setSelectedMessage(item);
              setModalVisible(true);
            }}
          >
            <View style={[styles.message, item.sender === "user" ? styles.userMessage : styles.friendMessage]}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        {/* Icon mặt cười */}
        <TouchableOpacity>
          <Icon name="smile-o" size={24} color="gray" style={styles.icon} />
        </TouchableOpacity>

        {/* Ô nhập tin nhắn */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="gray"
            value={input}
            onChangeText={(text) => setInput(text)}
          />
        </View>

        {/* Ẩn ba icon nếu có chữ */}
        {!input.trim() && (
          <>
            <TouchableOpacity style={styles.iconWrapper}>
              <Icon name="ellipsis-h" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconWrapper}>
              <Icon name="image" size={22} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconWrapper}>
              <Icon name="microphone" size={22} color="gray" />
            </TouchableOpacity>
          </>
        )}

        {/* Icon gửi, chỉ hiển thị khi có chữ */}
        {input.trim() && (
          <TouchableOpacity style={styles.iconWrapper} onPress={sendMessage}>
            <Icon name="paper-plane" size={22} color="blue" />
          </TouchableOpacity>
        )}
      </View>



      {/* Modal cho tin nhắn */}
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
                <Text style={styles.messageText}>{selectedMessage.text}</Text>
                <Text style={styles.messageTime}>{selectedMessage.time}</Text>
              </View>
            )}

            {/* Biểu tượng cảm xúc */}
            <View style={styles.reactionBar}>
              {["heart", "thumbs-up", "laugh", "sad-cry", "angry"].map((icon, index) => (
                <TouchableOpacity key={index} style={styles.emojiButton}>
                  <Icon name={icon} size={24} color="red" />
                </TouchableOpacity>
              ))}
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
                { name: "Delete", icon: "trash" }
              ].map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem}>
                  <Icon name={item.icon} size={25} color="black" />
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
    marginTop: 30
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
    color: "gray"
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
    paddingRight: 10
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
    color: "white",
  },

  iconWrapper: {
    paddingHorizontal: 8,
  },

  icon: {
    marginHorizontal: 8,
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
