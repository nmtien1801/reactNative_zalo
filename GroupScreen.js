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


const groups = [
  { id: "1", name: "TTDT_NHÓM 1_TH", lastMessage: "Nhắc hẹn..." },
  { id: "2", name: "Nhóm 07_Kiến trúc", lastMessage: "demo" },
];

const GroupScreen = () => {
  const navigation = useNavigation();
  
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 30}}>

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
        <TouchableOpacity onPress={() => navigation.navigate("FriendScreen")} style = {{width: "50%", height: "100%", justifyContent: "center"}}>
          <Text style={{ fontWeight: "bold", textAlign: "center"  }}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GroupScreen")} style = {{width: "50%", height: "100%", borderBottomWidth: 1, borderBlockColor: "blue", justifyContent: "center"}}>
          <Text style={{ fontWeight: "bold", textAlign: "center"}}>Nhóm</Text>
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View style={{ backgroundColor: "white", padding: 15 }}>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
           <Image source={require("./assets/add-group.png")} style={{ marginRight: 10 }} />
          <Text>Tạo nhóm mới</Text>
        </TouchableOpacity>
    
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "white", padding: 10, borderBottomColor: "#ccc" }}>
        <Text> Nhóm đang tham gia (80)</Text>
        <TouchableOpacity><Text style={{ color: "gray" }}>Sắp xếp</Text></TouchableOpacity>
      </View>

      {/* Contacts List */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
        
          <TouchableOpacity style={{ flexDirection: "row",  padding: 10, alignItems: "center", borderWidth: 0.5}}>
            <Image source={require("./assets/man.png")} />
            <Text style={{ fontSize: 16, marginLeft: 10 }}>{item.name}</Text>
            <Text style = {{position: "absolute", top: 10, right: 10}}>10 giờ</Text>
          </TouchableOpacity>
        
     
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

export default GroupScreen;