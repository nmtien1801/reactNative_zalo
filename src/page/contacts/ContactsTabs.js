import React, { useState , useEffect} from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import SearchHeader from "../../component/Header";
import { getConversations } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

const TopTab = createMaterialTopTabNavigator();

export default function ContactsTabs() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const conversationRedux = useSelector((state) => state.chat.conversations);
  const user = useSelector((state) => state.auth.user);

  const [conversations, setConversations] = useState([]);

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
        };
      });

      setConversations(_conversations);
    }
  }, [conversationRedux]);

  const FriendItem = ({ friend }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
      }}
    >
      <Image
        source={friend.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <Text style={{ flex: 1, fontSize: 16 }}>{friend.username}</Text>
      <TouchableOpacity>
        <Icon
          name="call"
          size={24}
          color="#2196F3"
          style={{ marginRight: 15 }}
        />
      </TouchableOpacity>
      <TouchableOpacity>
        <Icon name="videocam" size={24} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );

  const FriendsScreen = () => (
    <FlatList
      style={{ flex: 1, backgroundColor: "#fff" }}
      ListHeaderComponent={() => (
        <>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              padding: 10,
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
            onPress={() => navigation.navigate('FriendRequest')}
          >
            <Icon
              name="person-add-outline"
              size={24}
              color="#2196F3"
              style={{ marginRight: 10 }}
            />
            <Text style={{ fontSize: 16 }}>Lời mời kết bạn (1)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              padding: 10,
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Icon
              name="book-outline"
              size={24}
              color="#2196F3"
              style={{ marginRight: 10 }}
            />
            <Text style={{ fontSize: 16 }}>Danh bạ máy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              padding: 10,
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Icon
              name="gift-outline"
              size={24}
              color="red"
              style={{ marginRight: 10 }}
            />
            <Text style={{ fontSize: 16, color: "red" }}>
              Sinh nhật - Hôm nay là sinh nhật Hải Nam
            </Text>
          </TouchableOpacity>
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "bold" }}>
            Bạn thân
          </Text>
        </>
      )}
      data={conversations}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <FriendItem friend={item} />}
    />
  );

  const groups = [
    {
      id: "1",
      name: "Nhóm React Native",
      members: 12,
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "2",
      name: "Nhóm Java Spring",
      members: 20,
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "3",
      name: "Nhóm Python AI",
      members: 15,
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "4",
      name: "Nhóm UI/UX",
      members: 8,
      avatar: require("../../../assets/favicon.png"),
    },
  ];

  const GroupItem = ({ group }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
      }}
    >
      <Image
        source={group.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{group.name}</Text>
        <Text style={{ fontSize: 14, color: "gray" }}>
          {group.members} thành viên
        </Text>
      </View>
      <Text style={{ fontSize: 14, color: "gray" }}>{group.members}</Text>
    </TouchableOpacity>
  );

  const GroupsScreen = () => (
    <FlatList
      ListHeaderComponent={() => (
        <>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              padding: 10,
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Icon
              name="person-add-outline"
              size={50}
              color="#2196F3"
              style={{ marginRight: 10 }}
            />
            <Text style={{ fontSize: 16 }}>Tạo nhóm mới</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              padding: 10,
              alignItems: "center",
              borderColor: "#ddd",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ margin: 10, fontSize: 18, fontWeight: "bold" }}>
              Nhóm đang tham gia(4)
            </Text>
            <TouchableOpacity>
              <Icon name="funnel-outline" size={24} color="#2196F3" />
            </TouchableOpacity>
          </TouchableOpacity>
        </>
      )}
      style={{ flex: 1, backgroundColor: "#fff" }}
      data={groups}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <GroupItem group={item} />}
    />
  );

  const qa = [
    {
      id: "1",
      name: "Zalo Pay",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "2",
      name: "zStyle - Phong cách ZaloZalo",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "3",
      name: "Báo tuổi trẻ",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "4",
      name: "Điện lực",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "5",
      name: "Thời tiết",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "6",
      name: "Zing MP3",
      avatar: require("../../../assets/favicon.png"),
    },
  ];

  const QAItem = ({ qa }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
      }}
    >
      <Image
        source={qa.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{qa.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const QAScreen = () => (
    <FlatList
      ListHeaderComponent={() => (
        <>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              padding: 10,
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Icon
              name="radio-outline"
              size={50}
              color="#2196F3"
              style={{ marginRight: 10 }}
            />
            <Text style={{ fontSize: 16 }}>Tìm thêm Offical Account</Text>
          </TouchableOpacity>
        </>
      )}
      style={{ flex: 1, backgroundColor: "#fff" }}
      data={qa}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <QAItem qa={item} />}
    />
  );

  return (
    <View>
      <SearchHeader option={"contact"} />

      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#2196F3",
          tabBarInactiveTintColor: "gray",
          tabBarIndicatorStyle: { backgroundColor: "#2196F3" },
        }}
      >
        <TopTab.Screen name="Bạn bè" component={FriendsScreen} />
        <TopTab.Screen name="Nhóm" component={GroupsScreen} />
        <TopTab.Screen name="QA" component={QAScreen} />
      </TopTab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({});
