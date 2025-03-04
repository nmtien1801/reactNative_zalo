import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function SearchHeader() {
  return (
    <View
      style={{
        padding: 10,
        backgroundColor: "#2196F3",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Icon name={"search"} size={18} color={"#fff"} />
      <TextInput
        placeholder="Tìm kiếm"
        placeholderTextColor="#fff"
        style={{
          width: "40%",
          borderRadius: 20,
          paddingHorizontal: 15,
          height: 40,
          marginRight: 20,
        }}
      />
      <Icon name="qr-code" size={24} color={"#fff"} marginRight={10} />
      <Icon
        name="person-add-outline"
        size={24}
        color={"#fff"}
        marginRight={10}
      />
      <Icon
        name="notifications-outline"
        size={24}
        color={"#fff"}
        marginRight={10}
      />
      <Icon name="settings-outline" size={24} color={"#fff"} marginRight={10} />
      <Icon name="image-outline" size={24} color={"#fff"} marginRight={10} />
      <Icon name={"add"} size={32} color={"#fff"} marginRight={10} />
    </View>
  );
}

const styles = StyleSheet.create({});
