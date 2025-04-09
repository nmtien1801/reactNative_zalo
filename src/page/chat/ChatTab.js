import React, { useState } from "react";
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

import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = height * 0.1;
const HEADER_HEIGHT = height * 0.08;
const FOOTER_HEIGHT = height * 0.08;
const AVATAR_SIZE = ITEM_HEIGHT * 0.6;
const MENU_WIDTH = width * 0.5;
const MENU_HEIGHT = height * 0.3;

const messages = [
  {
    id: "1",
    name: "Media Box",
    message: "Zing MP3: Lắng nghe Negav...",
    time: "",
    avatar: require("../../../assets/man.png"),
  },
  {
    id: "2",
    name: "Hiếu Lai",
    message: "cho xin UML của m đi",
    time: "2 giờ",
    avatar: require("../../../assets/man.png"),
  },
  {
    id: "3",
    name: "TTDT_NHÓM 1_TH",
    message: "Nhắc hẹn: deadline đi...",
    time: "5 giờ",
    avatar: require("../../../assets/man.png"),
  },
  {
    id: "4",
    name: "Hồ Mờ Hồ Và Những Người Bạn",
    message: "Hồ Minh Hậu: T về LA",
    time: "6 giờ",
    avatar: require("../../../assets/man.png"),
  },
];

const ChatTab = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
    >
       <SearchHeader option={'chatTab'}/>
      {/* Chat List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
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
            onPress={() => navigation.navigate("InboxScreen", { item })}
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
                {item.name}
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
