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
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = height * 0.08;

export default function SearchHeader() {
  const navigation = useNavigation();
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
        onPress={() => navigation.navigate("SearchScreen")}
      />

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
          <MenuOption onSelect={() => alert("Thêm bạn")}>
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
          <MenuOption onSelect={() => alert("Tạo nhóm")}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
              }}
            >
              <Icon
                name="group-add"
                size={20}
                color="black"
                style={{ marginRight: 10 }}
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
              <Icon
                name="contacts"
                size={20}
                color="black"
                style={{ marginRight: 10 }}
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
              <Icon
                name="event"
                size={20}
                color="black"
                style={{ marginRight: 10 }}
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
              <Icon
                name="call"
                size={20}
                color="black"
                style={{ marginRight: 10 }}
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
              <Icon
                name="devices"
                size={20}
                color="black"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16 }}>Thiết bị đăng nhập</Text>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({});
