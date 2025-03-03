import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Search, ImageIcon, File, LinkIcon } from "lucide-react-native";
import ChatPerson from "./ChatPerson";
import ChatGroup from "./ChatGroup";

export default function ChatInterface() {
  const [conversations] = useState([
    {
      id: 1,
      name: "Võ Trường Khang",
      message: "[Thông báo] Giới thiệu về Trường Kha...",
      time: "26/07/24",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: 2,
      name: "Thu",
      message: "[Thông báo] Giới thiệu thêm Thu",
      time: "23/07/24",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: 3,
      name: "IGH - DHKTPMTB - CT7",
      message: "Võ Văn Hòa, Dung",
      time: "20/07/24",
      avatar: require("../../../assets/favicon.png"),
    },
  ]);

  const [isChatGroup, setIsChatGroup] = useState(false);

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.sidebar}>
        {/* Profile and Search */}
        <View style={styles.searchContainer}>
          <Image
            source={require("../../../assets/favicon.png")}
            style={styles.avatar}
          />
          <View style={styles.searchBox}>
            <TextInput style={styles.searchInput} placeholder="Tìm kiếm" />
            <Search size={16} color="#888" />
          </View>
        </View>

        {/* Conversations List */}
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => setIsChatGroup(!isChatGroup)}
            >
              <Image source={item.avatar} style={styles.chatAvatar} />
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatMessage}>{item.message}</Text>
              </View>
              <Text style={styles.chatTime}>{item.time}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Chat Screen */}
      <View style={styles.chatScreen}>
        {isChatGroup ? <ChatGroup /> : <ChatPerson />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#fff" },
  sidebar: { width: 300, borderRightWidth: 1, borderColor: "#ddd", backgroundColor: "#fff" },
  searchContainer: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", flex: 1, backgroundColor: "#e9ecef", padding: 8, borderRadius: 5 },
  searchInput: { flex: 1 },
  chatItem: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  chatAvatar: { width: 48, height: 48, borderRadius: 24 },
  chatInfo: { flex: 1, marginLeft: 10 },
  chatName: { fontWeight: "bold" },
  chatMessage: { color: "#777" },
  chatTime: { color: "#aaa", fontSize: 12 },
  chatScreen: { flex: 1, backgroundColor: "#f8f9fa" },
});
