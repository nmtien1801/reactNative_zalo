import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get("window");

const ITEM_HEIGHT = height * 0.1;
const HEADER_HEIGHT = height * 0.08;
const FOOTER_HEIGHT = height * 0.08;
const AVATAR_SIZE = ITEM_HEIGHT * 0.6;
const MENU_WIDTH = width * 0.5;
const MENU_HEIGHT = height * 0.3;
const contacts = [
  { id: "1", name: "A quỳnh", avatar: "https://via.placeholder.com/50" },
  { id: "2", name: "Bắc Hoan", avatar: "https://via.placeholder.com/50" },
  { id: "3", name: "Bảo Thông", avatar: "https://via.placeholder.com/50" },
  { id: "4", name: "Chung Tấn Phát", avatar: "https://via.placeholder.com/50" },
];


const FriendScreen = () => {
  const navigation = useNavigation();
  
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 30 }}>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#007bff", height: HEADER_HEIGHT, paddingHorizontal: 15 }}>
          <TouchableOpacity>
            <Image source={require("./assets/search.png")} style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="#ccc"
            style={{ flex: 1, paddingHorizontal: 15, height: HEADER_HEIGHT * 0.6, fontSize: 15 }}
             onPress = {() => {navigation.navigate("SearchScreen")}}
          />
          <TouchableOpacity>
            <Icon name="person-add" size={26} color="white" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

    {/* Tabs */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", backgroundColor: "white", height: 40, borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
      
          <TouchableOpacity onPress={() => navigation.navigate("FriendScreen")} style = {{width: "50%", height: "100%", borderBottomWidth: 1, borderBlockColor: "blue", justifyContent: "center"}}>
          <Text style={{ fontWeight: "bold", textAlign: "center"  }}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GroupScreen")} style = {{width: "50%", height: "100%", justifyContent: "center"}}>
          <Text style={{ fontWeight: "bold", textAlign: "center"}}>Nhóm</Text>
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View style={{ backgroundColor: "white", padding: 15 }}>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
          <Icon name="group" size={24} color="#007bff" style={{ marginRight: 10 }} />
          <Text>Lời mời kết bạn (15)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
          <Icon name="contacts" size={24} color="#007bff" style={{ marginRight: 10 }} />
          <Text>Danh bạ máy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
          <Icon name="event" size={24} color="#007bff" style={{ marginRight: 10 }} />
          <Text>Sinh nhật</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", backgroundColor: "white", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
        <TouchableOpacity><Text style={{ fontWeight: "bold" }}>Tất cả 81</Text></TouchableOpacity>
        <TouchableOpacity><Text style={{ color: "gray" }}>Bạn mới 1</Text></TouchableOpacity>
        <TouchableOpacity><Text style={{ color: "gray" }}>Mới truy cập 10</Text></TouchableOpacity>
      </View>

      {/* Contacts List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style = {{flexDirection: "row",  padding: 10, justifyContent: "space-between", alignItems: "center", borderWidth: 0.5}}>
          <TouchableOpacity style={{ flexDirection: "row", width: "80%", alignItems: "center"}}>
            <Image source={require("./assets/man.png")} />
            <Text style={{ fontSize: 16, marginLeft: 10 }}>{item.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="call" size={24} color="#007bff" />
          </TouchableOpacity>  
            <TouchableOpacity>
            <Icon name="videocam" size={24} color="#007bff" />
          </TouchableOpacity>  
     </View>
        )}
      />

      {/* Footer */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 50, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#ccc" }}>
        <TouchableOpacity  onPress = {() => {navigation.navigate("ChatScreen")}}>
          <Icon name="chat" size={24} color="#7a7a7a" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="contacts" size={24} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="history" size={24} color="#7a7a7a" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="person" size={24} color="#7a7a7a" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FriendScreen;