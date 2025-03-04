import React from 'react';
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, Dimensions, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = height * 0.1;
const HEADER_HEIGHT = height * 0.08;
const FOOTER_HEIGHT = height * 0.08;
const AVATAR_SIZE = ITEM_HEIGHT * 0.6;
const MENU_WIDTH = width * 0.5;
const MENU_HEIGHT = height * 0.3;

const contacts = [
  { name: 'DHKHMT18-QLDA', count: 83 },
  { name: 'Nhóm 08 - QLDA', count: 6 },
  { name: 'Quỳnh Giang', count: null },
];

const quickAccess = [
  { name: 'Ví QR', icon: '📱' },
  { name: 'Zalo Video', icon: '🎥' },
  { name: 'Thêm', icon: '+' },
];

const searchHistory = ['h', 'qlda', 'bảo', 'giang', 'qld'];

const SearchScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ backgroundColor: '#f8f8f8', marginTop: 30 }}>
      {/* Thanh tìm kiếm */}

      <View style = {{flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#007bff",  height: HEADER_HEIGHT, paddingHorizontal: 15, justifyContent: "space-between" }}>
      <TouchableOpacity onPress = {() => {navigation.goBack()}}> 
       <Icon name="arrow-back" size={24} color="#7a7a7a" />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, width: "75%" }}>
           <Icon name="search" size={24} color="#7a7a7a"  style = {{marginLeft: 5}}/>
        <TextInput placeholder="Tìm kiếm" style={{ flex: 1, fontSize: 16, marginLeft: 5 }} />
      </View>

      <TouchableOpacity>
            <Image source={require("./assets/qr.png")}  />
      </TouchableOpacity>

      </View>




      {/* Liên hệ đã tìm */}
      <Text style={{ marginTop: 40, fontWeight: 'bold', padding: 10}}>Liên hệ đã tìm</Text>
      <FlatList
        data={contacts}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity style={{ alignItems: 'center', margin: 10 }}>
            <View style={{ width: 50, height: 50, backgroundColor: '#ddd', borderRadius: 25 }} />
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

  

      {/* Từ khóa đã tìm */}
      <Text style={{ marginTop: 40, fontWeight: 'bold',  padding: 10 }}>Từ khóa đã tìm</Text>
      {searchHistory.map((keyword, index) => (
        <TouchableOpacity key={index} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
           <Icon name="search" size={24} color="#7a7a7a" />
          <Text style={{ marginLeft: 10, fontSize: 16 }}>{keyword}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

export default SearchScreen;
