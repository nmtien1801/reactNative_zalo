import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Menu } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = height * 0.08;
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AddFriendModal from "./AddFriendModal";

export default function SearchHeader({ option, socketRef, onlineUsers }) {
  const navigation = useNavigation();
  const [showModalAddFriend, setShowModalAddFriend] = useState(false); // Modal thêm bạn
  const [menuVisible, setMenuVisible] = useState(false); // Trạng thái điều khiển hiển thị Menu

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

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

          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu}>
                <Icon
                  name="add"
                  size={HEADER_HEIGHT * 0.5}
                  color="white"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            }
            contentStyle={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 10,
              width: 240,
            }}
          >
            <Menu.Item
              onPress={() => {
                setShowModalAddFriend(true);
                closeMenu();
              }}
              title={
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
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
              }
            />
            <Menu.Item
              onPress={() => {
                navigation.navigate("CreateGroupTab");
                closeMenu();
              }}
              title={
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
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
              }
            />
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