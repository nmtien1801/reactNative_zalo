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

export default function PersonalTabs() {
  const personal = [
    {
      id: "1",
      name: "Game Center",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "2",
      name: "Tiện ích đời sống",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "3",
      name: "Tiện ích tài chính",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "4",
      name: "Dịch vụ công",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "5",
      name: "Mini App",
      avatar: require("../../../assets/favicon.png"),
    },
  ];

  const PersonalItem = ({ personal }) => (
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
        source={personal.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {personal.name}
        </Text>
      </View>
      <Icon
        name="chevron-forward-outline"
        size={18}
        color="black"
        style={{ marginRight: 10 }}
      />
    </TouchableOpacity>
  );

  return (
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
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../../assets/favicon.png")}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  marginRight: 10,
                }}
              />
              <Text style={{ fontSize: 16 }}>Lộc lá</Text>
            </View>
            <Icon
              name="swap-horizontal-outline"
              size={24}
              color="#2196F3"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        </>
      )}
      style={{ flex: 1, backgroundColor: "#fff" }}
      data={personal}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PersonalItem personal={item} />}
    />
  );
}

const styles = StyleSheet.create({});
