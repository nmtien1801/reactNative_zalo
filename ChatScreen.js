import React, { useState } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, Dimensions, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = height * 0.1;
const HEADER_HEIGHT = height * 0.08;
const FOOTER_HEIGHT = height * 0.08;
const AVATAR_SIZE = ITEM_HEIGHT * 0.6;
const MENU_WIDTH = width * 0.5;
const MENU_HEIGHT = height * 0.3;

const messages = [
  { id: "1", name: "Media Box", message: "Zing MP3: Lắng nghe Negav...", time: "", avatar: "https://via.placeholder.com/50" },
  { id: "2", name: "Hiếu Lai", message: "cho xin UML của m đi", time: "2 giờ", avatar: "https://via.placeholder.com/50" },
  { id: "3", name: "TTDT_NHÓM 1_TH", message: "Nhắc hẹn: deadline đi...", time: "5 giờ", avatar: "https://via.placeholder.com/50" },
  { id: "4", name: "Hồ Mờ Hồ Và Những Người Bạn", message: "Hồ Minh Hậu: T về LA", time: "6 giờ", avatar: "https://via.placeholder.com/50" },
];

const ChatScreen = () => {
  const navigation = useNavigation();
  return (
    <MenuProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 30}}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#007bff", height: HEADER_HEIGHT, paddingHorizontal: 15 }}>
          <TouchableOpacity>
            <Image source={require("./assets/search.png")} style={{ marginRight: 10}} />
          </TouchableOpacity>
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="#ccc"
            style={{ flex: 1, paddingHorizontal: 15, height: HEADER_HEIGHT * 0.6, fontSize: 15 }}
            onPress = {() => {navigation.navigate("SearchScreen")}}
          />
          <TouchableOpacity>
            <Image source={require("./assets/qr.png")} style={{ marginLeft: 10 }} />
          </TouchableOpacity>
          
   <Menu>
            <MenuTrigger>
              <Icon name="add" size={HEADER_HEIGHT * 0.5} color="white" style={{ marginLeft: 10 }} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{ width: 240, borderRadius: 10, backgroundColor: "white", padding: 10 }}>
              <MenuOption onSelect={() => alert("Thêm bạn")}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                  <Icon name="person-add" size={20} color="black" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16 }}>Thêm bạn</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Tạo nhóm")}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                  <Icon name="group-add" size={20} color="black" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16 }}>Tạo nhóm</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Gửi danh bạ")}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                  <Icon name="contacts" size={20} color="black" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16 }}>Gửi danh bạ</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Lịch Zalo")}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                  <Icon name="event" size={20} color="black" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16 }}>Lịch Zalo</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Tạo cuộc gọi nhóm")}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                  <Icon name="call" size={20} color="black" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16 }}>Tạo cuộc gọi nhóm</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Thiết bị đăng nhập")}> 
                <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                  <Icon name="devices" size={20} color="black" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16 }}>Thiết bị đăng nhập</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>

        {/* Chat List */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "white", marginBottom: 2, height: ITEM_HEIGHT }}>
              <Image source={{ uri: item.avatar }} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, marginRight: 15 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</Text>
                <Text style={{ color: "gray" }}>{item.message}</Text>
              </View>
              {item.time && <Text style={{ color: "gray" }}>{item.time}</Text>}
            </TouchableOpacity>
          )}
        />

        {/* Footer */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 50, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#ccc" }}>
        <TouchableOpacity>
          <Icon name="chat" size={24} color="#7a7a7a" />
        </TouchableOpacity>
        <TouchableOpacity onPress = {() => {navigation.navigate("FriendScreen")}}>
          <Icon name="contacts" size={24} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="history" size={24} color="#7a7a7a" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="person" size={24} color="#7a7a7a" />
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </MenuProvider>
  );
};

export default ChatScreen;