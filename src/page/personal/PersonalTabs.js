import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import SearchHeader from "../../component/Header";

export default function PersonalTabs() {
  const navigation = useNavigation();

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
      style={styles.item}
      onPress={() => {
        // Optional: navigate từng mục riêng biệt nếu bạn muốn
      }}
    >
      <Image source={personal.avatar} style={styles.avatarSmall} />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemText}>{personal.name}</Text>
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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <SearchHeader option={"person"} />

      <TouchableOpacity
              style={styles.headerItem}
              onPress={() => {
                console.log("Navigating to UserInfoScreen");
                navigation.navigate("UserInfoScreen");
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../../assets/favicon.png")}
                  style={styles.avatarLarge}
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
      <FlatList
        ListHeaderComponent={() => (
          <>
            {/* Lộc lá - Avatar lớn */}
          
          </>
        )}
        data={personal}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PersonalItem personal={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerItem: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    justifyContent: "space-between",
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
