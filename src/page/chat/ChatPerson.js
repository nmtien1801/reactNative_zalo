import React, { useState } from "react";
import { View, Text, Image, TextInput, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { Avatar, IconButton } from "react-native-paper";
import { Smile, Paperclip, Send, BellOff, Pin, Users, Trash2, AlertTriangle } from "lucide-react-native";

export default function ChatInterface() {
  const [conversations] = useState([
    { id: 1, name: "Võ Trường Khang", message: "[Thông báo] Giới thiệu về Trường Kha...", time: "26/07/24", avatar: require("../../../assets/favicon.png") },
    { id: 2, name: "Thu", message: "[Thông báo] Giới thiệu thêm Thu", time: "23/07/24", avatar: require("../../../assets/favicon.png") },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Chat Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "white" }}>
        <Avatar.Image source={require("../../../assets/favicon.png")} size={40} />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Võ Trường Khang</Text>
          <Text style={{ color: "gray" }}>Hoạt động 2 giờ trước</Text>
        </View>
      </View>

      {/* Chat Content */}
      <ScrollView style={{ flex: 1, padding: 10 }}>
        {/* Danh sách tin nhắn (chưa có dữ liệu) */}
      </ScrollView>

      {/* Message Input */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "white" }}>
        <IconButton icon={() => <Smile size={24} />} onPress={() => {}} />
        <IconButton icon={() => <Paperclip size={24} />} onPress={() => {}} />
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 10 }}
          placeholder="Nhập tin nhắn..."
        />
        <IconButton icon={() => <Send size={24} color="blue" />} onPress={() => {}} />
      </View>

      {/* Sidebar (Tạm thời bỏ qua vì React Native không có sidebar giống như web) */}
    </View>
  );
}
