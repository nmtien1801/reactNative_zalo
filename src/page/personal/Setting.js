import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import SearchHeader from "../../component/Header";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { logoutUser } from "../../redux/authSlice";

export default function Setting() {
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const personal = [
    {
      id: "1",
      name: "Đổi mật khẩu",
    },
    {
      id: "2",
      name: "Đăng xuất",
    },
  ];

  const PersonalItem = ({ personal, onPress }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onPress(personal)}
    >
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{personal.name}</Text>
      </View>
      <Icon name="chevron-forward-outline" size={18} color="#666" />
    </TouchableOpacity>
  );

  const handleItemPress = async (item) => {
    if (item.id === "1") {
      navigation.navigate("ChangePassword");
    } else if (item.id === "2") {
      let res = await dispatch(logoutUser());
      if (res.payload.EC === 2) {
        navigation.navigate("Login");
      }
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={personal}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PersonalItem personal={item} onPress={handleItemPress} />
        )}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flatList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
