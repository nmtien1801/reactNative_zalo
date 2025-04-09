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
import SearchHeader from "../../component/Header";

export default function DiscoveryTabs() {
  const discovery = [
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

  const DiscoveryItem = ({ discovery }) => (
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
        source={discovery.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {discovery.name}
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
    <View>
      <SearchHeader option={'discovery'}/>

      <FlatList
        ListHeaderComponent={() => (
          <>
            {/* <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: "#ddd" }}>
                       <Icon name="radio-outline" size={50} color="#2196F3" style={{ marginRight: 10 }} />
                       <Text style={{ fontSize: 16 }}>Tìm thêm Offical Account</Text>
                     </TouchableOpacity> */}
          </>
        )}
        style={{ flex: 1, backgroundColor: "#fff" }}
        data={discovery}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DiscoveryItem discovery={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
