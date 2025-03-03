import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet } from "react-native";
import { LogOut, UserPlus, Settings, Image as ImageIcon, File, Link, Shield, Clock, EyeOff, Smile, Paperclip, Send, Edit2, BellOff, Pin, AlertTriangle, Trash2 } from "lucide-react-native";

export default function ChatGroup() {
  const [conversations] = useState([
    { id: 1, name: "Võ Trường Khang", message: "[Thông báo] Giới thiệu về Trường Kha...", time: "26/07/24", avatar: require("../../../assets/favicon.png") },
    { id: 2, name: "Thu", message: "[Thông báo] Giới thiệu thêm Thu", time: "23/07/24", avatar: require("../../../assets/favicon.png") },
    { id: 3, name: "IGH - DHKTPMTB - CT7", message: "Võ Văn Hòa, Dung", time: "20/07/24", avatar: require("../../../assets/favicon.png") },
  ]);

  return (
    <View style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        <Image source={require("../../../assets/favicon.png")} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>Võ Trường Khang</Text>
          <Text style={styles.userStatus}>Hoạt động 2 giờ trước</Text>
        </View>
      </View>
      
      {/* Chat Content */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Image source={item.avatar} style={styles.messageAvatar} />
            <View style={styles.messageTextContainer}>
              <Text style={styles.messageName}>{item.name}</Text>
              <Text style={styles.messageContent}>{item.message}</Text>
            </View>
            <Text style={styles.messageTime}>{item.time}</Text>
          </View>
        )}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton}><Smile size={20} /></TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}><Paperclip size={20} /></TouchableOpacity>
        <TextInput style={styles.textInput} placeholder="Nhập tin nhắn..." />
        <TouchableOpacity style={styles.sendButton}><Send size={20} color="white" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontSize: 16, fontWeight: "bold" },
  userStatus: { fontSize: 12, color: "gray" },
  messageItem: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  messageAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  messageTextContainer: { flex: 1 },
  messageName: { fontWeight: "bold" },
  messageContent: { color: "gray" },
  messageTime: { fontSize: 12, color: "gray" },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#ddd" },
  iconButton: { padding: 10 },
  textInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 10 },
  sendButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 20 },
});
