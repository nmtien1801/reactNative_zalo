import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { getConversations } from "../../redux/chatSlice";

const { height } = Dimensions.get("window");
const HEADER_HEIGHT = height * 0.08;
const AVATAR_SIZE = height * 0.06;

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { socketRef, onlineUsers } = route.params || {};
  const user = useSelector((state) => state.auth.user);
  const conversationRedux = useSelector((state) => state.chat.conversations);
  const [conversations, setConversations] = useState([]);

  const [searchText, setSearchText] = useState("");

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

  useEffect(() => {
    if (!searchText) {
      dispatch(getConversations(user._id));
    } else {
      const lowerText = searchText.toLowerCase();
      const filtered = conversations.filter(
        (chat) =>
          (chat.username && chat.username.toLowerCase().includes(lowerText)) ||
          (chat.phone && chat.phone.includes(lowerText))
      );
      setConversations(filtered);
    }
  }, [searchText, conversationRedux]);

  const handleSelectUser = (item) => {
    navigation.navigate("InboxScreen", {
      item,
      socketRef,
      onlineUsers,
      conversations,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      {/* Thanh tìm kiếm */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#007bff",
          height: HEADER_HEIGHT,
          paddingHorizontal: 10,
          paddingTop: 5,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 10 }}
        >
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="#ccc"
          autoFocus
          style={{
            flex: 1,
            paddingHorizontal: 15,
            height: HEADER_HEIGHT * 0.6,
            fontSize: 15,
          }}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Danh sách kết quả */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 15,
              paddingVertical: 10,
              backgroundColor: "#fff",
              marginBottom: 5,
            }}
            onPress={() => handleSelectUser(item)}
          >
            <Image
              source={item.avatar}
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                marginRight: 15,
                backgroundColor: "#eee",
              }}
            />
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
              {item.username}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", padding: 20 }}>
            <Text style={{ color: "gray" }}>Không tìm thấy kết quả</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
