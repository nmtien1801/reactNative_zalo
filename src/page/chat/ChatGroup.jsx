import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Feather"; // Feather tương đương lucide
import { useSelector } from "react-redux";

export default function ChatGroup({ allMsg, handleSendMsg }) {
  const user = useSelector((state) => state.auth.userInfo);
  const [showSidebar, setShowSidebar] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: "media", title: "Ảnh/Video", icon: "image" },
    { id: "files", title: "File", icon: "file" },
    { id: "links", title: "Link", icon: "link" },
  ];

  useEffect(() => {
    if (allMsg) {
      setMessages(allMsg);
    }
  }, [allMsg]);

  const sendMessage = () => {
    handleSendMsg(message);
    setMessage("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsOpen(true)}>
          <Image
            source={{ uri: "https://placehold.co/40x40" }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <GroupInfoModal visible={isOpen} onClose={() => setIsOpen(false)} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Võ Trường Khang</Text>
          <Text style={styles.headerStatus}>Hoạt động 2 giờ trước</Text>
        </View>
        <View style={styles.headerIcons}>
          <Icon name="users" size={20} style={styles.iconBtn} />
          <Icon name="search" size={20} style={styles.iconBtn} />
          <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)}>
            <Icon name="layout" size={20} color="#0d6efd" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Content */}
      <ScrollView style={styles.messages}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageWrapper,
              msg.sender._id === user._id && styles.messageRight,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.sender._id === user._id
                  ? styles.messageSelf
                  : styles.messageOther,
              ]}
            >
              <Text>{msg.msg}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputBar}>
        <Icon name="smile" size={22} style={styles.iconBtn} />
        <Icon name="paperclip" size={22} style={styles.iconBtn} />
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Icon name="send" size={22} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      {showSidebar && (
        <ScrollView style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Thông tin hội thoại</Text>
          </View>

          <View style={styles.profileSection}>
            <Image
              source={{ uri: "https://placehold.co/80x80" }}
              style={styles.groupImage}
            />
            <Text style={styles.groupName}>Công Nghệ Mới</Text>
            <View style={styles.actionRow}>
              {["bell-off", "map-pin", "user-plus", "settings"].map((icon) => (
                <TouchableOpacity key={icon} style={styles.iconGroup}>
                  <Icon name={icon} size={22} />
                  <Text style={styles.smallText}>...</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sections */}
          {sections.map((s) => (
            <View key={s.id} style={styles.section}>
              <Icon name={s.icon} size={20} />
              <Text style={styles.sectionTitle}>{s.title}</Text>
            </View>
          ))}

          {/* Security */}
          <View style={styles.section}>
            <Icon name="clock" size={18} />
            <Text style={styles.sectionTitle}>Tin nhắn tự xóa</Text>
          </View>
          <View style={styles.sectionRow}>
            <Icon name="eye-off" size={18} />
            <Text>Ẩn trò chuyện</Text>
            <Switch />
          </View>
          <View style={styles.dangerOption}>
            <Icon name="alert-triangle" color="red" />
            <Text style={styles.dangerText}>Báo xấu</Text>
          </View>
          <View style={styles.dangerOption}>
            <Icon name="trash-2" color="red" />
            <Text style={styles.dangerText}>Xóa lịch sử</Text>
          </View>
          <View style={styles.dangerOption}>
            <Icon name="log-out" color="red" />
            <Text style={styles.dangerText}>Rời nhóm</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  headerInfo: { flex: 1, marginLeft: 10 },
  headerName: { fontWeight: "600" },
  headerStatus: { fontSize: 12, color: "#888" },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconBtn: { marginHorizontal: 6 },
  messages: { flex: 1, paddingHorizontal: 10, paddingBottom: 5 },
  messageWrapper: { flexDirection: "row", marginVertical: 4 },
  messageRight: { justifyContent: "flex-end" },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
    maxWidth: "80%",
  },
  messageSelf: {
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
  },
  messageOther: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputBar: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    marginHorizontal: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    height: 40,
  },
  sidebar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  sidebarHeader: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  sidebarTitle: { textAlign: "center", fontWeight: "bold" },
  profileSection: { alignItems: "center", paddingVertical: 10 },
  groupImage: { width: 80, height: 80, borderRadius: 40 },
  groupName: { fontWeight: "bold", marginVertical: 8 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  iconGroup: { alignItems: "center" },
  smallText: { fontSize: 12 },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 8,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  sectionTitle: { marginLeft: 10 },
  dangerOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 8,
  },
  dangerText: { color: "red" },
});
