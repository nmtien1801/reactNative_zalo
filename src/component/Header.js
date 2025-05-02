import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = height * 0.08;
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AddFriendModal from './AddFriendModal'

export default function SearchHeader({ option, socketRef, onlineUsers }) {
  const navigation = useNavigation();
  const [showModalAddFriend, setShowModalAddFriend] = useState(false); // modal thêm bạn
 
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007bff",
        height: HEADER_HEIGHT,
        paddingHorizontal: 15,
      }}
    >
      <TouchableOpacity>
        <Image
          source={require("../../assets/search.png")}
          style={{ marginRight: 10 }}
        />
      </TouchableOpacity>

      <TextInput
        placeholder="Tìm kiếm"
        placeholderTextColor="#ccc"
        style={{
          flex: 1,
          paddingHorizontal: 15,
          height: HEADER_HEIGHT * 0.6,
          fontSize: 15,
        }}
        onFocus={() =>
          navigation.navigate("SearchScreen", {
            socketRef,
            onlineUsers,
          })
        }
      />

      {option === "person" && (
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="black"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      )}

      {option !== "person" && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity>
            <Image
              source={require("../../assets/qr.png")}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>

          <Menu>
            <MenuTrigger>
              <Icon
                name="add"
                size={HEADER_HEIGHT * 0.5}
                color="white"
                style={{ marginLeft: 10 }}
              />
            </MenuTrigger>
            <MenuOptions
              optionsContainerStyle={{
                width: 240,
                borderRadius: 10,
                backgroundColor: "white",
                padding: 10,
              }}
            >
               <MenuOption onSelect={() => setShowModalAddFriend(true)}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Icon
                    name="person-add"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 16 }}>Thêm bạn</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => navigation.navigate("CreateGroupTab")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <FontAwesome5
                    name="users"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                    solid
                  />
                  <Text style={{ fontSize: 16 }}>Tạo nhóm</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Gửi danh bạ")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <FontAwesome5
                    name="address-book"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                    solid
                  />
                  <Text style={{ fontSize: 16 }}>Gửi danh bạ</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Lịch Zalo")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <FontAwesome5
                    name="calendar-alt"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                    solid
                  />
                  <Text style={{ fontSize: 16 }}>Lịch Zalo</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Tạo cuộc gọi nhóm")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <FontAwesome5
                    name="phone"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                    solid
                  />
                  <Text style={{ fontSize: 16 }}>Tạo cuộc gọi nhóm</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Thiết bị đăng nhập")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <FontAwesome5
                    name="laptop"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                    solid
                  />
                  <Text style={{ fontSize: 16 }}>Thiết bị đăng nhập</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
          <AddFriendModal
            show={showModalAddFriend}
            onHide={() => setShowModalAddFriend(false)}
            socketRef={socketRef}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
