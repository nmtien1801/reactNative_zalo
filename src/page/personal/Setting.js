import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { logoutUser } from "../../redux/authSlice";
import { FontAwesome } from "@expo/vector-icons";

export default function Setting() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const personal = [
    {
      id: "1",
      name: "Đổi mật khẩu",
      icon: "lock",
    },
    {
      id: "2",
      name: "Đăng xuất",
      icon: "sign-out",
    },
  ];

  const handleItemPress = async (item) => {
    if (item.id === "1") {
      navigation.navigate("ChangePassword");
    } else if (item.id === "2") {
      const res = await dispatch(logoutUser());
      if (res.payload.EC === 2) {
        navigation.navigate("Login");
      }
    }
  };

  const PersonalItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.iconContainer}>
        <FontAwesome name={item.icon} size={20} color="#4F8EF7" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemText}>{item.name}</Text>
      </View>
      <FontAwesome name="angle-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={personal}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PersonalItem item={item} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  listContainer: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
